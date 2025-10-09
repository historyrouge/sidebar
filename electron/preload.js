
const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe, context-isolated API to the renderer process (Next.js app)
contextBridge.exposeInMainWorld('electronAPI', {
  // From Renderer to Main
  sendSearchResults: (data) => ipcRenderer.send('search-results', data),
  sendWebViewNavigation: (url) => ipcRenderer.send('webview-navigation', url),

  // From Main to Renderer
  onSearchResults: (callback) => {
    ipcRenderer.on('search-results-from-main', (event, ...args) => callback(...args));
    // Return a cleanup function
    return () => ipcRenderer.removeAllListeners('search-results-from-main');
  },
  onOpenInWebview: (callback) => {
    ipcRenderer.on('open-in-webview', (event, ...args) => callback(...args));
    return () => ipcRenderer.removeAllListeners('open-in-webview');
  },
  onWebViewNavigation: (callback) => {
    ipcRenderer.on('webview-navigated', (event, ...args) => callback(...args));
    return () => ipcRenderer.removeAllListeners('webview-navigated');
  }
});
