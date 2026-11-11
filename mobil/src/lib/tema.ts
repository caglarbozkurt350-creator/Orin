// Orvane ortak tema (kaynak: ../tasarim/tema.json, npm run paylas ile kopyalanır)
import T from '@/veri/tema.json';

export const R = T.renk;
export const Y = T.yaricap;
export const F = { ...T.yazi, aile: undefined as string | undefined };

/** "#3fb6ff" + saydamlık → "#3fb6ff66" gibi */
export function saydam(hex: string, a: number) {
  const h = Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');
  return hex.length === 7 ? hex + h : hex;
}
