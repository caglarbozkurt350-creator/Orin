// Orvane Mobil · otomatik güncelleme
// 1) Uzaktan güncelleme (EAS Update): açılışta ve uygulama öne geldiğinde denetlenir, indirilir; "Yeniden başlat" ile hemen uygulanır.
// 2) Yeni APK gerektiğinde (yerel modül değişince runtimeVersion artar): GitHub'daki mobil/apk.json okunur, "Yeni sürüm var" ile indirme bağlantısı gösterilir.
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';

const APK_JSON = 'https://raw.githubusercontent.com/caglarbozkurt350-creator/Orin/main/mobil/apk.json';
export type ApkBilgi = { runtime: string; surum: string; url: string; not?: string };

let son = 0;
export async function guncellemeDenetle(zorla = false): Promise<'yok' | 'indirildi' | 'gelistirme' | 'hata'> {
  if (__DEV__ || !Updates.isEnabled) return 'gelistirme';
  if (!zorla && Date.now() - son < 10 * 60 * 1000) return 'yok';
  son = Date.now();
  try {
    const r = await Updates.checkForUpdateAsync();
    if (!r.isAvailable) return 'yok';
    const f = await Updates.fetchUpdateAsync();
    return f.isNew ? 'indirildi' : 'yok';
  } catch { return 'hata'; }
}
export async function apkDenetle(): Promise<ApkBilgi | null> {
  try {
    const r = await fetch(APK_JSON + '?t=' + Date.now());
    if (!r.ok) return null;
    const j = (await r.json()) as ApkBilgi;
    const calisan = Updates.runtimeVersion || '1';
    return j && j.runtime && j.url && j.runtime !== calisan && Number(j.runtime) > Number(calisan) ? j : null;
  } catch { return null; }
}
export const yenidenBaslat = () => Updates.reloadAsync().catch(() => {});
export const apkIndir = (b: ApkBilgi) => Linking.openURL(b.url).catch(() => {});

/** Açılışta ve öne gelince denetler; bekleyen güncelleme ve yeni APK bilgisini döner */
export function useGuncelleme() {
  const u = Updates.useUpdates();
  const [apk, setApk] = useState<ApkBilgi | null>(null);
  useEffect(() => {
    const bak = () => { guncellemeDenetle(); apkDenetle().then(setApk); };
    bak();
    const a = AppState.addEventListener('change', (s) => { if (s === 'active') bak(); });
    return () => a.remove();
  }, []);
  return { bekliyor: u.isUpdatePending, iniyor: u.isDownloading, apk, calisan: u.currentlyRunning };
}
