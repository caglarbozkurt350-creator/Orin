// Kaynak görselden (assets/kaynak-ikon.jpg) kırpılmış uygulama simgeleri üretir
const { app, nativeImage } = require('electron');
const path = require('path'), fs = require('fs');
app.whenReady().then(() => {
  const A = path.join(__dirname, '..', 'assets');
  const src = nativeImage.createFromPath(path.join(A, 'kaynak-ikon.jpg'));
  const { width } = src.getSize(), s = width / 1024;
  const crop = src.crop({ x: Math.round(196 * s), y: Math.round(196 * s), width: Math.round(632 * s), height: Math.round(632 * s) });
  fs.writeFileSync(path.join(A, 'icon.png'), crop.resize({ width: 512, height: 512, quality: 'best' }).toPNG());
  fs.writeFileSync(path.join(A, 'logo.png'), crop.resize({ width: 64, height: 64, quality: 'best' }).toPNG());
  console.log('ikon tamam', src.getSize());
  app.quit();
});
