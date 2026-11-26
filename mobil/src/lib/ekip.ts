// Orvane Mobil · çalışanlar, olayların uygulanması, gelişim akışı (İK → CEO), Echo'nun yerel cevapları
// Masaüstündeki renderer/js/team.js ile aynı kurallar. Birini değiştirirken ötekini de güncelle.
import { useMemo } from 'react';
import C0 from '@/veri/calisanlar.json';
import { bugunAnahtari, bugunIsareti, sekerSiniri, yerelSeker } from '@/lib/bugun';
import { Aile, Beceri, ButceAy, Durum, Etkinlik, Gelisim, Gorev, Hafiza, Kisi, Mesaj, Olay, Ortak, Ozet, uid, useDurum } from '@/lib/depo';

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
  kai: [['Teknik bakım', 1, ''], ['Arıza teşhisi', 1, '']], cleo: [['Mesaj taslağı', 1, ''], ['Resmi yazışma', 1, '']], nerya: [['Alışveriş araştırması', 1, ''], ['Satın alma önerisi', 1, '']],
};
const DESC0: Record<string, string> = { orin: 'şirketi yönetir, görevleri dağıtır, gelişimleri onaylar', orla: 'ekibi koordine eder, işleri sıraya koyar', nika: 'çalışan kartlarını hazırlar, beceri ve hafızaları geliştirir', echo: 'iş günü kayıtlarını toplar ve raporlar', otto: 'gelir-gider kaydını tutar, yaklaşan ödemeleri hatırlatır' };

const bosAy = (ay: string): ButceAy => ({ ay, gelir: 0, gider: 0, kat: {}, hg: [0, 0, 0, 0, 0], hc: [0, 0, 0, 0, 0] });
export const SPOR_TUR: Record<string, string> = { kosu: 'Koşu', bisiklet: 'Bisiklet', fitness: 'Fitness', yuzme: 'Yüzme', yoga: 'Yoga', diger: 'Diğer' };
/** Masaüstündeki OT9.spor ile aynı kurallar */
function sporUygula(o: Ozet, v: any) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.k || '') || (v.kim !== 'cagla' && v.kim !== 'kubra')) return;
  const a = (o.aile = o.aile || bosAile()), sp = (a.spor = { ...(a.spor || {}) }), s = (x: any, m: number) => Math.max(0, Math.min(m, Math.round(+x) || 0));
  const y: any = { adim: s(v.adim, 100000), dk: s(v.dk, 600), tur: SPOR_TUR[v.tur] ? v.tur : '', tdk: s(v.tdk, 600) };
  if (!y.tur) y.tdk = 0; if (/^\d{2}:\d{2}$/.test(v.s || '')) y.s = v.s;
  const k = v.k + '|' + v.kim; if (!y.adim && !y.dk && !y.tdk) delete sp[k]; else sp[k] = y;
}
export function bosAile(): Aile { return { fin: { bu: bosAy(''), once: bosAy(''), islem: [] }, ilac: [], al: {}, seker: {}, tcmb: null }; }
export function bosOzet(): Ozet {
  return { v: 1, ts: 0, olaySira: 0, ekip: { m: {}, gorev: [], gel: [], sohbet: {} }, gun: {}, proj: [], ayar: { w1: 525, w2: 435 } };
}

// Bilgi notu: yalnız kimin ne yaptığı (masaüstündeki bilgiNotu ile aynı)
export function yonelme(ad: string) { const s = ad.toLocaleLowerCase('tr').replace(/y$/, 'i'), v = (s.match(/[aıoueiöü]/g) || ['a']).pop() as string, k = /[aıou]/.test(v), son = /[aıoueiöü]$/.test(s); return ad + '’' + (son ? 'y' : '') + (k ? 'a' : 'e'); }
export const bilgiNotu = (ad: string) => 'Bilgi notu: Çağlar, ' + yonelme(ad) + ' doğrudan görev verdi.';

// Zincir (masaüstüyle aynı): Nika (ik) → Orin (orin) → Çağlar (ceo, son onay) → tamam / red. Orin kendi talebini onaylayamaz: Nika'dan sonra doğrudan Çağlar'a gider.
export const sonrakiAsama = (_g: { kim: string }): 'orin' | 'ceo' => 'orin';

// ---------- Olayları uygula (masaüstündeki tmApplyEvent ile aynı) ----------
export function uygula(o: Ozet, e: Olay) {
  const v = e.veri || {}, E = o.ekip;
  const push = (kim: string, m: Mesaj) => { const a = (E.sohbet[kim] = E.sohbet[kim] || []); if (!a.some((x) => x.id === m.id)) a.push(m); };
  if (e.tur === 'mesaj') push(v.kim, { id: e.id, r: 'ben', t: v.t, ts: e.ts, tur: v.mod === 'not' ? 'not' : v.mod === 'ses' ? 'ses' : 'mesaj', bek: v.bek ? 1 : undefined, kaynak: 'telefon' });
  else if (e.tur === 'cevap') push(v.kim, { id: e.id, r: 'o', t: v.t, ts: e.ts, qr: v.qr, kaynak: 'telefon' });
  else if (e.tur === 'gorev') {
    if (!E.gorev.some((g) => g.id === v.id)) {
      E.gorev.push({ id: v.id, kim: v.kim, metin: v.metin, onc: v.onc, son: v.son || '', durum: 'acik', bilgi: !!v.bilgi, yol: 'dogrudan', ts: e.ts, ...(v.sureDk ? { sureDk: +v.sureDk, bitis: e.ts + v.sureDk * 60000 } : {}), ...(v.tokenLimit ? { tokenLimit: +v.tokenLimit } : {}) });
      push(v.kim, { id: e.id + 's', r: 'sys', t: 'Çağlar doğrudan görev verdi' + (v.onc === 'acil' ? ' (acil)' : '') + ': ' + v.metin + (v.son ? ' · son tarih ' + v.son : ''), ts: e.ts });
      if (v.bilgi && v.kim !== 'orin') push('orin', { id: e.id + 'b', r: 'sys', t: bilgiNotu(v.ad || v.kim), ts: e.ts });
    }
  } else if (e.tur === 'gorev_durum') { const g = E.gorev.find((x) => x.id === v.id); if (g) { g.durum = v.durum; g.bts = v.durum === 'bitti' ? e.ts : null; } }
  else if (e.tur === 'gelisim') {
    if (!E.gel.some((g) => g.id === v.id)) { const g: Gelisim = { id: v.id, kim: v.kim, tur: v.gtur, ad: v.ad || '', metin: v.metin || '', asama: 'ik', kimden: v.kimden || 'cagla', ts: e.ts }; if (v.kimden === 'nika') { g.ik = { ts: e.ts, ok: 1 }; g.asama = sonrakiAsama(g); } E.gel.push(g); }
  } else if (e.tur === 'gelisim_karar') {
    const g = E.gel.find((x) => x.id === v.id); if (!g || g.asama !== v.asama) return;
    if (v.asama === 'ik') { g.ik = { ts: e.ts, ok: v.ok ? 1 : 0 }; g.asama = v.ok ? sonrakiAsama(g) : 'red'; }
    else if (v.asama === 'orin') { g.orin = { ts: e.ts, ok: v.ok ? 1 : 0, kim: 'cagla' }; g.asama = v.ok ? 'ceo' : 'red'; }
    else { g.ceo = { ts: e.ts, ok: v.ok ? 1 : 0 }; g.asama = v.ok ? 'tamam' : 'red'; if (v.ok) gelisimUygula(o, g, e.ts); }
  } else if (e.tur === 'mesaj_sil') { const a = E.sohbet[v.kim]; if (a) { const vardi = a.some((m) => m.id === v.id); E.sohbet[v.kim] = a.filter((m) => !(m.id === v.id || (!vardi && v.ts && m.ts === v.ts))); } }
  else if (e.tur === 'sohbet_temizle') { const a = E.sohbet[v.kim]; if (a) E.sohbet[v.kim] = a.filter((m) => m.ts > e.ts);
  } else if (e.tur === 'kayit') {
    const d = (o.gun[v.k] = o.gun[v.k] || { L: null, T: 0, OT: 0, e: [] });
    d.e.push(v.du ? [v.kod, v.is, v.dk, v.du] : [v.kod, v.is, v.dk]); d.T += v.dk;
  } else if (e.tur === 'kayit_duzelt' || e.tur === 'kayit_sil') {
    // masaüstündeki orv-telefon.js → OT9.bul ile aynı: önce verilen sıra, eşleşmezse ilk aynı kayıt
    const d = o.gun[v.k]; if (!d || !v.eski) return;
    const es = (x: any[]) => x && x[0] === v.eski[0] && x[1] === v.eski[1] && +x[2] === +v.eski[2];
    let i = v.n != null && es(d.e[v.n]) ? v.n : d.e.findIndex(es); if (i < 0) return;
    const x = d.e[i]; d.T -= +x[2] || 0;
    if (e.tur === 'kayit_sil') { d.e.splice(i, 1); return; }
    const y = v.yeni || {}, du = y.du === '' ? undefined : y.du || x[3];
    const n: any[] = [y.kod || x[0], y.is != null ? y.is : x[1], +y.dk > 0 ? +y.dk : x[2]]; if (du) n.push(du);
    d.e[i] = n as any; d.T += +n[2];
  } else if (e.tur === 'izin_sil') {
    const pa = (k: string) => { const a = k.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); };
    const son = pa(v.s || v.b);
    for (let d = pa(v.b), n = 0; d <= son && n < 31; d.setDate(d.getDate() + 1), n++) {
      const k = gunAnahtari(d), g = o.gun[k];
      if (g?.D && (!v.t || g.D === v.t || (v.t === 'rapor13' && g.D === 'rapor4'))) { const y = { ...g }; delete y.D; o.gun[k] = y; }
    }
  } else if (/^(etkinlik|etkinlik_sil|ozel_gun|ozel_gun_sil|es_harcama|es_gelir|finans_kayit|cep_iste|es_cep_iste)$/.test(e.tur)) {
    aileUygula(o, e);
  } else if (e.tur === 'spor') {
    sporUygula(o, v);
  } else if (/^(menu_yaz|market_ekle|market_tik|market_temizle|oneri_ekle|oneri_karar|ev_ekle|ev_tik|ev_temizle)$/.test(e.tur)) {
    katUygula(o, e);
  } else if (/^es_ilac_(al|kaydet|sil)$/.test(e.tur) || e.tur === 'ilac_al' || e.tur === 'ilac_kaydet' || e.tur === 'ilac_sil' || e.tur === 'seker') {
    const a = (o.aile = o.aile || bosAile());
    if (e.tur.startsWith('es_') && a.ilac.some((x) => x.id === v.id && x.kim !== 'kubra')) return; // eş yalnız kendi ilacını değiştirir
    if (e.tur === 'ilac_al' || e.tur === 'es_ilac_al') { const k = v.k + '|' + v.id; if (v.al) a.al[k] = 1; else delete a.al[k]; }
    else if (e.tur === 'ilac_sil' || e.tur === 'es_ilac_sil') a.ilac = a.ilac.filter((x) => x.id !== v.id);
    else if (e.tur === 'seker') { const n = Math.round(+v.v); a.sekerSaat = { ...(a.sekerSaat || {}) }; if (n >= 20 && n <= 600) { a.seker[v.k] = n; if (/^\d{2}:\d{2}$/.test(v.s || '')) a.sekerSaat[v.k] = v.s; } else { delete a.seker[v.k]; delete a.sekerSaat[v.k]; } }
    else {
      const y: any = { ad: v.ad, miktar: v.miktar || '', saat: v.saat || '08:00', tekrar: v.tekrar || 'gun', actok: v.actok || '', not: v.not || '' };
      if (v.stok != null && v.stok !== '') { y.stok = Math.max(0, Math.round(+v.stok) || 0); y.stokTs = e.ts; }
      const m = a.ilac.find((x) => x.id === v.id); if (m) Object.assign(m, y); else a.ilac.push({ id: v.id, eklendi: e.ts, kim: e.tur === 'es_ilac_kaydet' ? 'kubra' : 'cagla', ...y });
    }
  } else if (e.tur === 'izin') {
    // masaüstündeki OB.izKaydet ile aynı: yalnız iş günleri; başka türle dolu gün atlanır
    const pa = (k: string) => { const a = k.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); };
    const son = pa(v.s || v.b);
    for (let d = pa(v.b), n = 0; d <= son && n < 31; d.setDate(d.getDate() + 1), n++) {
      const k = gunAnahtari(d), g = o.gun[k];
      if (g ? !g.L || (g.D && g.D !== v.t) : d.getDay() === 0 || d.getDay() === 6) continue;
      o.gun[k] = { ...(g || { L: null, T: 0, OT: 0, e: [] }), D: v.t };
    }
  }
}
/** Ailem kategorileri (masaüstü orv-telefon.js → OT9.aileOlay ile aynı kurallar): menü, market, satın alma, ev işleri */
function katUygula(o: Ozet, e: Olay) {
  const v = e.veri || {}, a = (o.aile = o.aile || bosAile());
  const menu = (a.menu = { ...(a.menu || {}) }), market = (a.market = a.market || []), oneri = (a.oneri = a.oneri || []), ev = (a.ev = a.ev || []);
  if (e.tur === 'menu_yaz') { if (!/^[0-6]-(ogle|aksam)$/.test(v.k || '')) return; const y = String(v.v || '').trim().slice(0, 60); if (y) menu[v.k] = y; else delete menu[v.k]; }
  else if (e.tur === 'market_ekle') { const ad = String(v.ad || '').trim().slice(0, 60); if (v.id && ad && !market.some((x) => x.id === v.id)) market.push({ id: v.id, ad, al: false }); }
  else if (e.tur === 'market_tik') { const m = market.find((x) => x.id === v.id); if (m) m.al = !!v.al; }
  else if (e.tur === 'market_temizle') a.market = market.filter((x) => !x.al);
  else if (e.tur === 'oneri_ekle') { const ad = String(v.ad || '').trim().slice(0, 80); if (v.id && ad && !oneri.some((x) => x.id === v.id)) oneri.push({ id: v.id, ad, fiyat: String(v.fiyat || ''), alt: String(v.alt || ''), otto: '', karar: 'bekliyor', ts: e.ts }); }
  else if (e.tur === 'oneri_karar') { const x = oneri.find((y) => y.id === v.id); if (x && ['bekliyor', 'onay', 'ertele', 'red'].includes(v.karar)) x.karar = v.karar; }
  else if (e.tur === 'ev_ekle') { const ad = String(v.ad || '').trim().slice(0, 80); if (v.id && ad && !ev.some((x) => x.id === v.id)) ev.push({ id: v.id, ad, kim: ['Ortak', 'Çağlar', 'Kübra'].includes(v.kim) ? v.kim : 'Ortak', bitti: false }); }
  else if (e.tur === 'ev_tik') { const m = ev.find((x) => x.id === v.id); if (m) m.bitti = !!v.bitti; }
  else if (e.tur === 'ev_temizle') a.ev = ev.filter((x) => !x.bitti);
}
/** Aile olayları (masaüstü orv-aile.js → OAI.uygula ile aynı kurallar): takvim, randevu, özel gün, harcama / gelir */
function aileUygula(o: Ozet, e: Olay) {
  const v = e.veri || {}, a = (o.aile = o.aile || bosAile()), es = o.rol === 'es', kim: Kisi = es ? 'kubra' : 'cagla';
  const O = (a.ortak = a.ortak || bosOrtak());
  if (e.tur === 'etkinlik') {
    const m = O.takvim.find((x) => x.id === v.id); if (m && es && m.kim !== 'kubra') return;
    const y: Partial<Etkinlik> = { ad: v.ad, tarih: v.tarih, saat: v.saat || '', tur: v.tur === 'randevu' ? 'randevu' : 'etkinlik', yer: v.yer || '', not: v.not || '', kisi: v.kisi || kim };
    if (m) Object.assign(m, y); else O.takvim.push({ id: v.id, kim, ts: e.ts, ...(y as any) });
    O.takvim.sort((x, z) => (x.tarih + (x.saat || '')).localeCompare(z.tarih + (z.saat || '')));
  } else if (e.tur === 'etkinlik_sil') O.takvim = O.takvim.filter((x) => x.id !== v.id || (es && x.kim !== 'kubra'));
  else if (e.tur === 'ozel_gun') {
    const m = O.ozel.find((x) => x.id === v.id); if (m && es && m.kim !== 'kubra') return;
    const y = { ad: v.ad, tarih: v.tarih, tur: v.tur || 'diger', kisi: v.kisi === 'cagla' || v.kisi === 'kubra' ? v.kisi : undefined }; if (m) Object.assign(m, y); else O.ozel.push({ id: v.id, kim, ...y });
  } else if (e.tur === 'ozel_gun_sil') O.ozel = O.ozel.filter((x) => x.id !== v.id || (es && x.kim !== 'kubra'));
  else if (e.tur === 'cep_iste' || e.tur === 'es_cep_iste') {
    // 0.9.11: cep harçlığı iste → yalnız isteyenin cebi artar; Aile Bütçesi ve gelir değişmez
    const t = Math.round((+String(v.tutar).replace(',', '.') || 0) * 100) / 100, c = O.cep[e.tur === 'cep_iste' ? 'c' : 'e']; if (!(t > 0) || !c) return;
    c.har = (c.har || 0) + t; if (c.kal != null) { c.kal += t; c.gunluk = O.cep.kalanGun ? Math.max(0, Math.round(c.kal / O.cep.kalanGun)) : c.gunluk; } else c.kal = t;
  } else {
    // Harcama / gelir: es_harcama {tutar, ad, kasa cep|ortak, kat} · es_gelir · finans_kayit {tur, kim, tutar, kalem, tarih, hk?}
    if (e.tur === 'finans_kayit' && v.kim === 'sirket') return;
    const gelir = e.tur === 'es_gelir' || (e.tur === 'finans_kayit' && v.tur === 'gelir'), tutar = Math.round((+String(v.tutar).replace(',', '.') || 0) * 100) / 100; if (!(tutar > 0)) return;
    const kasa: 'o' | 'c' | 'e' = gelir ? 'o' : e.tur === 'es_harcama' ? (v.kasa === 'cep' ? 'e' : 'o') : v.hk === 'c' ? 'c' : 'o';
    const kat = gelir ? v.kat || v.kalem || 'Gelir' : kasa === 'e' ? 'Cep harçlığı · Eşi' : e.tur === 'es_harcama' ? v.kat || 'Diğer' : v.kalem || 'Diğer';
    const d = new Date(e.ts), tarih = v.tarih || d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    O.hareket.unshift([tarih, gelir ? 1 : 0, kat, e.tur === 'finans_kayit' ? v.not || '' : v.ad || '', tutar, kasa, kim]);
    const ay = new Date(); if (tarih.slice(0, 7) !== ay.getFullYear() + '-' + String(ay.getMonth() + 1).padStart(2, '0')) return;
    const tr = O.trend[O.trend.length - 1]; if (tr) tr[gelir ? 1 : 2] += tutar;
    if (gelir) { a.fin.bu.gelir += tutar; return; }
    a.fin.bu.gider += tutar; a.fin.bu.kat[kat] = (a.fin.bu.kat[kat] || 0) + tutar;
    if (kasa === 'o') { O.kasa.ortak += tutar; O.kat[kat] = (O.kat[kat] || 0) + tutar; }
    else { O.kasa[kasa] += tutar; const c = O.cep[kasa]; if (c) { c.harcanan += tutar; if (c.kal != null) { c.kal -= tutar; c.gunluk = O.cep.kalanGun ? Math.max(0, Math.round(c.kal / O.cep.kalanGun)) : c.gunluk; } } }
  }
}
export function bosOrtak(): Ortak { return { ad: { cagla: 'Çağlar', kubra: 'Kübra' }, trend: [], kasa: { ortak: 0, c: 0, e: 0 }, kat: {}, cep: {}, hareket: [], odeme: [], takvim: [], ozel: [], izin: {} }; }
function gelisimUygula(o: Ozet, g: Gelisim, ts: number) {
  const m = (o.ekip.m[g.kim] = o.ekip.m[g.kim] || {});
  const b: Beceri[] = (m.bec || beceriler(g.kim, o)).map((x) => ({ ...x }));
  if (g.tur === 'beceri') { const ex = b.find((x) => x.ad.toLocaleLowerCase('tr') === g.ad.toLocaleLowerCase('tr')); if (ex) ex.sv = Math.min(5, ex.sv + 1); else b.push({ ad: g.ad, sv: 1, not: g.metin }); m.bec = b; }
  else if (g.tur === 'seviye') { b.forEach((x) => { if (x.ad === g.ad) x.sv = Math.min(5, x.sv + 1); }); m.bec = b; }
  else { const h: Hafiza[] = (m.haf || []).slice(); h.push({ id: g.id + 'h', metin: g.metin, kaynak: (g.kimden === 'nika' ? 'Nika önerdi' : 'Çağlar istedi') + ' · Nika ve Orin onayladı', ts }); m.haf = h; }
}

/** Ekranda görünen özet: masaüstü özeti + özete henüz girmemiş olaylar.
 *  Bugün bu telefonda atılan ilaç işaretleri özete girmiş olsa da yeniden uygulanır: masaüstünden gelen özet
 *  işareti içermese bile (eski özet, masaüstünde kaybolan olay) işaret yerel 00:00'a kadar görünür kalır.
 *  Bu telefonda girilen son 62 günün şeker ölçümleri de aynı şekilde yeniden uygulanır (lib/bugun yerelSeker). */
export function gorunum(d: Durum): Ozet {
  const o: Ozet = JSON.parse(JSON.stringify(d.ozet || bosOzet())), k = bugunAnahtari(), sk = sekerSiniri();
  d.olaylar.filter((e) => !e.sira || e.sira > o.olaySira || bugunIsareti(e, k) || yerelSeker(e, sk)).sort((a, b) => a.ts - b.ts).forEach((e) => uygula(o, e));
  return o;
}
// Görünüm bütün ekranlarda aynı durum nesnesinden bir kez hesaplanır (her kanca ayrı kopya üretmesin)
let _gd: Durum | null = null, _go: Ozet | null = null;
export function useGorunum() { const d = useDurum((x) => x); if (_gd !== d || !_go) { _go = gorunum(d); _gd = d; } return _go; }

// ---------- Çalışanlar ----------
export function calisanlar(o: Ozet): Calisan[] {
  const m = o.ekip.m, r: Calisan[] = [], ids: Record<string, 1> = {};
  (C0.calisanlar as Calisan[]).forEach((c) => { ids[c.id] = 1; const u: any = { ...(m[c.id] as any) }; delete u.sil; r.push({ ...c, ...u }); });
  Object.keys(m).forEach((id) => { const x = m[id]; if (!ids[id] && x.yeni && !x.sil) r.push({ id, ad: x.ad || id, grup: x.grup || 'ekip', gorev: x.gorev || '', bagli: x.bagli || 'Orla', renk: x.renk || '#8f9bb3', aciklama: x.aciklama, hikaye: x.hikaye, yeni: 1 }); });
  return r.filter((c) => ids[c.id] || !(m[c.id] && m[c.id].sil)); // 0.7.14: demirbaş 15 çalışan silinemez
}
export function beceriler(id: string, o: Ozet): Beceri[] { const m = o.ekip.m[id]; return (m && m.bec) || (BEC0[id] || []).map((x) => ({ ad: x[0], sv: x[1], not: x[2] })); }
export function hafiza(id: string, o: Ozet): Hafiza[] { const m = o.ekip.m[id]; return (m && m.haf) || []; }
export function aciklama(c: Calisan) { return c.aciklama || DESC0[c.id] || c.gorev; }
export function acikGorevler(o: Ozet, id?: string) { return o.ekip.gorev.filter((g) => g.durum !== 'bitti' && (!id || g.kim === id)); }
/** 0.7.24: turuncu = görev yapıyor, yeşil = sunucuda hazır (VPS yokken kimse yeşil olmaz), gri = çevrimdışı */
export const SUNUCU_BAGLI = false;
export function durumNoktasi(c: Calisan, o: Ozet): 'ok' | 'bz' | 'id' {
  if (acikGorevler(o, c.id).some((g) => g.durum === 'calisiyor')) return 'bz';
  return SUNUCU_BAGLI ? 'ok' : 'id';
}
export function durumYazi(c: Calisan, o: Ozet) { const d = durumNoktasi(c, o); return d === 'bz' ? 'Çalışıyor' : d === 'ok' ? 'Çevrimiçi' : 'Çevrimdışı'; }
/** Çağlar'ın son onayını bekleyenler (Nika ve Orin'den geçenler + eski 'ceo' kayıtları): rozet ve "Senin onayın" bunları sayar */
export function cagladaBekleyen(o: Ozet) { return o.ekip.gel.filter((x) => x.asama === 'ceo'); }
/** Henüz Nika'da (ik) ya da Orin'de (orin) olanlar: Çağlar'a gelmediler */
export function incelemedeBekleyen(o: Ozet) { return o.ekip.gel.filter((x) => x.asama === 'ik' || x.asama === 'orin'); }
export function bekleyenGelisim(o: Ozet, id: string) {
  const g = o.ekip.gel; if (id === 'nika') return g.filter((x) => x.asama === 'ik'); if (id === 'orin') return g.filter((x) => x.asama === 'ceo' || x.asama === 'orin');
  return g.filter((x) => x.kim === id && (x.asama === 'ik' || x.asama === 'orin' || x.asama === 'ceo'));
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
  const q = t.toLocaleLowerCase('tr').trim();
  // Yalnız kısa soru kalıplarına hızlı cevap; izin/doktor raporu gibi bildirimler ve uzun mesajlar yapay zekâya (Echo) gider
  if (/doktor|hastane|hasta|raporlu|raporum|rapor al|izin|sevk|mazeret|refakat/.test(q) || q.split(/\s+/).length > 6) return null;
  if (/eksik|hata|boş/.test(q)) return eksikGunler(o);
  if (/\bay\b|ayın|aylık|bu ay/.test(q)) return buAy(o);
  if (/hafta|^rapor$|özet|durum/.test(q)) return buHafta(o);
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
