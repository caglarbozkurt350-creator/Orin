// Çalışan üst bilgisi (tasarım: AndroidNav.dc.html). Departman, kısa unvan, halka rengi.
export const SIRA = ['orin', 'orla', 'nika', 'mia', 'otto', 'iris', 'marco', 'nerya', 'echo', 'vera', 'luca', 'remy', 'cleo', 'ada', 'kai', 'sage'];
export const DEP: Record<string, string> = { orin: 'YÖNETİM', orla: 'YÖNETİM', nika: 'YÖNETİM', mia: 'AİLE', otto: 'AİLE', iris: 'AİLE', marco: 'AİLE', nerya: 'AİLE', echo: 'İŞ', vera: 'İŞ', luca: 'İŞ', remy: 'PLAN & İLETİŞİM', cleo: 'PLAN & İLETİŞİM', ada: 'TEKNİK', kai: 'TEKNİK', sage: 'ORTAK SERVİS' };
export const UN: Record<string, string> = { orin: 'CEO', orla: 'Müdür · Koordinatör', nika: 'İK Müdürü', mia: 'Aile Yöneticisi', otto: 'Finans Uzmanı', iris: 'Sağlık Yaşam Koçu', marco: 'Aşçı', nerya: 'Satın Alma Uzmanı', echo: 'İş Raporu', vera: 'Kalite Kontrol', luca: 'Proje Arama', remy: 'Takvim', cleo: 'Yazışma', ada: 'Kod · Geliştirme', kai: 'Bakım Onarım Teknisyeni', sage: 'Araştırmacı' };
export const KISA: Record<string, string> = { orin: 'CEO', orla: 'Koordinatör', nika: 'İK Müdürü', sage: 'Araştırmacı', mia: 'Aile Yöneticisi', otto: 'Finans U.', iris: 'Sağlık Y.K.', marco: 'Aşçı', nerya: 'Satın Alma U.', echo: 'İş Raporu', vera: 'Kalite', luca: 'Proje Arama', remy: 'Takvim', cleo: 'Yazışma', ada: 'Kod', kai: 'Bakım Onarım' };
// Halka degradeleri (Bölüm 1: departman renkleri). Yönetim = tema rengi.
export const GRAD: Record<string, [string, string] | 'tema'> = { 'YÖNETİM': 'tema', 'AİLE': ['#ff7ac6', '#a855f7'], 'İŞ': ['#38d6f0', '#3b82f6'], 'PLAN & İLETİŞİM': ['#6ee7b7', '#16a34a'], 'TEKNİK': ['#fde68a', '#f59e0b'], 'ORTAK SERVİS': ['#e5e7eb', '#6b7280'] };
export const depAdi = (id: string) => DEP[id] || 'DİĞER';
export const unvan = (id: string, yedek: string) => UN[id] || yedek;
