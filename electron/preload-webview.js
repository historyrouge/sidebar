
const { contextBridge, ipcRenderer } = require('electron');

// This preload script runs inside the <webview> tag.
// It exposes a channel for the webview content (Google) to communicate back to the host renderer.
contextBridge.exposeInMainWorld('electronAPI', {
  sendResults: (data) => {
    ipcRenderer.sendToHost('search-results-from-webview', data);
  }
});

    