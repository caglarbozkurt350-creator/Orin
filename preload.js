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
  teamSeed: () => { try { return JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'calisanlar.json'), 'utf8')); } catch (e) { return null; } },
  data: {
    info: () => ipcRenderer.invoke('data:info'),
    move: (dir, mode) => ipcRenderer.invoke('data:move', { dir, mode }),
    backup: () => ipcRenderer.invoke('data:backup'),
    adopt: () => ipcRenderer.invoke('data:adopt'),
    dismiss: () => ipcRenderer.invoke('data:dismiss')
  },
  exp: { xlsx: o => ipcRenderer.invoke('exp:xlsx', o), pdf: o => ipcRenderer.invoke('exp:pdf', o) },
  news: () => ipcRenderer.invoke('news'),
  update: { check: () => ipcRenderer.invoke('update:check'), install: () => ipcRenderer.invoke('update:install'), on: fn => ipcRenderer.on('upd', (e, s) => fn(s)) },
  pickFolder: cur => ipcRenderer.invoke('fs:pickFolder', cur),
  openPath: p => ipcRenderer.invoke('fs:open', p),
  external: url => ipcRenderer.invoke('shell:external', url),
  win: (cmd, arg) => ipcRenderer.send('win:cmd', cmd, arg),
  bulut: {
    status: () => ipcRenderer.invoke('bulut:status'),
    config: c => ipcRenderer.invoke('bulut:config', c),
    login: o => ipcRenderer.invoke('bulut:login', o),
    signup: o => ipcRenderer.invoke('bulut:signup', o),
    logout: () => ipcRenderer.invoke('bulut:logout'),
    pull: s => ipcRenderer.invoke('bulut:pull', s),
    push: v => ipcRenderer.invoke('bulut:push', v)
  },
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
    read: r => ipcRenderer.invoke('sheets:read', r),
    add: r => ipcRenderer.invoke('sheets:add', r),
    upd: o => ipcRenderer.invoke('sheets:upd', o),
    del: o => ipcRenderer.invoke('sheets:del', o),
    findLeave: o => ipcRenderer.invoke('sheets:findLeave', o),
    upsert: o => ipcRenderer.invoke('sheets:upsert', o),
    delKey: o => ipcRenderer.invoke('sheets:delKey', o)
  }
});
