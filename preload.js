const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
    runSimulation: (data) => {ipcRenderer.send('runSimulation', data)},
    onStatusMessage: (callback) => ipcRenderer.on('statusMessage', (_event, value) => callback(value)),
    onHelperMessage: (callback) => ipcRenderer.on('helper', (_event, value) => callback(value))
})