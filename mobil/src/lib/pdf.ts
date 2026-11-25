// Aylık PDF çıktıları (0.9.0): İş günü · İlaç takibi (+ şeker çizelgesi) · Bütçe. Tasarımdaki A4 örneklerinin gerçek veriyle hali.
// HTML üretilir; expo-print PDF'e çevirir, expo-sharing paylaşır. Kaynak: masaüstünün yayınladığı özet (o.gun, o.aile).
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import type { Ozet } from '@/lib/depo';
import { IZIN_AD } from '@/ekran/IzinGirisi';
import { R } from '@/lib/tema';
import { AY, GK, ayAnahtari, ayaGore, gunAnahtari, tamAnahtar } from '@/lib/zaman';

export type PdfTur = 'is' | 'ilac' | 'butce';
export const PDF_AD: Record<PdfTur, string> = { is: 'Aylık İş Günü Raporu', ilac: 'Aylık İlaç Takibi', butce: 'Aylık Bütçe Raporu' };

const esc = (x: unknown) => String(x ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
const tl = (n: number) => Math.round(n).toLocaleString('tr-TR');
const GUN = 86400000;
const DUR: Record<string, [string, string, string]> = { baslanacak: ['Başlanacak', '#eeeef1', '#55555c'], devam: ['Devam', '#fff1d9', '#a5620b'], bitti: ['Bitti', '#e3f7e7', '#1f7a35'], beklemede: ['Beklemede', '#e2f6fa', '#11717f'] };

function css(A: string, A2: string) {
  return `@page{size:A4;margin:0}
body{margin:0;background:#fff}
.pg{width:595px;min-height:842px;box-sizing:border-box;padding:34px 40px 40px;margin:0 auto;background:#fff;color:#1d1d22;font-family:-apple-system,Roboto,'Segoe UI',system-ui,sans-serif;font-size:9.5px;line-height:1.35;display:flex;flex-direction:column;gap:12px;position:relative}
.ust{display:flex;align-items:flex-start;gap:12px;padding-bottom:12px;border-bottom:2px solid ${A}}
.logo{width:30px;height:30px;border-radius:9px;background:linear-gradient(160deg,${A2},${A});color:#fff;font-weight:800;font-size:15px;display:flex;align-items:center;justify-content:center;flex:none}
.ust h1{margin:0;font-size:19px}.ust .alt{color:#6b6b73;font-size:10px}
.sag{margin-left:auto;text-align:right;color:#6b6b73;font-size:9px;display:flex;flex-direction:column;gap:2px}.sag b{color:#1d1d22;font-size:13px}
.kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.kpi div{border:1px solid #e6e6ea;border-radius:8px;padding:8px 10px;display:flex;flex-direction:column;gap:2px}
.kpi span{color:#6b6b73;font-size:8.5px;text-transform:uppercase;letter-spacing:.06em}.kpi b{font-size:15px}.kpi i{font-style:normal;color:#6b6b73;font-size:8.5px}
h2{margin:0;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#6b6b73}
table{width:100%;border-collapse:collapse}tr{page-break-inside:avoid}
th{text-align:left;font-size:8px;text-transform:uppercase;letter-spacing:.06em;color:#6b6b73;font-weight:600;padding:0 6px 4px;border-bottom:1px solid #d9d9de}
td{padding:1.8px 6px;border-bottom:1px solid #f0f0f2;vertical-align:middle}
td.n,th.n{text-align:right;font-variant-numeric:tabular-nums}
.et{display:inline-block;padding:1px 6px;border-radius:7px;font-size:8px;font-weight:600}
.soluk td{color:#a0a0a8}
.bar{height:6px;border-radius:3px;background:#f0f0f2;overflow:hidden}.bar i{display:block;height:100%;border-radius:3px}
.alt2{display:flex;gap:16px}.blok{display:flex;flex-direction:column;gap:6px}
.not{border:1px dashed #d0d0d6;border-radius:8px;padding:8px 10px;color:#6b6b73}
.ayak{margin-top:auto;display:flex;justify-content:space-between;color:#9a9aa2;font-size:8px;border-top:1px solid #ececf0;padding-top:6px}
.uyari{display:flex;gap:8px;align-items:center;background:#fff4ea;border:1px solid #ffd7bf;color:#8a3b14;border-radius:8px;padding:6px 10px}
.lej{display:flex;gap:12px;flex-wrap:wrap;color:#6b6b73;font-size:8.5px}`;
}
function sayfa(baslik: string, alt: string, ay: Date, ic: string) {
  const A = R.ana, A2 = R.ana2, son = new Date(ay.getFullYear(), ay.getMonth() + 1, 0), n = new Date();
  const ayAd = AY[ay.getMonth()] + ' ' + ay.getFullYear();
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=595"><title>${esc(baslik)} · ${ayAd}</title><style>${css(A, A2)}</style></head><body>
<div class="pg"><div class="ust"><span class="logo">O</span><div><h1>${esc(baslik)}</h1><div class="alt">${esc(alt)}</div></div>
<div class="sag"><b>${ayAd}</b><span>1–${son.getDate()} ${ayAd}</span><span>Oluşturma: ${n.toLocaleDateString('tr-TR')} · ${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}</span></div></div>
${ic}
<div class="ayak"><span>Orvane · kişisel kayıtlardan otomatik oluşturuldu</span><span>${ayAd}</span></div></div></body></html>`;
}
const kpi = (l: string[][]) => `<div class="kpi">${l.map((k) => `<div><span>${k[0]}</span><b>${k[1]}</b>${k.slice(2).map((x) => `<i>${x}</i>`).join('')}</div>`).join('')}</div>`;
const gunleri = (ay: Date) => { const r: Date[] = [], son = new Date(ay.getFullYear(), ay.getMonth() + 1, 0).getDate(); for (let d = 1; d <= son; d++) r.push(new Date(ay.getFullYear(), ay.getMonth(), d)); return r; };
const bugun0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

// ---------- 1 · İŞ GÜNÜ ----------
export function isGunuHtml(o: Ozet, ay: Date) {
  const A = R.ana, b0 = bugun0(); let satir = '', top = 0, plan = 0, calisilan = 0, isGunu = 0, fm = 0, fmGun: number[] = [];
  const proje: Record<string, number> = {}, izin: Record<string, number> = {}; let veriYok = 0;
  gunleri(ay).forEach((d) => {
    const k = gunAnahtari(d), g = o.gun[k], hs = d.getDay() === 0 || d.getDay() === 6;
    if (hs && !g?.e?.length) return;
    const tarih = `${d.getDate()} ${AY[d.getMonth()].slice(0, 3)} <span style="color:#9a9aa2">${GK[d.getDay()]}</span>`;
    const gelecek = d > b0;
    if (!hs) isGunu++;
    if (!g) { if (!gelecek) veriYok++; satir += `<tr class="soluk"><td>${tarih}</td><td colspan="4">${gelecek ? 'henüz gelmedi' : 'veri yok (eşitleme aralığı dışında)'}</td><td class="n">—</td></tr>`; return; }
    if (g.D) { izin[g.D] = (izin[g.D] || 0) + 1; satir += `<tr><td>${tarih}</td><td colspan="4"><span class="et" style="background:#e2f6fa;color:#11717f">İzin</span> ${esc(IZIN_AD[g.D] || 'İzin')}${gelecek ? ' · planlı' : ''}</td><td class="n">${g.L || '—'}</td></tr>`; return; }
    const H = (g.L || 0) + (g.OT || 0); if (!gelecek) plan += H;
    if (!g.e.length) { satir += `<tr class="soluk"><td>${tarih}</td><td colspan="4">${gelecek ? 'henüz gelmedi' : 'girilmedi'}</td><td class="n">${H ? '0 / ' + H : '—'}</td></tr>`; return; }
    const gt = g.e.reduce((a, r) => a + r[2], 0); top += gt; calisilan++;
    if (g.L && gt > g.L) { fm += gt - g.L; fmGun.push(d.getDate()); }
    g.e.forEach((r, i) => {
      proje[r[0]] = (proje[r[0]] || 0) + r[2]; const du = DUR[r[3] || ''];
      satir += `<tr><td>${i ? '' : tarih}</td><td style="font-variant-numeric:tabular-nums">${esc(r[0])}</td><td>${esc(r[1])}</td><td class="n">${r[2]}</td><td>${du ? `<span class="et" style="background:${du[1]};color:${du[2]}">${du[0]}</span>` : ''}</td><td class="n">${i ? '' : `<b>${gt}</b>${g.L && gt > g.L ? ` <span style="color:${A}">+${gt - g.L}</span>` : ''}`}</td></tr>`;
    });
  });
  const pl = Object.entries(proje).sort((a, b) => b[1] - a[1]), pmax = pl.length ? pl[0][1] : 1;
  const projeHtml = pl.length ? pl.slice(0, 8).map(([k, v]) => `<div style="display:flex;align-items:center;gap:8px"><span style="width:78px;font-variant-numeric:tabular-nums">${esc(k)}</span><div class="bar" style="flex:1"><i style="width:${Math.round((v / pmax) * 100)}%;background:${A}"></i></div><b style="width:62px;text-align:right">${tl(v)} dk</b><span style="width:30px;text-align:right;color:#6b6b73">%${Math.round((v / (top || 1)) * 100)}</span></div>`).join('') : '<span style="color:#9a9aa2">Bu ay kayıt yok.</span>';
  const izinTop = Object.values(izin).reduce((a, b) => a + b, 0), izinAlt = Object.entries(izin).map(([t, n]) => (IZIN_AD[t] || 'İzin').toLocaleLowerCase('tr') + ' ' + n).join(' · ') || 'yok';
  return sayfa(PDF_AD.is, 'Günlük iş kayıtları · proje kodları · izinler', ay, `
${kpi([['Çalışılan gün', calisilan + ' / ' + isGunu, 'iş günü' + (izinTop ? ' · ' + izinTop + ' gün izin' : '')], ['Girilen süre', tl(top) + ' dk', plan ? '/ ' + tl(plan) + ' dk · %' + Math.round((top / plan) * 100) : 'plan yok'], ['Fazla mesai', tl(fm) + ' dk', fmGun.length ? fmGun.slice(0, 4).join(', ') + ' ' + AY[ay.getMonth()] : 'yok'], ['İzin', izinTop + ' gün', izinAlt]])}
<div class="blok"><h2>Günlük döküm</h2>
<table><tr><th style="width:62px">Tarih</th><th style="width:70px">Proje kodu</th><th>İş</th><th class="n" style="width:34px">dk</th><th style="width:62px">Durum</th><th class="n" style="width:54px">Gün top.</th></tr>${satir}
<tr><td colspan="5" style="border:0;padding-top:5px"><b>Toplam</b></td><td class="n" style="border:0;padding-top:5px"><b>${tl(top)} dk</b></td></tr></table>
${veriYok ? `<span style="color:#9a9aa2;font-size:8px">${veriYok} gün için telefonda veri yok: telefon son 45 günü tutar. Tam döküm için masaüstündeki rapor kullanılır.</span>` : ''}</div>
<div class="alt2"><div class="blok" style="flex:1.4"><h2>Proje özeti</h2>${projeHtml}</div>
<div style="flex:1;display:flex;gap:14px;align-items:flex-end"><div style="flex:1;border-top:1px solid #1d1d22;padding-top:3px;color:#6b6b73">Çalışan · imza</div><div style="flex:1;border-top:1px solid #1d1d22;padding-top:3px;color:#6b6b73">Onaylayan · imza</div></div></div>`);
}

// ---------- 2 · İLAÇ TAKİBİ + ŞEKER ----------
const gecerli = (tekrar: string, d: Date) => tekrar === 'haftaici' ? d.getDay() % 6 !== 0 : tekrar === 'haftasonu' ? d.getDay() % 6 === 0 : true;
export function kalanStok(i: { stok?: number | null; stokTs?: number }) { if (i.stok == null) return null; return Math.max(0, i.stok - (i.stokTs ? Math.floor((Date.now() - i.stokTs) / GUN) : 0)); }
const donemAd = (saat: string) => { const h = parseInt(saat, 10); return isNaN(h) ? '' : h < 11 ? 'Sabah' : h < 16 ? 'Öğlen' : 'Akşam'; };
export function ilacHtml(o: Ozet, ay: Date) {
  const A = R.ana, a = o.aile, b0 = bugun0(), gl = gunleri(ay), N = gl.length;
  const ilac = (a?.ilac || []).slice().sort((x, y) => x.saat.localeCompare(y.saat)), al = a?.al || {}, seker = a?.seker || {}, sekerSaat = a?.sekerSaat || {};
  let bas = `<th style="width:72px">İlaç</th>`; gl.forEach((d) => { bas += `<th style="padding:0 0 4px;text-align:center;font-size:7px;${d.getTime() === b0.getTime() ? `color:${A}` : ''}">${d.getDate()}</th>`; }); bas += `<th class="n" style="width:40px">Uyum</th>`;
  let izg = '', alinan = 0, gereken = 0; const kac: [string, number][] = [], hafta = [0, 0, 0, 0, 0].map(() => [0, 0]), satirlar: [string, number, number][] = [];
  const kutu = (bg: string, r: string, y: string) => `<span style="display:block;height:13px;border-radius:3px;background:${bg};color:${r};font-size:8px;font-weight:700;text-align:center;line-height:13px">${y}</span>`;
  ilac.forEach((m) => {
    let r = `<tr><td style="padding:4px 6px;line-height:1.15"><b>${esc(m.ad)}</b><br><span style="color:#8a8a92;font-size:7px">${esc(m.saat)}</span></td>`, ok = 0, ger = 0;
    const ekl = m.eklendi ? new Date(m.eklendi).setHours(0, 0, 0, 0) : 0;
    gl.forEach((d) => {
      let h = ''; const w = Math.min(4, Math.floor((d.getDate() - 1) / 7));
      if (d > b0 || d.getTime() < ekl || !gecerli(m.tekrar, d)) h = kutu('#f3f3f5', '#f3f3f5', '');
      else { ger++; hafta[w][1]++; if (al[tamAnahtar(d) + '|' + m.id]) { ok++; hafta[w][0]++; h = kutu('#dff5e4', '#1f7a35', '✓'); } else h = kutu('#fde4df', '#c0392b', '×'); }
      r += `<td style="padding:2px 1px;border:0">${h}</td>`;
    });
    alinan += ok; gereken += ger; kac.push([m.ad, ger - ok]); satirlar.push([m.id, ok, ger]);
    izg += r + `<td class="n"><b>${ger ? '%' + Math.round((ok / ger) * 100) : '—'}</b></td></tr>`;
  });
  if (!ilac.length) izg = `<tr><td colspan="${N + 2}" style="color:#9a9aa2;padding:8px 6px">Kayıtlı ilaç yok. Bana Özel › İlaçlarım’dan eklenir.</td></tr>`;
  // Şeker çizelgesi
  const SK = gl.map((d) => (seker[tamAnahtar(d)] ?? null) as number | null), SKx = SK.filter((v): v is number => v != null);
  const ort = SKx.length ? Math.round(SKx.reduce((x, y) => x + y, 0) / SKx.length) : 0, dis = SK.map((v, i) => (v != null && (v > 130 || v < 80) ? i + 1 : 0)).filter(Boolean);
  const ust = Math.max(150, ...SKx.map((v) => Math.ceil(v / 10) * 10 + 10)), alt = Math.min(70, ...SKx.map((v) => Math.floor(v / 10) * 10 - 10));
  const SW = 515, SH = 92, sy = (v: number) => 8 + ((ust - v) / (ust - alt)) * SH, sx = (d: number) => 30 + ((d - 1) * (SW - 42)) / (N - 1);
  let sk = `<svg width="${SW}" height="${SH + 26}" viewBox="0 0 ${SW} ${SH + 26}"><rect x="30" y="${sy(130)}" width="${SW - 42}" height="${sy(80) - sy(130)}" fill="#e9f8ee"/>`;
  [80, 100, 130, ust].forEach((v) => { const h = v === 80 || v === 130; sk += `<line x1="30" x2="${SW - 12}" y1="${sy(v)}" y2="${sy(v)}" stroke="${h ? '#9fd9b0' : '#f0f0f2'}" ${h ? 'stroke-dasharray="3 3"' : ''}/><text x="24" y="${sy(v) + 2.5}" font-size="7" text-anchor="end" fill="#9a9aa2">${v}</text>`; });
  let yol = '', ac = false; SK.forEach((v, i) => { if (v == null) { ac = false; return; } yol += (ac ? 'L' : 'M') + sx(i + 1).toFixed(1) + ' ' + sy(v).toFixed(1) + ' '; ac = true; });
  if (yol) sk += `<path d="${yol}" fill="none" stroke="#e11d48" stroke-width="1.6" stroke-linejoin="round"/>`;
  SK.forEach((v, i) => { const x = sx(i + 1); if (v == null) return; const d = v > 130 || v < 80; sk += `<circle cx="${x}" cy="${sy(v)}" r="${d ? 3.2 : 2.3}" fill="${d ? '#f59e0b' : '#e11d48'}" stroke="#fff" stroke-width="1"/><text x="${x}" y="${sy(v) - 5}" font-size="6.5" text-anchor="middle" fill="${d ? '#b45309' : '#55555c'}" font-weight="${d ? 700 : 400}">${v}</text>`; });
  gl.forEach((d) => { sk += `<text x="${sx(d.getDate())}" y="${SH + 22}" font-size="6.5" text-anchor="middle" fill="${d.getTime() === b0.getTime() ? A : d > b0 ? '#c8c8ce' : '#9a9aa2'}">${d.getDate()}</text>`; });
  sk += '</svg>';
  // Ölçüm kayıtları: gün · yazıldığı saat · değer
  const olcum = gl.map((d) => ({ d, k: tamAnahtar(d) })).filter((x) => seker[x.k] != null).map(({ d, k }) => { const v = seker[k], dd = v > 130 || v < 80;
    return `<span style="display:inline-flex;gap:5px;align-items:baseline;padding:3px 7px;border-radius:5px;background:${dd ? '#fff4e0' : '#f6f6f8'};font-size:8px"><b style="color:#1d1d22">${d.getDate()} ${AY[d.getMonth()].slice(0, 3)}</b><span style="color:#6b6b73">${sekerSaat[k] ? 'saat ' + esc(sekerSaat[k]) : 'saat —'}</span><b style="color:${dd ? '#b45309' : '#e11d48'}">${v}</b></span>`; }).join('');
  const enCok = kac.filter((x) => x[1] > 0).sort((x, y) => y[1] - x[1])[0];
  const stoklu = ilac.map((m) => ({ m, k: kalanStok(m) })), azalan = stoklu.filter((x) => x.k != null && x.k <= 7);
  const bitis = (k: number | null) => (k == null ? '—' : new Date(Date.now() + k * GUN).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }));
  return sayfa(PDF_AD.ilac, 'Günlük işaretler · açlık şekeri · uyum · stok', ay, `
${kpi([['Uyum', gereken ? '%' + Math.round((alinan / gereken) * 100) : '—', alinan + ' / ' + gereken + ' doz'], ['Kaçırılan', gereken - alinan + ' doz', enCok ? 'en çok ' + esc(enCok[0]) + ' (' + enCok[1] + ')' : 'yok'], ['Açlık şekeri ort.', SKx.length ? ort + ' mg/dL' : '—', SKx.length + ' ölçüm' + (dis.length ? ' · ' + dis.length + ' gün hedef dışı' : '')], ['Stok uyarısı', String(azalan.length), azalan.length ? azalan.map((x) => esc(x.m.ad) + ' · ' + x.k + ' gün').join(', ') : 'yok']])}
<div class="blok"><h2>Gün gün işaretler · ${AY[ay.getMonth()]}</h2>
<table style="table-layout:fixed"><tr>${bas}</tr>${izg}</table>
<div class="lej"><span><b style="color:#1f7a35">✓</b> alındı</span><span><b style="color:#c0392b">×</b> kaçırıldı</span><span>gri: gelmedi ya da o gün alınmıyor</span></div></div>
<div class="blok" style="gap:4px"><h2>Şeker takip çizelgesi · sabah açlık · <span style="text-transform:none">mg/dL</span></h2>${sk}
<div class="lej"><span><span style="display:inline-block;width:14px;height:7px;background:#e9f8ee;border:1px dashed #9fd9b0;vertical-align:-1px"></span> hedef aralık 80–130</span>${SKx.length ? `<span>Ort. <b style="color:#1d1d22">${ort}</b></span><span>En düşük <b style="color:#1d1d22">${Math.min(...SKx)}</b> · en yüksek <b style="color:#b45309">${Math.max(...SKx)}</b></span>` : '<span>Bu ay ölçüm yok</span>'}${dis.length ? `<span><b style="color:#b45309">●</b> hedef dışı: ${dis.join(', ')} ${AY[ay.getMonth()]}</span>` : ''}</div>
${olcum ? `<div style="font-size:8.5px;font-weight:700;color:#55555c;margin-top:2px">Ölçüm kayıtları · gün · yazıldığı saat · mg/dL</div><div style="display:flex;flex-wrap:wrap;gap:4px">${olcum}</div>` : ''}</div>
<div class="alt2"><div class="blok" style="flex:1.3"><h2>İlaç listesi ve stok</h2>
<table><tr><th>İlaç</th><th>Doz · zaman · saat</th><th class="n">Alınan</th><th class="n">Stok</th><th class="n">Tahmini bitiş</th></tr>
${stoklu.map(({ m, k }) => { const s = satirlar.find((x) => x[0] === m.id); return `<tr><td><b>${esc(m.ad)}</b></td><td>${esc([m.miktar, donemAd(m.saat), m.actok === 'ac' ? 'Aç' : m.actok === 'tok' ? 'Tok' : '', m.saat].filter(Boolean).join(' · '))}</td><td class="n">${s ? s[1] + ' / ' + s[2] : '—'}</td><td class="n" style="${k != null && k <= 7 ? `color:${A};font-weight:700` : ''}">${k == null ? '—' : k + ' gün'}</td><td class="n">${bitis(k)}</td></tr>`; }).join('')}</table></div>
<div class="blok" style="flex:1"><h2>Haftalık uyum</h2>
${hafta.filter((h) => h[1]).map((h, i) => `<div style="display:flex;align-items:center;gap:8px"><span style="width:44px">${i + 1}. hafta</span><div class="bar" style="flex:1"><i style="width:${Math.round((h[0] / h[1]) * 100)}%;background:#3ecf5a"></i></div><b style="width:40px;text-align:right">${h[0]} / ${h[1]}</b></div>`).join('') || '<span style="color:#9a9aa2">—</span>'}</div></div>
${azalan.length ? `<div class="uyari"><b>Stok</b><span>${azalan.map((x) => esc(x.m.ad) + ' yaklaşık ' + x.k + ' gün sonra (' + bitis(x.k) + ') bitiyor').join('; ')}.</span></div>` : ''}
<div class="not" style="height:40px"><b style="color:#1d1d22">Notlar</b> · doktor ya da eczacı görüşmesi için boş alan</div>
<div style="color:#9a9aa2;font-size:8px">Bu belge kişisel takip içindir; tıbbi değerlendirme yerine geçmez.</div>`);
}

// ---------- 3 · BÜTÇE ----------
/** Geçen aya göre değişim simgesi. harcama: artış kötü (kırmızı) */
function fark(c: number, p: number, harcama = false) {
  if (!p && !c) return '<em style="font-style:normal;color:#8a8a92">—</em>';
  if (c === p) return '<em style="font-style:normal;color:#8a8a92;font-weight:700">= aynı</em>';
  if (!p) return `<em style="font-style:normal;color:${harcama ? '#c0392b' : '#1f7a35'};font-weight:700">yeni</em>`;
  const up = c > p, iyi = harcama ? !up : up;
  return `<em style="font-style:normal;color:${iyi ? '#1f7a35' : '#c0392b'};font-weight:700">${up ? '▲' : '▼'} %${Math.abs(Math.round(((c - p) / Math.abs(p)) * 100))}</em>`;
}
const RENK = ['#f5a524', '#ff5b37', '#3b82f6', '#8b5cf6', '#14b8a6', '#ec4899', '#8a8a92'];
export function butceHtml(o: Ozet, gecen: boolean) {
  const A = R.ana, f = o.aile?.fin, bos = { ay: '', gelir: 0, gider: 0, kat: {} as Record<string, number>, hg: [0, 0, 0, 0, 0], hc: [0, 0, 0, 0, 0] };
  const B = (gecen ? f?.once : f?.bu) || bos, O = gecen ? null : f?.once || null;
  const ay = B.ay ? new Date(+B.ay.slice(0, 4), +B.ay.slice(5, 7) - 1, 1) : (() => { const d = new Date(); d.setDate(1); if (gecen) d.setMonth(d.getMonth() - 1); return d; })();
  const onAd = O ? AY[(ay.getMonth() + 11) % 12] : '', kalan = B.gelir - B.gider;
  const kat = Object.entries(B.kat).sort((a, b) => b[1] - a[1]), kmax = kat.length ? kat[0][1] : 1;
  const tumK = Array.from(new Set([...kat.map((k) => k[0]), ...Object.keys(O?.kat || {})]));
  // Kalan bakiye çizgisi: aylık gelir − biriken haftalık gider
  const birik = (x: typeof B) => { const r = [x.gelir]; x.hc.forEach((g) => r.push(r[r.length - 1] - g)); return r; };
  const KB = birik(B), KBO = O ? birik(O) : null, hepsi = [...KB, ...(KBO || []), 0];
  const mx = Math.max(...hepsi) || 1, mn = Math.min(...hepsi), W = 515, H = 120;
  const px = (i: number) => 46 + (i * (W - 120)) / 5, py = (v: number) => 10 + (1 - (v - mn) / (mx - mn || 1)) * H;
  const ET = ['Ay başı', '1. hafta', '2. hafta', '3. hafta', '4. hafta', 'Ay sonu'];
  let svg = `<svg width="${W}" height="${H + 30}" viewBox="0 0 ${W} ${H + 30}">`;
  [mn, (mn + mx) / 2, mx, 0].filter((v, i, a) => a.indexOf(v) === i).forEach((v) => { svg += `<line x1="40" x2="${W - 70}" y1="${py(v)}" y2="${py(v)}" stroke="${v === 0 ? '#d0d0d6' : '#f0f0f2'}"/><text x="34" y="${py(v) + 2.5}" font-size="7" text-anchor="end" fill="#9a9aa2">${tl(v / 1000)}b</text>`; });
  svg += `<path d="M${px(0)} ${py(Math.max(0, mn))} ${KB.map((v, i) => `L${px(i)} ${py(v)}`).join(' ')} L${px(5)} ${py(Math.max(0, mn))} Z" fill="${A}" fill-opacity=".08"/>`;
  if (KBO) svg += `<polyline points="${KBO.map((v, i) => `${px(i)},${py(v)}`).join(' ')}" fill="none" stroke="#b0b0b8" stroke-width="1.3" stroke-dasharray="4 3"/>`;
  svg += `<polyline points="${KB.map((v, i) => `${px(i)},${py(v)}`).join(' ')}" fill="none" stroke="${A}" stroke-width="2" stroke-linejoin="round"/>`;
  KB.forEach((v, i) => {
    svg += `<circle cx="${px(i)}" cy="${py(v)}" r="2.8" fill="${A}" stroke="#fff" stroke-width="1"/>`;
    if (i < 5) svg += `<text x="${px(i) + (i ? 0 : 6)}" y="${py(v) - 6}" font-size="7.5" text-anchor="${i ? 'middle' : 'start'}" font-weight="700" fill="#1d1d22">${tl(v)}</text>`;
    if (i > 0 && B.hc[i - 1]) svg += `<text x="${(px(i - 1) + px(i)) / 2}" y="${(py(KB[i - 1]) + py(v)) / 2 - 5}" font-size="7" fill="#c0392b">−${tl(B.hc[i - 1])}</text>`;
    svg += `<text x="${px(i)}" y="${H + 24}" font-size="7.5" text-anchor="middle" fill="#6b6b73">${ET[i]}</text>`;
  });
  svg += `<text x="${px(5) + 8}" y="${py(KB[5]) + 3}" font-size="8" font-weight="700" fill="${A}">${AY[ay.getMonth()]} ${tl(KB[5])} ₺</text>`;
  if (KBO) svg += `<text x="${px(5) + 8}" y="${py(KBO[5]) + (Math.abs(py(KBO[5]) - py(KB[5])) < 10 ? 13 : 4)}" font-size="8" fill="#8a8a92">${onAd} ${tl(KBO[5])} ₺</text>`;
  svg += '</svg>';
  const ak = ayAnahtari(ay), isl = (f?.islem || []).filter((r) => String(r[0]).startsWith(ak)).slice(0, 14);
  const artan = O ? tumK.map((k) => [k, (B.kat[k] || 0) - (O.kat[k] || 0), O.kat[k] || 0] as [string, number, number]).filter((x) => x[1] > 0 && x[2] > 0).sort((a, b) => b[1] - a[1]).slice(0, 2) : [];
  return sayfa(PDF_AD.butce, 'Gelir · gider · kategoriler' + (O ? ' · ' + onAd + ' ile kıyas' : ''), ay, `
${kpi([
    ['Gelir', tl(B.gelir) + ' ₺', B.hg.filter(Boolean).length + ' haftada', O ? fark(B.gelir, O.gelir) + ' · ' + onAd + ' ' + tl(O.gelir) : ''],
    ['Gider', tl(B.gider) + ' ₺', kat.length + ' kategori', O ? fark(B.gider, O.gider, true) + ' · ' + onAd + ' ' + tl(O.gider) : ''],
    ['Kalan', tl(kalan) + ' ₺', B.gelir ? 'gelirin %' + Math.round((kalan / B.gelir) * 100) + '’i' : '—', O ? fark(kalan, O.gelir - O.gider) + ' · ' + onAd + ' ' + tl(O.gelir - O.gider) : ''],
    ['En büyük gider', kat.length ? esc(kat[0][0]) : '—', kat.length ? tl(kat[0][1]) + ' ₺ · %' + Math.round((kat[0][1] / (B.gider || 1)) * 100) : '', O && kat.length ? fark(kat[0][1], O.kat[kat[0][0]] || 0, true) + ' · ' + onAd : ''],
  ])}
<div class="blok"><h2>Kategoriler${O ? ' · ' + ayaGore(onAd) + ' göre' : ''}</h2>
<table><tr><th>Kategori</th><th style="width:170px">Giderdeki payı</th><th class="n" style="width:78px">${AY[ay.getMonth()]}</th>${O ? `<th class="n" style="width:62px">${onAd}</th><th class="n" style="width:62px">Değişim</th>` : ''}</tr>
${tumK.map((k, i) => { const v = B.kat[k] || 0, y = Math.round((v / (B.gider || 1)) * 100), r = RENK[i % RENK.length]; return `<tr><td><span style="display:inline-block;width:7px;height:7px;border-radius:4px;background:${r};margin-right:5px"></span><b>${esc(k)}</b></td><td><div style="display:flex;align-items:center;gap:6px"><div class="bar" style="flex:1"><i style="width:${Math.round((v / kmax) * 100)}%;background:${r}"></i></div><b style="width:28px;text-align:right">%${y}</b></div></td><td class="n">${tl(v)} ₺</td>${O ? `<td class="n" style="color:#8a8a92">${tl(O.kat[k] || 0)} ₺</td><td class="n">${fark(v, O.kat[k] || 0, true)}</td>` : ''}</tr>`; }).join('') || `<tr><td colspan="5" style="color:#9a9aa2">Bu ay gider yok.</td></tr>`}
<tr><td style="border:0"><b>Toplam</b></td><td style="border:0"></td><td class="n" style="border:0"><b>${tl(B.gider)} ₺</b></td>${O ? `<td class="n" style="border:0;color:#8a8a92">${tl(O.gider)} ₺</td><td class="n" style="border:0">${fark(B.gider, O.gider, true)}</td>` : ''}</tr></table>
${O ? '<div class="lej"><span><b style="color:#1f7a35">▼</b> giderde düşüş / <b style="color:#1f7a35">▲</b> gelirde artış = iyi</span><span><b style="color:#c0392b">▲</b> giderde artış = dikkat</span></div>' : ''}</div>
<div class="blok" style="gap:4px"><h2>Kalan bakiye · aylık gelirden düşülen giderler</h2>${svg}
<div class="lej"><span><span style="display:inline-block;width:14px;height:2px;background:${A};vertical-align:2px"></span> ${AY[ay.getMonth()]}: ${tl(B.gelir)} ₺ gelir − haftalık giderler</span>${O ? `<span><span style="display:inline-block;width:14px;border-top:1.5px dashed #b0b0b8;vertical-align:2px"></span> ${onAd}</span>` : ''}<span style="color:#c0392b">−: o haftanın gideri</span></div></div>
${artan.length ? `<div class="uyari"><b>Dikkat</b><span>${artan.map((x) => esc(x[0]) + ' ' + ayaGore(onAd) + ' göre ▲ %' + Math.round((x[1] / x[2]) * 100) + ' (+' + tl(x[1]) + ' ₺)').join(' · ')}.</span></div>` : ''}
<div class="blok" style="gap:5px"><h2>İşlemler · son ${isl.length}</h2>
<table><tr><th style="width:46px">Tarih</th><th>Açıklama</th><th style="width:90px">Kategori</th><th class="n" style="width:70px">Tutar</th></tr>
${isl.map((r) => { const d = new Date(String(r[0]).slice(0, 10) + 'T12:00'); return `<tr><td>${isNaN(+d) ? esc(r[0]) : d.getDate() + ' ' + AY[d.getMonth()].slice(0, 3)}</td><td>${esc(r[2] || r[1])}</td><td>${r[3] ? 'Gelir' : esc(r[1])}</td><td class="n" style="font-weight:600;color:${r[3] ? '#1f7a35' : '#1d1d22'}">${r[3] ? '+' : '−'}${tl(Math.abs(r[4]))} ₺</td></tr>`; }).join('') || '<tr><td colspan="4" style="color:#9a9aa2">Bu ay işlem yok.</td></tr>'}</table>
<span style="color:#9a9aa2;font-size:8px">Kişisel kayıtlar; Şirket hesabı bu rapora girmez.</span></div>`);
}

export function pdfHtml(tur: PdfTur, o: Ozet, gecen: boolean) {
  const ay = new Date(); ay.setDate(1); if (gecen) ay.setMonth(ay.getMonth() - 1);
  return tur === 'is' ? isGunuHtml(o, ay) : tur === 'ilac' ? ilacHtml(o, ay) : butceHtml(o, gecen);
}
/** PDF dosyası üretip paylaşım penceresini açar (Drive, WhatsApp, e-posta…) */
export async function pdfPaylas(tur: PdfTur, o: Ozet, gecen: boolean) {
  const html = pdfHtml(tur, o, gecen);
  if (Platform.OS === 'web') return webYazdir(html);
  const { uri } = await Print.printToFileAsync({ html, width: 595, height: 842 });
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: PDF_AD[tur] });
  else await Print.printAsync({ uri });
}
/** Yazdır / PDF olarak kaydet (sistem yazdırma penceresi) */
export const pdfYazdir = (tur: PdfTur, o: Ozet, gecen: boolean) => { const html = pdfHtml(tur, o, gecen); return Platform.OS === 'web' ? webYazdir(html) : Print.printAsync({ html }); };
/** Web'de expo-print HTML'i yok sayar: raporu yeni sekmede açıp yazdırma penceresini getirir */
async function webYazdir(html: string) {
  const w = (globalThis as any).open?.('', '_blank'); if (!w) throw new Error('Açılır pencere engellendi');
  w.document.write(html); w.document.close(); w.focus(); setTimeout(() => w.print(), 400);
}
