// This preload runs in the *webview guest* context. It exposes a small bridge
// so host (renderer) can call `window.__celestial.receiveMessage(msg)` and
// guest will react and then call ipcRenderer.sendToHost('gai-response', payload)

const { ipcRenderer } = require('electron');

// Safe guard: expose a small API on window
window.__celestial = {
  async receiveMessage(msg) {
    try {
      if (!msg || !msg.type) return;

      if (msg.type === 'send-query') {
        // try to paste/enter the query into the page's input and submit
        await runSendQuery(msg.query || '');
        // then start observer to wait for response
        const payload = await observeAssistantResponse();
        ipcRenderer.sendToHost('gai-response', payload);
      }

      if (msg.type === 'extract-only') {
        const payload = await observeAssistantResponse({ extractOnly: true });
        ipcRenderer.sendToHost('gai-response', payload);
      }

    } catch (err) {
      ipcRenderer.sendToHost('gai-response', { success: false, error: err?.message || String(err) });
    }
  }
};

// Helper: find input (contenteditable or textarea), set value and send
async function runSendQuery(query) {
  function dispatchEvents(el) {
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  const attempt = () => {
    // contenteditable inputs (common pattern)
    let input = document.querySelector('[contenteditable="true"]');
    if (input) {
      input.focus();
      // Replace content - careful with innerHTML on some apps
      try { input.innerText = query; } catch(e) { input.textContent = query; }
      dispatchEvents(input);
      // try find a send button
      const sendBtn = document.querySelector('button[aria-label*="Send"], button[aria-label*="send"], button[title*="Send"]');
      if (sendBtn) { sendBtn.click(); return true; }
      // fallback: simulate Enter
      const evt = new KeyboardEvent('keydown', { bubbles:true, cancelable:true, key: 'Enter', code: 'Enter' });
      input.dispatchEvent(evt);
      return true;
    }

    // textarea or input
    input = document.querySelector('textarea, input[type="search"], input[type="text"]');
    if (input) {
      input.focus();
      input.value = query;
      dispatchEvents(input);
      // try Enter
      const evt = new KeyboardEvent('keydown', { bubbles:true, cancelable:true, key: 'Enter', code: 'Enter' });
      input.dispatchEvent(evt);
      // try clicking send
      const sendBtn = document.querySelector('button[aria-label*="Send"], button[title*="Send"]');
      if (sendBtn) { sendBtn.click(); }
      return true;
    }

    return false;
  };

  // attempt a few times (page might swap inputs on focus)
  for (let i = 0; i < 4; i++) {
    const ok = attempt();
    if (ok) return true;
    await new Promise(r => setTimeout(r, 300));
  }
  throw new Error('Could not find chat input on page');
}

// Helper: observe assistant response and extract html/text/links
function observeAssistantResponse(opts = { timeoutMs: 20000, extractOnly: false }) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ success: false, error: 'timeout waiting for assistant response' });
    }, opts.timeoutMs || 20000);

    try {
      // Candidate container selectors to find assistant messages
      const containerSelectors = ['main', '#main', 'body', 'div[role="main"]'];
      let root = null;
      for (const s of containerSelectors) {
        const el = document.querySelector(s);
        if (el) { root = el; break; }
      }
      if (!root) root = document.body;

      // find existing assistant nodes, then watch for new ones
      const isAssistantNode = (node) => {
        try {
          // heuristics: node contains long text, or role article
          if (!node) return false;
          if (node.getAttribute && node.getAttribute('role') === 'article') return true;
          const txt = node.innerText || '';
          return txt.length > 20;
        } catch (e) { return false; }
      };

      // attempt instant extraction first (if content already exists)
      const candidates = Array.from(root.querySelectorAll('div, section, article')).filter(isAssistantNode);
      if (candidates.length) {
        const node = candidates[candidates.length - 1];
        const payload = extractFromNode(node);
        clearTimeout(timeout);
        return resolve({ success: true, ...payload });
      }

      // otherwise attach a MutationObserver
      let lastSnapshot = null;
      const observer = new MutationObserver((mutations) => {
        const nodes = Array.from(root.querySelectorAll('div, section, article')).filter(isAssistantNode);
        if (!nodes.length) return;
        const node = nodes[nodes.length - 1];
        const snapshot = node.innerText?.trim?.();
        if (snapshot && snapshot !== lastSnapshot) {
          lastSnapshot = snapshot;
          // wait a short while for the node to stabilize
          setTimeout(() => {
            const payload = extractFromNode(node);
            observer.disconnect();
            clearTimeout(timeout);
            resolve({ success: true, ...payload });
          }, 600);
        }
      });

      observer.observe(root, { childList: true, subtree: true, characterData: true });

    } catch (err) {
      clearTimeout(timeout);
      resolve({ success: false, error: err?.message || String(err) });
    }
  });
}

function extractFromNode(node) {
  try {
    const answerHtml = node.innerHTML || '';
    const answerText = node.innerText || '';
    const anchors = Array.from(node.querySelectorAll('a')) || [];
    const sources = anchors.map(a => ({ title: a.innerText || a.getAttribute('aria-label') || a.href, url: a.href })).filter(s => s.url);
    // remove duplicates
    const seen = new Set();
    const uniq = [];
    for (const s of sources) {
      if (!seen.has(s.url)) { seen.add(s.url); uniq.push(s); }
    }
    return { answerHtml, answerText, sources: uniq, timestamp: Date.now() };
  } catch (e) {
    return { answerHtml: '', answerText: '', sources: [], error: e?.message || String(e) };
  }
}

    