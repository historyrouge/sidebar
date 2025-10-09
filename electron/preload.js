
const { contextBridge, ipcRenderer } = require('electron');

// Expose a minimal API to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  on: (channel, cb) => {
    ipcRenderer.on(channel, (event, ...args) => cb(...args));
  },
});
