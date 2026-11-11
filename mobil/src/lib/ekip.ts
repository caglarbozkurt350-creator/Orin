// Orvane Mobil · çalışanlar, olayların uygulanması, gelişim akışı (İK → CEO), Echo'nun yerel cevapları
// Masaüstündeki renderer/js/team.js ile aynı kurallar. Birini değiştirirken ötekini de güncelle.
import { useMemo } from 'react';
import C0 from '@/veri/calisanlar.json';
import { Beceri, Durum, Gelisim, Gorev, Hafiza, Mesaj, Olay, Ozet, uid, useDurum } from '@/lib/depo';

export type Calisan = { id: string; ad: string; grup: string; gorev: string; bagli: string; renk: string; foto?: string; kart?: string; aciklama?: string; hikaye?: string; yeni?: 1 };
export const LVL = ['', 'Başlangıç', 'Gelişiyor', 'Yetkin', 'Usta', 'Uzman'];
export const GT: Record<string, string> = { beceri: 'Yeni beceri', seviye: 'Seviye yükseltme', hafiza: 'Hafızaya ekleme' };
const BEC0: Record<string, [string, number, string][]> = {
  orin: [['Görev dağıtımı', 2, 'İşi doğru çalışana yönlendirir'], ['Önceliklendirme', 1, 'Acil ve önemli işleri ayırır'], ['Gelişim onayı', 2, 'Nika’nın önerdiği gelişimleri son kez değerlendirir']],
  orla: [['Koordinasyon', 2, 'Ekip arasındaki işleri sıraya koyar'], ['Görev takibi', 1, 'Açık görevleri izler, gecikeni bildirir']],
  nika: [['Çalışan kartları', 2, 'Kimlik kartlarını ve profilleri hazırlar'], ['Beceri geliştirme', 2, 'Çalışanlar için gelişim önerir'], ['Hafıza düzenleme', 1, 'Çalışan hafızalarını derler ve sadeleştirir']],
  echo: [['İş günü kaydı', 3, 'Günlük kayıtları tutar, Günü doldur kuralını uygular'], ['Sheets eşitleme', 3, 'Kayıtları Google Sheets ile eşitler'], ['Haftalık özet', 2, 'Hafta ve ay özetini çıkarır, eksik günleri bulur']],
  otto: [['Gelir-gider kaydı', 1, ''], ['Ödeme hatırlatma', 1, '']], iris: [['Sağlık takibi', 1, ''], ['Alışkanlık önerileri', 1, '']], marco: [['Haftalık menü', 1, ''], ['Market listesi', 1, '']],
  luca: [['Proje arama', 1, ''], ['Çizim arama', 1, '']], vera: [['Standart kontrolü', 1, ''], ['Kalite raporu', 1, '']], ada: [['Kod yazma', 1, ''], ['Hata ayıklama', 1, '']],
  remy: [['Takvim düzeni', 1, ''], ['Hatırlatma', 1, '']], sage: [['Araştırma', 1, ''], ['Özetleme', 1, '']], mia: [['Ev işleri planı', 1, ''], ['Aile takvimi', 1, '']],
  kai: [['Teknik bakım', 1, ''], ['Arıza teşhisi', 1, '']], cleo: [['Mesaj taslağı', 1, ''], ['Resmi yazışma', 1, '']],
};
const DESC0: Record<string, string> = { orin: 'şirketi yönetir, görevleri dağıtır, gelişimleri onaylar', orla: 'ekibi koordine eder, işleri sıraya koyar', nika: 'çalışan kartlarını hazırlar, beceri ve hafızaları geliştirir', echo: 'iş günü kayıtlarını toplar ve raporlar', otto: 'gelir-gider kaydını tutar, yaklaşan ödemeleri hatırlatır' };

export function bosOzet(): Ozet {
  return { v: 1, ts: 0, olaySira: 0, ekip: { m: {}, gorev: [], gel: [], sohbet: {} }, gun: {}, proj: [], ayar: { w1: 525, w2: 435 } };
}

// ---------- Olayları uygula (masaüstündeki tmApplyEvent ile aynı) ----------
export function uygula(o: Ozet, e: Olay) {
  const v = e.veri || {}, E = o.ekip;
  const push = (kim: string, m: Mesaj) => { const a = (E.sohbet[kim] = E.sohbet[kim] || []); if (!a.some((x) => x.id === m.id)) a.push(m); };
  if (e.tur === 'mesaj') push(v.kim, { id: e.id, r: 'ben', t: v.t, ts: e.ts, tur: v.mod === 'not' ? 'not' : v.mod === 'ses' ? 'ses' : 'mesaj', bek: v.bek ? 1 : undefined, kaynak: 'telefon' });
  else if (e.tur === 'cevap') push(v.kim, { id: e.id, r: 'o', t: v.t, ts: e.ts, qr: v.qr, kaynak: 'telefon' });
  else if (e.tur === 'gorev') {
    if (!E.gorev.some((g) => g.id === v.id)) {
      E.gorev.push({ id: v.id, kim: v.kim, metin: v.metin, onc: v.onc, son: v.son || '', durum: 'acik', bilgi: !!v.bilgi, yol: 'dogrudan', ts: e.ts });
      push(v.kim, { id: e.id + 's', r: 'sys', t: 'Çağlar doğrudan görev verdi' + (v.onc === 'acil' ? ' (acil)' : '') + ': ' + v.metin + (v.son ? ' · son tarih ' + v.son : ''), ts: e.ts });
      if (v.bilgi && v.kim !== 'orin') push('orin', { id: e.id + 'b', r: 'sys', t: 'Bilgi notu: Çağlar, ' + (v.ad || v.kim) + '’ya doğrudan görev verdi (Orin ve Orla atlandı): ' + v.metin, ts: e.ts });
    }
  } else if (e.tur === 'gorev_durum') { const g = E.gorev.find((x) => x.id === v.id); if (g) { g.durum = v.durum; g.bts = v.durum === 'bitti' ? e.ts : null; } }
  else if (e.tur === 'gelisim') {
    if (!E.gel.some((g) => g.id === v.id)) { const g: Gelisim = { id: v.id, kim: v.kim, tur: v.gtur, ad: v.ad || '', metin: v.metin || '', asama: v.kimden === 'nika' ? 'ceo' : 'ik', kimden: v.kimden || 'cagla', ts: e.ts }; if (v.kimden === 'nika') g.ik = { ts: e.ts, ok: 1 }; E.gel.push(g); }
  } else if (e.tur === 'gelisim_karar') {
    const g = E.gel.find((x) => x.id === v.id); if (!g || g.asama !== v.asama) return;
    if (v.asama === 'ik') { g.ik = { ts: e.ts, ok: v.ok ? 1 : 0 }; g.asama = v.ok ? 'ceo' : 'red'; }
    else { g.ceo = { ts: e.ts, ok: v.ok ? 1 : 0 }; g.asama = v.ok ? 'tamam' : 'red'; if (v.ok) gelisimUygula(o, g, e.ts); }
  } else if (e.tur === 'kayit') {
    const d = (o.gun[v.k] = o.gun[v.k] || { L: null, T: 0, OT: 0, e: [] });
    d.e.push([v.kod, v.is, v.dk]); d.T += v.dk;
  }
}
function gelisimUygula(o: Ozet, g: Gelisim, ts: number) {
  const m = (o.ekip.m[g.kim] = o.ekip.m[g.kim] || {});
  const b: Beceri[] = (m.bec || beceriler(g.kim, o)).map((x) => ({ ...x }));
  if (g.tur === 'beceri') { const ex = b.find((x) => x.ad.toLocaleLowerCase('tr') === g.ad.toLocaleLowerCase('tr')); if (ex) ex.sv = Math.min(5, ex.sv + 1); else b.push({ ad: g.ad, sv: 1, not: g.metin }); m.bec = b; }
  else if (g.tur === 'seviye') { b.forEach((x) => { if (x.ad === g.ad) x.sv = Math.min(5, x.sv + 1); }); m.bec = b; }
  else { const h: Hafiza[] = (m.haf || []).slice(); h.push({ id: g.id + 'h', metin: g.metin, kaynak: (g.kimden === 'nika' ? 'Nika önerdi' : 'Çağlar istedi') + ' · Nika ve Orin onayladı', ts }); m.haf = h; }
}

/** Ekranda görünen özet: masaüstü özeti + özete henüz girmemiş olaylar */
export function gorunum(d: Durum): Ozet {
  const o: Ozet = JSON.parse(JSON.stringify(d.ozet || bosOzet()));
  d.olaylar.filter((e) => !e.sira || e.sira > o.olaySira).sort((a, b) => a.ts - b.ts).forEach((e) => uygula(o, e));
  return o;
}
export function useGorunum() { const d = useDurum((x) => x); return useMemo(() => gorunum(d), [d]); }

// ---------- Çalışanlar ----------
export function calisanlar(o: Ozet): Calisan[] {
  const m = o.ekip.m, r: Calisan[] = [], ids: Record<string, 1> = {};
  (C0.calisanlar as Calisan[]).forEach((c) => { ids[c.id] = 1; r.push({ ...c, ...(m[c.id] as any) }); });
  Object.keys(m).forEach((id) => { const x = m[id]; if (!ids[id] && x.yeni && !x.sil) r.push({ id, ad: x.ad || id, grup: x.grup || 'ekip', gorev: x.gorev || '', bagli: x.bagli || 'Orla', renk: x.renk || '#8f9bb3', aciklama: x.aciklama, hikaye: x.hikaye, yeni: 1 }); });
  return r.filter((c) => !(m[c.id] && m[c.id].sil));
}
export function beceriler(id: string, o: Ozet): Beceri[] { const m = o.ekip.m[id]; return (m && m.bec) || (BEC0[id] || []).map((x) => ({ ad: x[0], sv: x[1], not: x[2] })); }
export function hafiza(id: string, o: Ozet): Hafiza[] { const m = o.ekip.m[id]; return (m && m.haf) || []; }
export function aciklama(c: Calisan) { return c.aciklama || DESC0[c.id] || c.gorev; }
export function acikGorevler(o: Ozet, id?: string) { return o.ekip.gorev.filter((g) => g.durum !== 'bitti' && (!id || g.kim === id)); }
export function durumNoktasi(c: Calisan, o: Ozet): 'ok' | 'bz' | 'id' {
  if (c.grup === 'yonetim' || c.id === 'echo') return 'ok';
  const a = acikGorevler(o, c.id); if (a.some((g) => g.onc === 'acil')) return 'bz'; return a.length ? 'ok' : 'id';
}
export function bekleyenGelisim(o: Ozet, id: string) {
  const g = o.ekip.gel; if (id === 'nika') return g.filter((x) => x.asama === 'ik'); if (id === 'orin') return g.filter((x) => x.asama === 'ceo');
  return g.filter((x) => x.kim === id && (x.asama === 'ik' || x.asama === 'ceo'));
}
export function zincir(c: Calisan, hepsi: Calisan[]) {
  const r: string[] = []; let x: Calisan | undefined = c, g = 0;
  while (x && g++ < 6) { r.unshift(x.ad); const b: string = x.bagli; if (!b || b === 'Çağlar') { r.unshift('Çağlar'); break; } x = hepsi.find((y) => y.ad === b); if (!x) { r.unshift(b); break; } }
  return r;
}

// ---------- Echo: yerel cevaplar (gerçek kayıtlardan; masaüstü özetindeki gün verisi) ----------
const GN = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
export const gunAnahtari = (d: Date) => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
const sa = (m: number) => { const h = Math.floor(m / 60), r = Math.round(m % 60); return h ? h + ' sa ' + r + ' dk' : r + ' dk'; };
function haftaBasi() { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; }
const kisa = (k: string) => { const a = k.split('-').map(Number), d = new Date(a[0], a[1] - 1, a[2]); return d.getDate() + ' ' + AY[d.getMonth()].slice(0, 3); };

export function echoCevap(o: Ozet, t: string): { t: string; qr: string[] } | null {
  if (!o.ts) return null; // masaüstünden veri gelmedi
  const q = t.toLocaleLowerCase('tr');
  if (/eksik|hata|boş/.test(q)) return eksikGunler(o);
  if (/\bay\b|ayın|aylık|bu ay/.test(q)) return buAy(o);
  if (/hafta|rapor|özet|durum/.test(q)) return buHafta(o);
  return null;
}
function buHafta(o: Ozet) {
  const d = haftaBasi(), bug = gunAnahtari(new Date()); let tam = 0, iz = 0; const ek: [string, number][] = []; let bu: [number, number] | null = null; const g: Record<string, number> = {}; let top = 0;
  for (let i = 0; i < 5; i++) {
    const k = gunAnahtari(d); d.setDate(d.getDate() + 1); const x = o.gun[k]; if (!x) continue;
    x.e.forEach(([kod, , dk]) => { const n = /^\d+\./.test(kod) ? 'SY' + kod.split('.')[0] : 'Diğer'; g[n] = (g[n] || 0) + dk; top += dk; });
    if (!x.L) continue; if (x.D) { iz++; continue; } const H = x.L + (x.OT || 0);
    if (x.T >= H) tam++; else if (k === bug) bu = [x.T, H - x.T]; else ek.push([k, H - x.T]);
  }
  const p = []; if (tam) p.push(tam + ' gün tam'); if (iz) p.push(iz + ' gün izin');
  let s = p.length ? p.join(', ') : 'Bu hafta henüz tamamlanan gün yok';
  if (ek.length) s += ', ' + ek.map(([k, m]) => { const a = k.split('-').map(Number); return GN[new Date(a[0], a[1] - 1, a[2]).getDay()] + '’da ' + m + ' dk eksik'; }).join(', ') + ' var';
  s += '.'; if (bu) s += ' Bugün ' + bu[0] + ' dk girildi, ' + bu[1] + ' dk kaldı.';
  const en = Object.keys(g).filter((n) => n !== 'Diğer').sort((a, b) => g[b] - g[a])[0]; if (en && top) s += ' En çok süre ' + en + '’de (%' + Math.round((g[en] / top) * 100) + ').';
  return { t: s, qr: ek.length ? ['Eksik günler', 'Bu ayın özeti'] : ['Bu ayın özeti'] };
}
function buAy(o: Ozet) {
  const t = new Date(); let n = 0, s = 0, ot = 0, er = 0;
  for (let d = 1; d <= t.getDate(); d++) { const k = t.getFullYear() + '-' + (t.getMonth() + 1) + '-' + d, x = o.gun[k]; if (!x) continue; if (x.T > 0) { n++; s += x.T; } ot += x.OT || 0; if (x.L && !x.D && x.T < x.L + (x.OT || 0) && d < t.getDate()) er++; }
  return { t: AY[t.getMonth()] + ': ' + n + ' gün kayıt, toplam ' + sa(s) + '.' + (er ? ' ' + er + ' günde eksik ya da hatalı kayıt var.' : ' Eksik gün yok.') + (ot ? ' Fazla mesai ' + sa(ot) + '.' : ''), qr: er ? ['Eksik günler'] : [] };
}
function eksikGunler(o: Ozet) {
  const t = new Date(), a: string[] = [];
  for (let d = 1; d < t.getDate(); d++) { const k = t.getFullYear() + '-' + (t.getMonth() + 1) + '-' + d, x = o.gun[k]; if (!x || !x.L || x.D) continue; const H = x.L + (x.OT || 0); if (x.T < H) a.push(kisa(k) + (x.T ? ' (' + (H - x.T) + ' dk fark)' : ' (kayıt yok)')); }
  return { t: a.length ? 'Bu ay düzeltilmesi gereken günler: ' + a.join(', ') + '.' : 'Bu ay eksik ya da hatalı gün yok.', qr: [] };
}
export { uid };
export type { Gorev, Gelisim, Mesaj };
