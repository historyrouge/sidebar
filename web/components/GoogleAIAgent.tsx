'use client';

import React, { useRef, useState, useEffect } from 'react';

type GAIResponse = {
  success: boolean;
  answerHtml?: string;
  answerText?: string;
  sources?: { title?: string; url: string }[];
  error?: string;
};

type SERPResult = {
  title: string;
  link: string;
  snippet: string;
  domain: string;
};

const DEFAULT_GAI_URL = 'https://ai.google/';

export default function GoogleAIAgent() {
  const webviewRef = useRef<any>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);

  // --- Start of User-Provided Robust Handler ---
  const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

  async function execWithTimeout(webview: any, script: string, timeout = 8000) {
    if (!webview) return null;
    return new Promise(resolve => {
      let done = false;
      const t = setTimeout(() => { if (!done) { done = true; resolve(null); } }, timeout);
      try {
        webview.executeJavaScript(script, true).then((res: any) => {
          if (!done) { done = true; clearTimeout(t); resolve(res); }
        }).catch((e: any) => { if (!done) { done = true; clearTimeout(t); console.error("exec error", e); resolve(null); } });
      } catch (e) { if (!done) { done = true; clearTimeout(t); console.error("exec error outer", e); resolve(null); } }
    });
  }

  const SERP_SCRIPT = `(() => {
    try {
      const results = [];
      const seen = new Set();
      const norm = u => { try { return new URL(u, location.href).href } catch(e){ return String(u) } };
      const domainOf = u => { try { return new URL(u).hostname.replace(/^www\\./,'') } catch(e){ return '' } };
      const selectors = ['div.tF2Cxc','div.g','div[data-hveid]','div.yuRUbf','div.ZINbbc'];
      let nodes = [];
      for (const s of selectors) { nodes = Array.from(document.querySelectorAll(s)); if (nodes.length) break; }
      if (!nodes.length) nodes = Array.from(document.querySelectorAll('div')).filter(d => (d.querySelector && d.querySelector('a') && d.querySelector('h3'))).slice(0,30);
      for (const node of nodes) {
        try {
          const a = node.querySelector('a[href]');
          const h3 = node.querySelector('h3') || node.querySelector('a > div > h3');
          if (!a || !h3) continue;
          const title = (h3.innerText || '').trim();
          const link = norm(a.href);
          if (!title || !link || seen.has(link)) continue;
          const snippetEl = node.querySelector('.VwiC3b, .IsZvec, .aCOpRe, .st, .yDYNvb') || node.querySelector('span');
          const snippet = snippetEl ? snippetEl.innerText.trim() : '';
          seen.add(link);
          results.push({ title, link, snippet, domain: domainOf(link) });
        } catch(e) { continue; }
        if (results.length >= 8) break;
      }
      if (results.length < 3) {
        const feat = document.querySelector('.kp-blk, .xpdopen, .LGOjhe, .ifM9O');
        if (feat) {
          const t = feat.querySelector('h2, h3')?.innerText?.trim() || document.title;
          const s = feat.querySelector('.hgKElc, .bVj5Zb, .LGOjhe')?.innerText?.trim() || feat.innerText?.slice(0,300);
          const link = location.href;
          if (t) results.unshift({ title: t, link, snippet: s, domain: location.hostname });
        }
      }
      return results;
    } catch (err) { return []; }
  })()`;
  
  const GAI_SCRIPT_TEMPLATE = `(async function(userQuery){
    try {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      const dispatch = (el,name) => el && el.dispatchEvent(new Event(name,{bubbles:true}));
      let input = document.querySelector('[contenteditable="true"]') || document.querySelector('textarea') || document.querySelector('input[type="search"]') || document.querySelector('input[type="text"]');
      if (!input) return { success:false, error:'no input found' };
      if (input.isContentEditable) { input.focus(); try{ input.innerText = userQuery }catch(e){ input.textContent = userQuery } dispatch(input,'input'); }
      else { input.focus(); input.value = userQuery; dispatch(input,'input'); dispatch(input,'change'); }
      const sendBtn = document.querySelector('button[aria-label*="Send"], button[title*="Send"], button:has(svg)') || Array.from(document.querySelectorAll('button')).find(b=>/send|reply|submit/i.test(b.innerText));
      if (sendBtn) sendBtn.click(); else input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true}));
      const root = document.querySelector('main') || document.body;
      let lastText = '';
      const t0 = Date.now();
      while (Date.now() - t0 < 25000) {
        const nodes = Array.from(root.querySelectorAll('div, section, article')).filter(n => (n.innerText||'').length > 20);
        if (nodes.length) {
          const node = nodes[nodes.length - 1];
          const txt = (node.innerText || '').trim();
          if (txt && txt !== lastText) { lastText = txt; await sleep(700); const stable = (node.innerText||'').trim(); if (stable === lastText) {
            const anchors = Array.from(node.querySelectorAll('a[href]')).map(a=>({ title: a.innerText || a.getAttribute('aria-label') || a.href, url: a.href }));
            return { success:true, answerHtml: node.innerHTML, answerText: stable, sources: anchors, timestamp: Date.now() };
          } }
        }
        await sleep(300);
      }
      return { success:false, error:'timeout waiting for AI response' };
    } catch(e){ return { success:false, error: String(e) }; }
  })`;

  const BLOCK_DETECT = `(() => {
    try {
      const signin = !!document.querySelector('input[type="email"], form[action*="signin"], div[jsname="Y5ANHe"]');
      const captcha = !!document.querySelector('iframe[src*="captcha"], input[name="captcha"], div.recaptcha');
      const consent = !!document.querySelector('form[action*="consent"], iframe[src*="consent"]');
      return { signin, captcha, consent };
    } catch(e) { return { signin:false, captcha:false, consent:false }; }
  })()`;
  
  async function handleSearchQuery(query: string) {
    setLoading(true);
    setError(null);
    setLastResponse(null);
    
    const webview = webviewRef.current;
    if (!webview) {
      console.error('no webviewRef');
      setLoading(false);
      setError('Webview component is not available.');
      return { success:false, error:'no webview' };
    }

    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en&gl=IN&pws=0`;
    try {
      webview.src = googleSearchUrl;
    } catch(e) {
      try { webview.setAttribute('src', googleSearchUrl); } catch(e2) {}
    }

    // This is not a production pattern, just for debugging.
    // try { if (process.env.NODE_ENV === 'development') webview.openDevTools(); } catch(e) {}

    function waitDomReadyOnce() {
      return new Promise(resolve => {
        const onDom = () => { resolve(true); };
        webview.addEventListener('dom-ready', onDom, { once: true });
        setTimeout(() => resolve(true), 4000); // fallback timeout
      });
    }

    await waitDomReadyOnce();
    await wait(700);

    let serp = await execWithTimeout(webview, SERP_SCRIPT, 9000);
    if (Array.isArray(serp) && serp.length) {
      setLastResponse({ success: true, mode: 'serp', results: serp });
      setLoading(false);
      return;
    }
    await wait(900);
    serp = await execWithTimeout(webview, SERP_SCRIPT, 12000);
    if (Array.isArray(serp) && serp.length) {
      setLastResponse({ success: true, mode: 'serp', results: serp });
      setLoading(false);
      return;
    }

    const block = await execWithTimeout(webview, BLOCK_DETECT, 2000);
    if (block && (block.signin || block.captcha || block.consent)) {
      setError("Please sign-in or solve the CAPTCHA in the mini-browser to continue.");
      setLoading(false);
      return;
    }

    // Fallback to GAI if SERP fails
    const GAI_URLS = ['https://bard.google.com/', 'https://ai.google/'];
    for (const url of GAI_URLS) {
      try {
        webview.src = url;
        await waitDomReadyOnce();
        await wait(700);
        const gaiScript = `${GAI_SCRIPT_TEMPLATE.replace('"USER_QUERY_REPLACE"', JSON.stringify(query))}`;
        const gaiRes = await execWithTimeout(webview, gaiScript, 22000);
        if (gaiRes && gaiRes.success) {
          setLastResponse({ success: true, mode: 'gai', results: gaiRes });
          setLoading(false);
          return;
        }
      } catch(e) { /* continue */ }
      await wait(600);
    }
    
    try { window.open(googleSearchUrl, '_blank'); } catch(e) {}
    setError('Opened Google in a new tab. Extraction failed in the mini-browser.');
    setLoading(false);
  }
  // --- End of User-Provided Robust Handler ---


  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;
    const onIpc = (e: any) => {
      if (e.channel === 'gai-response') {
        setLoading(false);
        setLastResponse(e.args?.[0] || { success: false, error: 'Empty payload' });
      }
    };
    webview.addEventListener('ipc-message', onIpc);
    return () => {
      try { webview.removeEventListener('ipc-message', onIpc); } catch (e) {}
    };
  }, []);

  const ensureWebviewLoaded = () => {
    const webview = webviewRef.current;
    if (webview && (!webview.getURL || webview.getURL() === 'about:blank')) {
      webview.src = DEFAULT_GAI_URL;
    }
  };

  const onSearchSubmit = () => {
    if (!query.trim()) return;
    if (!consentGiven) {
      const ok = confirm('This feature will control the Google web page inside the mini-browser to fetch results on your behalf. For Google AI, you must be signed in. Proceed?');
      if (!ok) return;
      setConsentGiven(true);
    }
    handleSearchQuery(query);
  };

  return (
    <div style={{display:'flex', height:'100%'}}>
      <div style={{width:420, borderRight:'1px solid #ddd', padding:12}}>
        <h3>Chat / Google AI agent</h3>
        <div style={{marginBottom:8}}>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search Google or ask AI..." style={{width:'100%'}} />
          <div style={{display:'flex', gap:8, marginTop:8}}>
            <button onClick={() => { ensureWebviewLoaded(); }} >Open Google AI</button>
            <button onClick={onSearchSubmit} disabled={!query || loading}>{loading ? 'Waiting...' : 'Search'}</button>
          </div>
        </div>

        <div>
          <h4>Result</h4>
          { loading && <div>Loading...</div>}
          { error && <div style={{color:'red'}}>Error: {error}</div>}
          { lastResponse && lastResponse.success && (
            lastResponse.mode === 'serp' ? (
              <div>
                <strong>Web Results for "{query}"</strong>
                <ul>
                  { (lastResponse.results as SERPResult[]).map((r, i) => (
                    <li key={i} style={{borderBottom: '1px solid #eee', padding: '4px 0'}}>
                      <a href="#" onClick={(e)=>{e.preventDefault(); if (webviewRef.current) webviewRef.current.src = r.link; }}>{r.title}</a>
                      <p style={{fontSize: 'small', color: 'gray'}}>{r.snippet}</p>
                    </li>
                  )) }
                </ul>
              </div>
            ) : lastResponse.mode === 'gai' ? (
               <div>
                <div dangerouslySetInnerHTML={{__html: lastResponse.results.answerHtml || lastResponse.results.answerText }} />
                <div style={{marginTop:8}}>
                  <strong>Sources</strong>
                  <ul>
                    { (lastResponse.results.sources||[]).map((s:any, i:number) => (
                      <li key={i}><a href="#" onClick={(e)=>{e.preventDefault(); if(webviewRef.current) webviewRef.current.src = s.url; }}>{s.title||s.url}</a></li>
                    )) }
                  </ul>
                </div>
              </div>
            ) : null
          )}
          { lastResponse && !lastResponse.success && <div style={{color:'red'}}>Error: {lastResponse.error || 'Unknown error'}</div>}
        </div>

      </div>

      <div style={{flex:1}}>
        <webview
          ref={webviewRef}
          src="about:blank"
          preload={`file://${process.cwd()}/electron/preload-webview.js`}
          style={{width:'100%', height:'100%'}}
        />
      </div>
    </div>
  );
}
