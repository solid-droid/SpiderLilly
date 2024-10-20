const { app, BrowserWindow } = require('electron');
app.isPackaged || require('electron-reloader')(module)
let win

function createWindow() {
  win = new BrowserWindow({
    width: 800, height: 600, webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
      contextIsolation: false,
    }
  })
  win.removeMenu();
  win.loadFile('App/index.html')
  // win.webContents.openDevTools()
  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})