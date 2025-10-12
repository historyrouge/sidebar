'use client';

import React, { useRef, useState, useEffect } from 'react';

type GAIResponse = {
  success: boolean;
  answerHtml?: string;
  answerText?: string;
  sources?: { title?: string; url: string }[];
  error?: string;
};

const DEFAULT_GAI_URL = 'https://ai.google/'; // TODO: if you use a different Google AI URL, update here

export default function WebAgentContent() {
  const webviewRef = useRef<any>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<GAIResponse | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    const onIpc = (e: any) => {
      if (e.channel === 'gai-response') {
        const payload = e.args && e.args[0] ? e.args[0] : null;
        setLoading(false);
        if (payload) {
          setLastResponse(payload);
        } else {
          setLastResponse({ success: false, error: 'Empty payload from webview' });
        }
      }
    };

    webview.addEventListener('ipc-message', onIpc);

    return () => {
      try { webview.removeEventListener('ipc-message', onIpc); } catch (e) {}
    };
  }, []);

  const ensureWebviewLoaded = () => {
    const webview = webviewRef.current;
    if (!webview) return;
    // if not loaded or different url, load it
    try {
      if (!webview.getURL || webview.getURL() === 'about:blank') {
        webview.src = DEFAULT_GAI_URL;
      }
    } catch (e) {
      // some Electron versions may not expose getURL
      if (!webview.src || webview.src === 'about:blank') {
        webview.src = DEFAULT_GAI_URL;
      }
    }
  };

  const onSendToGoogleAI = async () => {
    if (!consentGiven) {
      const ok = confirm('This feature will control the Google AI chat box inside the mini-browser to fetch answers on your behalf. You must be signed into Google in that mini-browser. Proceed?');
      if (!ok) return; setConsentGiven(true);
    }

    setLoading(true);
    setLastResponse(null);
    ensureWebviewLoaded();

    const webview = webviewRef.current;
    if (!webview) { setLoading(false); setLastResponse({ success: false, error: 'No webview found' }); return; }

    // Try to use the injected API inside the guest (preload-webview.js defines window.__celestial.receiveMessage)
    const payload = { type: 'send-query', query };
    try {
      // execute a small snippet that calls the guest-exposed function (if present)
      const call = `(function(){
        if(window.__celestial && window.__celestial.receiveMessage){
          window.__celestial.receiveMessage(${JSON.stringify(payload)});
          true;
        } else { false; }
      })()`;

      const res = await webview.executeJavaScript(call, true);
      // If executeJavaScript returned false, fallback to direct script injection
      if (res === false) {
        // fallback: inject the extraction script directly to run send+observe
        const fallbackScript = `(${fallbackRunner.toString()})(${JSON.stringify(query)})`;
        // fallbackRunner is a tiny helper defined below; execute and await result via postMessage from guest preload
        await webview.executeJavaScript(fallbackScript, true);
        // the result will arrive via the 'ipc-message' event
      }

      // Now wait for the webview to send back 'gai-response' via ipc-message handler
      // We set a high level timeout to clear loading if no response arrives
      setTimeout(() => { if (loading) { setLoading(false); setLastResponse({ success: false, error: 'Timed out waiting for Google AI response' }); } }, 25000);

    } catch (err: any) {
      console.error('send error', err);
      setLoading(false);
      setLastResponse({ success: false, error: String(err) });
    }
  };

  // fallbackRunner is used (only as string) when preload API is missing.
  // It will try to set the query into the page input and observe a response, then postMessage to parent.
  function fallbackRunner(q: string) {
    (async function run(q) {
      try {
        // minimal attempt similar to preload's runSendQuery + observe
        function dispatchEvents(el){ el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); }
        let input = document.querySelector('[contenteditable="true"]') || document.querySelector('textarea') || document.querySelector('input[type="text"]');
        if (input) {
          try { if (input.isContentEditable) input.innerText = q; else input.value = q; } catch(e){ try{ input.value=q }catch(e){} }
          dispatchEvents(input);
          const sendBtn = document.querySelector('button[aria-label*="Send"], button[title*="Send"]');
          if (sendBtn) sendBtn.click(); else input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true}));
        }

        // wait and try to find a large text node
        const root = document.querySelector('main') || document.body;
        let last = '';
        const start = Date.now();
        while(Date.now() - start < 20000){
          const nodes = Array.from(root.querySelectorAll('div, section, article')).filter(n=> (n.innerText||'').length>20);
          if (nodes.length){
            const node = nodes[nodes.length-1];
            if ((node.innerText||'').trim() !== last){ last = (node.innerText||'').trim(); await new Promise(r=>setTimeout(r,600)); continue; }
            // stable
            const anchors = Array.from(node.querySelectorAll('a')).map(a=>({title:a.innerText||a.href,url:a.href}));
            window.parent.postMessage({ type:'GAI_RESPONSE', payload:{ answerHtml: node.innerHTML, answerText: node.innerText, sources: anchors } }, '*');
            return;
          }
          await new Promise(r=>setTimeout(r,300));
        }
        window.parent.postMessage({ type:'GAI_RESPONSE', payload:{ error:'timeout' } }, '*');
      } catch(e){ window.parent.postMessage({ type:'GAI_RESPONSE', payload:{ error: String(e) } }, '*'); }
    })(q);
  }

  // handle messages posted to window from guest if direct postMessage used
  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      try {
        if (ev.data && ev.data.type === 'GAI_RESPONSE') {
          setLoading(false);
          setLastResponse(ev.data.payload);
        }
      } catch (e) {}
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <div style={{display:'flex', height:'100%'}}>
      <div style={{width:420, borderRight:'1px solid #ddd', padding:12}}>
        <h3>Chat / Google AI agent</h3>
        <div style={{marginBottom:8}}>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ask Google AI..." style={{width:'100%'}} />
          <div style={{display:'flex', gap:8, marginTop:8}}>
            <button onClick={() => { ensureWebviewLoaded(); }} >Open Google AI</button>
            <button onClick={onSendToGoogleAI} disabled={!query || loading}>{loading ? 'Waiting...' : 'Ask Google AI'}</button>
          </div>
        </div>

        <div>
          <h4>Last response</h4>
          { lastResponse ? (
            lastResponse.success ? (
              <div>
                <div dangerouslySetInnerHTML={{__html: lastResponse.answerHtml || lastResponse.answerText }} />
                <div style={{marginTop:8}}>
                  <strong>Sources</strong>
                  <ul>
                    { (lastResponse.sources||[]).map((s, i) => (
                      <li key={i}><a href="#" onClick={(e)=>{e.preventDefault(); const webview = webviewRef.current; if(webview) { try { webview.src = s.url; } catch(e){ window.open(s.url,'_blank'); } } }}>{s.title||s.url}</a></li>
                    )) }
                  </ul>
                </div>
              </div>
            ) : (
              <div style={{color:'red'}}>Error: { lastResponse.error }</div>
            )
          ) : <div className="muted">No response yet</div> }
        </div>

      </div>

      <div style={{flex:1}}>
        {/* webview tag only works inside Electron renderer */}
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
