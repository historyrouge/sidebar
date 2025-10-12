
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
    },
  });

  const devUrl = 'http://localhost:3000';
  
  if (isDev) {
    win.loadURL(devUrl);
    win.webContents.openDevTools();
  } else {
    // In a real build, you'd load a file, e.g., `win.loadFile('build/index.html')`
    win.loadURL(devUrl); 
  }


  // Optional: forward messages from webview to main if needed
  ipcMain.on('from-renderer', (event, channel, payload) => {
    console.log('ipcMain got from renderer', channel, payload);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
