// This is the snippet used by the guest preload or by executeJavaScript fallback.
// It is similar to the logic in preload-webview.js but provided here for clarity.

(async function extractGAI(){
  try {
    const root = document.querySelector('main') || document.body;
    const nodes = Array.from(root.querySelectorAll('div, section, article')).filter(n=> (n.innerText||'').length>20);
    if (!nodes.length) return { success:false, error:'no assistant nodes' };
    const node = nodes[nodes.length-1];
    const answerHtml = node.innerHTML;
    const answerText = node.innerText;
    const anchors = Array.from(node.querySelectorAll('a')).map(a=>({title:a.innerText||a.href, url:a.href}));
    return { success:true, answerHtml, answerText, sources: anchors };
  } catch(e){ return { success:false, error: String(e) }; }
})();

    