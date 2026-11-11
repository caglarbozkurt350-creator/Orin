// İş etiketi fotoğrafından proje kodu ve iş adı okuma.
// Akış: kamera → 1280 piksele küçült (≈150–300 KB) → Supabase 'etiket-oku' işlevi (Claude Haiku görsel) → kod + iş adı.
// Fotoğraf telefonda SAKLANMAZ: çekilen ve küçültülen dosyalar okuma biter bitmez silinir; sunucu da kaydetmez.
import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { hataMetni, istemci } from './senk';

export type Etiket = { kod: string; is: string; guven: number };

function sil(uri?: string | null) { if (!uri) return; try { const f = new File(uri); if (f.exists) f.delete(); } catch { /* önbellek dosyası zaten yok */ } }

export function kodDuzelt(t: string): string {
  const g = String(t || '').match(/\d+/g) || [];
  return g.length === 4 && g.every((x) => x.length <= 3) ? g.join('.') : String(t || '').trim();
}

export async function etiketOku(): Promise<Etiket | null> {
  const c = istemci(); if (!c) throw new Error('Önce Ayarlar’dan eşitlemeye giriş yap');
  const izin = await ImagePicker.requestCameraPermissionsAsync();
  if (!izin.granted) throw new Error('Kamera izni verilmedi');
  const r = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: false, exif: false });
  if (r.canceled || !r.assets?.[0]) return null;
  const a = r.assets[0]; let kucuk: string | null = null;
  try {
    const boy = (a.width || 0) >= (a.height || 0) ? { width: 1280 } : { height: 1280 };
    const ref = await ImageManipulator.manipulate(a.uri).resize(boy).renderAsync();
    const s = await ref.saveAsync({ compress: 0.6, format: SaveFormat.JPEG, base64: true });
    kucuk = s.uri;
    if (!s.base64) throw new Error('Fotoğraf hazırlanamadı');
    const { data, error } = await c.functions.invoke('etiket-oku', { body: { resim: s.base64 } });
    if (error) {
      let m = hataMetni(error); try { const g = await (error as any).context?.json?.(); if (g?.hata) m = g.hata; } catch { /* gövde yok */ }
      throw new Error(m);
    }
    if (data?.hata) throw new Error(data.hata);
    return { kod: kodDuzelt(data?.kod || ''), is: String(data?.is || ''), guven: Number(data?.guven) || 0 };
  } finally { sil(a.uri); sil(kucuk); }
}
