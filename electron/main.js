
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // IMPORTANT: Enable webviewTag for the <webview> to work
      webviewTag: true,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the Next.js app
  if (isDev) {
    // In development, load from the Next.js dev server
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    // In production, load the static export
    win.loadFile(path.join(__dirname, '../web/out/index.html'));
  }

  // Handle search results sent from the webview preload script
  ipcMain.on('search-results', (event, results) => {
    // Forward the results to the renderer process (the React app)
    win.webContents.send('search-results-from-main', results);
  });

  ipcMain.on('open-in-webview-request', (event, url) => {
    win.webContents.send('open-in-webview', url);
  });

  ipcMain.on('webview-navigation', (event, url) => {
    win.webContents.send('webview-navigated', url);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Required for the webview tag to have the correct permissions
app.on('web-contents-created', (event, contents) => {
  if (contents.getType() === 'webview') {
    contents.on('will-attach-webview', (event, webPreferences, params) => {
      // Allow preload script to be loaded in the webview
      webPreferences.preload = path.join(__dirname, 'preload-webview.js');
      webPreferences.contextIsolation = false; // Important for webview IPC
      webPreferences.nodeIntegration = false;
    });
  }
});

    