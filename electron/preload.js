
const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe, context-isolated API to the renderer process (Next.js app)
contextBridge.exposeInMainWorld('electronAPI', {
  // From Renderer to Main
  sendSearchResults: (data) => ipcRenderer.send('search-results', data),
  sendWebViewNavigation: (url) => ipcRenderer.send('webview-navigation', url),

  // From Main to Renderer
  onSearchResults: (callback) => {
    const handler = (event, ...args) => callback(...args);
    ipcRenderer.on('search-results-from-main', handler);
    // Return a cleanup function
    return () => ipcRenderer.removeListener('search-results-from-main', handler);
  },
  onOpenInWebview: (callback) => {
    const handler = (event, ...args) => callback(...args);
    ipcRenderer.on('open-in-webview', handler);
    return () => ipcRenderer.removeListener('open-in-webview', handler);
  },
  onWebViewNavigation: (callback) => {
    const handler = (event, ...args) => callback(...args);
    ipcRenderer.on('webview-navigated', handler);
    return () => ipcRenderer.removeListener('webview-navigated', handler);
  }
});

    