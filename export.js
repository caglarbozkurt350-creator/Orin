// Orin · dışa aktarma (Excel .xlsx ve PDF) ve haberler. Ek kütüphane kullanmaz.
const { BrowserWindow } = require('electron');
const fs = require('fs');

// --- Basit ZIP (sıkıştırmasız, "store") ---
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(b) { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function zip(files) {
  const parts = [], central = []; let off = 0;
  for (const [name, text] of files) {
    const data = Buffer.from(text, 'utf8'), nm = Buffer.from(name, 'utf8'), crc = crc32(data);
    const h = Buffer.alloc(30); h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(0x0800, 6); h.writeUInt16LE(0, 8);
    h.writeUInt32LE(0, 10); h.writeUInt32LE(crc, 14); h.writeUInt32LE(data.length, 18); h.writeUInt32LE(data.length, 22); h.writeUInt16LE(nm.length, 26); h.writeUInt16LE(0, 28);
    parts.push(h, nm, data);
    const c = Buffer.alloc(46); c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(0x0800, 8); c.writeUInt16LE(0, 10);
    c.writeUInt32LE(0, 12); c.writeUInt32LE(crc, 16); c.writeUInt32LE(data.length, 20); c.writeUInt32LE(data.length, 24); c.writeUInt16LE(nm.length, 28);
    c.writeUInt32LE(off, 42); central.push(c, nm);
    off += 30 + nm.length + data.length;
  }
  const cd = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(off, 16);
  return Buffer.concat(parts.concat([cd, end]));
}
const x = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
function colName(i) { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
function sheetXml(rows) {
  const w = []; rows.forEach(r => r.forEach((v, i) => { w[i] = Math.min(60, Math.max(w[i] || 8, String(v == null ? '' : v).length + 2)); }));
  const cols = '<cols>' + w.map((v, i) => `<col min="${i + 1}" max="${i + 1}" width="${v}" customWidth="1"/>`).join('') + '</cols>';
  const body = rows.map((r, ri) => `<row r="${ri + 1}">` + r.map((v, ci) => {
    const ref = colName(ci) + (ri + 1), st = ri === 0 ? ' s="1"' : '';
    return typeof v === 'number' && isFinite(v) ? `<c r="${ref}"${st}><v>${v}</v></c>` : `<c r="${ref}" t="inlineStr"${st}><is><t xml:space="preserve">${x(v)}</t></is></c>`;
  }).join('') + '</row>').join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>${cols}<sheetData>${body}</sheetData></worksheet>`;
}
function xlsx(sheets) {
  const ns = 'http://schemas.openxmlformats.org';
  const files = [
    ['[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="${ns}/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` + sheets.map((s, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('') + '</Types>'],
    ['_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${ns}/package/2006/relationships"><Relationship Id="rId1" Type="${ns}/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
    ['xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="${ns}/spreadsheetml/2006/main" xmlns:r="${ns}/officeDocument/2006/relationships"><sheets>` + sheets.map((s, i) => `<sheet name="${x(s.name).slice(0, 31)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('') + '</sheets></workbook>'],
    ['xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${ns}/package/2006/relationships">` + sheets.map((s, i) => `<Relationship Id="rId${i + 1}" Type="${ns}/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('') + `<Relationship Id="rId${sheets.length + 1}" Type="${ns}/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
    ['xl/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="${ns}/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE8ECF7"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf/><xf fontId="1" fillId="2" applyFont="1" applyFill="1"/></cellXfs></styleSheet>`]
  ].concat(sheets.map((s, i) => [`xl/worksheets/sheet${i + 1}.xml`, sheetXml(s.rows)]));
  return zip(files);
}
async function pdf(html, file) {
  const w = new BrowserWindow({ show: false, webPreferences: { javascript: false } });
  await w.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  const buf = await w.webContents.printToPDF({ pageSize: 'A4', printBackground: true, margins: { marginType: 'default' } });
  w.destroy(); fs.writeFileSync(file, buf);
}

// --- Haberler: Google Haberler RSS (kaynak ve tarih yayıncınındır) ---
const QS = [['"Sirena Marine"', 'tr', 'TR'], ['"Sirena Yachts"', 'tr', 'TR'], ['"Sirena Yachts"', 'en', 'US'], ['"Sirena Marine"', 'en', 'US']];
const dec = s => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
const tag = (s, t) => { const m = new RegExp('<' + t + '[^>]*>([\\s\\S]*?)</' + t + '>').exec(s); return m ? dec(m[1]) : ''; };
const W = /işçi|grev|maaş|ücret|sendika|işten|çıkarıl|ruhsat|fabrika|tesis|kaza|iş güvenliği|worker|strike|layoff|union|wage|factory|shipyard expansion/i;
const SALE = /sat(ış|ıl|tı)|sipariş|teslim|lansman|fuar|boat show|yacht show|order|sold|sale|launch|deliver|ihracat|export|premiere|debut|dealer|broker|bayi|distribütör|showroom|tersane/i;
async function news() {
  const all = [], seen = new Set();
  for (const [q, hl, gl] of QS) {
    try {
      const r = await fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=${hl}&gl=${gl}&ceid=${gl}:${hl}`, { headers: { 'User-Agent': 'Mozilla/5.0 Orin' } });
      const xml = await r.text();
      (xml.match(/<item>[\s\S]*?<\/item>/g) || []).forEach(it => {
        const src = tag(it, 'source'); let title = tag(it, 'title'); if (src && title.endsWith(' - ' + src)) title = title.slice(0, -(src.length + 3));
        const k = title.toLocaleLowerCase('tr').replace(/\W+/g, ' ').trim(); if (!title || seen.has(k)) return; seen.add(k);
        const date = Date.parse(tag(it, 'pubDate')) || 0;
        all.push({ title, link: tag(it, 'link'), src: src || 'Kaynak belirtilmemiş', date, g: W.test(title) ? 'İşçileri doğrudan ilgilendirenler' : SALE.test(title) ? 'Yat satışı ve siparişler (dolaylı)' : 'Diğer haberler' });
      });
    } catch (e) { /* bir sorgu düşerse diğerleri sürer */ }
  }
  if (!all.length) throw new Error('Haber bulunamadı veya internet yok');
  return all.sort((a, b) => b.date - a.date).slice(0, 60);
}
module.exports = { xlsx, pdf, news, zip, crc32 };
