
// This script is meant to be executed inside the Google Search results page within a webview.
// It extracts search results and sends them back to the host application.
// NOTE: Google's DOM structure changes frequently. This is a best-effort implementation
// and may need updates. It includes multiple selectors as fallbacks.

export const extractGoogleResults = `
(() => {
  try {
    const results = [];
    const seen = new Set();

    // Candidate containers used by Google search results (try multiple fallbacks)
    const containers = Array.from(document.querySelectorAll('div.tF2Cxc, div.g, div.gWQKyb, div[data-hveid], div[data-attrid]')).slice(0, 30);

    function normalizeUrl(url) {
      try {
        return (new URL(url, location.href)).href;
      } catch (e) {
        return url;
      }
    }

    for (const node of containers) {
      let a = node.querySelector('a');
      let h3 = node.querySelector('h3');
      // Sometimes the structure is different — try to find the first link with h3 inside
      if (!a || !h3) {
        const candidate = node.querySelector('a[href] h3');
        if (candidate) {
          h3 = candidate;
          a = candidate.closest('a');
        }
      }

      // snippet fallbacks
      const snippetEl = node.querySelector('.VwiC3b, .IsZvec, .aCOpRe, .st, .YyVfkd') || node.querySelector('span');
      const snippet = snippetEl ? snippetEl.innerText.trim() : '';

      if (a && h3) {
        const title = h3.innerText.trim();
        const link = normalizeUrl(a.href);
        const domain = (link && (() => { try { return (new URL(link)).hostname.replace('www.',''); } catch(e){return '';} })()) || '';
        if (!seen.has(link) && title) {
          seen.add(link);
          results.push({ title, link, snippet, domain });
        }
      }
      if (results.length >= 8) break;
    }

    // Also try to capture special answer boxes (featured snippets / knowledge panels)
    if (results.length < 3) {
      const featured = document.querySelector('.ifM9O, .kp-blk, .xpdopen, .Z1hOCe');
      if (featured) {
        const title = featured.querySelector('h2, h3')?.innerText?.trim() || '';
        const snippet = featured.querySelector('.hgKElc, .bVj5Zb, .LGOjhe')?.innerText?.trim() || featured.innerText?.slice(0,300);
        const link = location.href;
        if (title && !seen.has(link)) {
          results.unshift({ title, link, snippet, domain: location.hostname });
          seen.add(link);
        }
      }
    }

    return results;
  } catch (err) {
    return [];
  }
})()
`;
