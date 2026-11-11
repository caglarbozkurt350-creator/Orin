// Orvane · etiket-oku (Supabase Edge Function)
// Telefondan gelen iş etiketi fotoğrafından proje kodunu ve iş adını okur (Claude Haiku, görsel).
// Fotoğraf HİÇBİR YERE KAYDEDİLMEZ: yalnız bu istek boyunca bellekte tutulur, Claude'a gönderilir, cevap dönünce atılır.
// Gizli anahtar: Supabase › Edge Functions › Secrets › ANTHROPIC_API_KEY. Yalnız giriş yapmış kullanıcılar çağırabilir (JWT).
const MODEL = 'claude-haiku-5-5';
const ISTEM = `Bu fotoğraf bir atölyede parçaya yapıştırılmış iş etiketidir.
Etikette büyük mavi rakamlarla "AA / BB" (örnek: 88 / 35), sarı alanda büyük siyah "CC.DD" (örnek: 22.91) ve altında küçük yazıyla iş/parça adı (örnek: Wheelhouse Bardaklık) bulunur.
Proje kodu = AA.BB.CC.DD (örnek: 88.35.22.91). Soldaki küçük ok ve küçük rakamları (örnek: 12, 03) yok say.
Yalnız şu JSON'u yaz: {"kod":"AA.BB.CC.DD","is":"iş adı","guven":0.0-1.0}
Okuyamadığın kısmı boş bırak; tahmin edip uydurma.`;
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });

// "88 / 35 22.91" gibi parçaları 88.35.22.91 biçimine getirir
export function kodDuzelt(t: string): string {
  const g = String(t || '').match(/\d+/g) || [];
  if (g.length === 4 && g.every((x) => x.length <= 3)) return g.join('.');
  return String(t || '').trim();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ hata: 'Yalnız POST' }, 405);
  try {
    const { resim } = await req.json();
    if (typeof resim !== 'string' || resim.length < 1000 || resim.length > 6_000_000) return json({ hata: 'Fotoğraf geçersiz ya da çok büyük' }, 400);
    const key = Deno.env.get('ANTHROPIC_API_KEY');
    if (!key) return json({ hata: 'Sunucuda ANTHROPIC_API_KEY tanımlı değil' }, 500);
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 200, messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: resim } }, { type: 'text', text: ISTEM }] }] }),
    });
    const j = await r.json();
    if (!r.ok) return json({ hata: j?.error?.message || 'Claude hatası (' + r.status + ')' }, 502);
    const t = (j.content || []).map((c: { text?: string }) => c.text || '').join('');
    let o: { kod?: string; is?: string; guven?: number } = {};
    try { const m = t.match(/\{[\s\S]*\}/); if (m) o = JSON.parse(m[0]); } catch (_) { /* boş döner */ }
    return json({ kod: kodDuzelt(o.kod || ''), is: String(o.is || '').trim().slice(0, 120), guven: Math.max(0, Math.min(1, Number(o.guven) || 0)) });
  } catch (e) {
    return json({ hata: String((e as Error)?.message || e) }, 500);
  }
});
