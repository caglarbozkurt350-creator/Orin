// Orin · arayüz ile ana süreç arasındaki güvenli köprü
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  info: () => ipcRenderer.sendSync('app:info'),
  load: () => ipcRenderer.sendSync('state:load'),
  save: v => ipcRenderer.invoke('state:save', v),
  notes: {
    list: dir => ipcRenderer.invoke('notes:list', dir),
    save: o => ipcRenderer.invoke('notes:save', o),
    del: o => ipcRenderer.invoke('notes:delete', o)
  },
  images: dir => ipcRenderer.invoke('images:list', dir),
  data: {
    info: () => ipcRenderer.invoke('data:info'),
    move: (dir, mode) => ipcRenderer.invoke('data:move', { dir, mode })
  },
  pickFolder: cur => ipcRenderer.invoke('fs:pickFolder', cur),
  openPath: p => ipcRenderer.invoke('fs:open', p),
  external: url => ipcRenderer.invoke('shell:external', url),
  win: (cmd, arg) => ipcRenderer.send('win:cmd', cmd, arg),
  sheets: {
    status: () => ipcRenderer.invoke('sheets:status'),
    config: p => ipcRenderer.invoke('sheets:config', p),
    pickClient: () => ipcRenderer.invoke('sheets:pickClient'),
    login: () => ipcRenderer.invoke('sheets:login'),
    logout: () => ipcRenderer.invoke('sheets:logout'),
    cancel: () => ipcRenderer.invoke('sheets:cancel'),
    reopen: () => ipcRenderer.invoke('sheets:reopen'),
    authUrl: () => ipcRenderer.invoke('sheets:authUrl'),
    meta: () => ipcRenderer.invoke('sheets:meta'),
    read: r => ipcRenderer.invoke('sheets:read', r)
  }
});
