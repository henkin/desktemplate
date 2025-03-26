const { contextBridge, ipcRenderer } = require('electron')

const api = {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    close: () => ipcRenderer.send('close-window')
}

contextBridge.exposeInMainWorld('api', api)