// Orin · arayüz ile ana süreç arasındaki güvenli köprü
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  info: () => ipcRenderer.sendSync('app:info'),
  load: () => ipcRenderer.sendSync('state:load'),
  save: v => ipcRenderer.invoke('state:save', v),
  saveSync: v => ipcRenderer.sendSync('state:saveSync', v),
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
  update: { check: () => ipcRenderer.invoke('update:check'), install: () => ipcRenderer.invoke('update:install'), resume: () => ipcRenderer.invoke('update:resume'), on: fn => ipcRenderer.on('upd', (e, s) => fn(s)) },
  surum: { liste: () => ipcRenderer.invoke('surum:liste'), don: v => ipcRenderer.invoke('surum:don', v), on: fn => ipcRenderer.on('surum:ilerle', (e, s) => fn(s)) },
  pickFolder: cur => ipcRenderer.invoke('fs:pickFolder', cur),
  openPath: p => ipcRenderer.invoke('fs:open', p),
  external: url => ipcRenderer.invoke('shell:external', url),
  win: (cmd, arg) => ipcRenderer.send('win:cmd', cmd, arg),
  zeka: {
    status: () => ipcRenderer.invoke('zeka:status'),
    setKey: k => ipcRenderer.invoke('zeka:setKey', k),
    clearKey: () => ipcRenderer.invoke('zeka:clearKey'),
    setBudget: b => ipcRenderer.invoke('zeka:setBudget', b),
    sor: o => ipcRenderer.invoke('zeka:sor', o)
  },
  fikirler: () => ipcRenderer.invoke('fikir:liste'),
  gelen: () => ipcRenderer.invoke('gelen:al'),
  gelenTamam: d => ipcRenderer.invoke('gelen:tamam', d),
  abonelik: {
    status: () => ipcRenderer.invoke('abonelik:status'),
    ayar: a => ipcRenderer.invoke('abonelik:ayar', a),
    test: () => ipcRenderer.invoke('abonelik:test'),
    calistir: o => ipcRenderer.invoke('abonelik:calistir', o),
    isler: () => ipcRenderer.invoke('abonelik:isler')
  },
  isEmri: {
    yaz: o => ipcRenderer.invoke('isemri:yaz', o),
    liste: () => ipcRenderer.invoke('isemri:liste'),
    durum: () => ipcRenderer.invoke('isemri:durum'),
    gelistir: o => ipcRenderer.invoke('isemri:gelistir', o)
  },
  toplanti: { kaydet: o => ipcRenderer.invoke('toplanti:kaydet', o) },
  piyasa: { tcmb: zorla => ipcRenderer.invoke('piyasa:tcmb', zorla) },
  apify: { durum: () => ipcRenderer.invoke('apify:durum'), kaydet: t => ipcRenderer.invoke('apify:kaydet', t), sil: () => ipcRenderer.invoke('apify:sil'), calisanlar: L => ipcRenderer.invoke('apify:calisanlar', L), test: () => ipcRenderer.invoke('apify:test') },
  jarvis: { taslaklar: () => ipcRenderer.invoke('jarvis:taslaklar'), sor: o => ipcRenderer.invoke('jarvis:sor', o), kaydet: o => ipcRenderer.invoke('jarvis:kaydet', o) },
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
