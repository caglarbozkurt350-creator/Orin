// Klavye açılınca yazılan kutu her zaman klavyenin üstünde görünür kalsın.
// Android'de uç uca (edge-to-edge) ekranda pencere klavyeyle küçülmediği için KeyboardAvoidingView işe yaramıyor;
// klavyenin kabın altını ne kadar örttüğünü ölçüp o kadar boşluk bırakırız (pencere küçülse de çift boşluk olmaz).
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, NativeScrollEvent, NativeSyntheticEvent, Platform, TextInput } from 'react-native';

const ACILIS = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
const KAPANIS = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

/** ortu: klavyenin kabın altını örttüğü yükseklik; ust: klavyenin üst kenarı (kabın pencere koordinatında) */
export function useKlavye() {
  const ref = useRef<any>(null); // View örneği (measureInWindow)
  const [ortu, setOrtu] = useState(0);
  const ust = useRef(0);
  useEffect(() => {
    const ac = Keyboard.addListener(ACILIS, (e) => {
      const ks = e.endCoordinates.screenY || Dimensions.get('window').height - e.endCoordinates.height;
      const v = ref.current;
      if (!v?.measureInWindow) { ust.current = ks; setOrtu(e.endCoordinates.height); return; }
      v.measureInWindow((_x: number, y: number, _w: number, h: number) => {
        const o = Math.max(0, Math.round(y + h - ks));
        ust.current = y + h - o;
        setOrtu(o);
      });
    });
    const kapa = Keyboard.addListener(KAPANIS, () => setOrtu(0));
    return () => { ac.remove(); kapa.remove(); };
  }, []);
  return { ref, ortu, ust };
}

/**
 * Kaydırılabilir alanlar için: klavye açıkken ya da başka kutuya geçilince odaktaki yazı kutusunu
 * klavyenin hemen üstüne kaydırır. Kabın ref'i `kap`, ScrollView'ın ref'i `sc`, onScroll'u `kaydir`.
 * Alt boşluk için `ortu` kadar paddingBottom ekleyin.
 */
export function useKlavyeKaydir(bosluk = 24) {
  const kl = useKlavye();
  const sc = useRef<any>(null); // ScrollView örneği
  const ofs = useRef(0);
  const kaydir = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => { ofs.current = e.nativeEvent.contentOffset.y; }, []);
  useEffect(() => {
    if (!kl.ortu) return;
    let son: any = null;
    const goster = (zorla: boolean) => {
      const inp: any = TextInput.State.currentlyFocusedInput?.();
      if (!inp?.measureInWindow || !sc.current) return;
      if (inp === son && !zorla) return;
      son = inp;
      inp.measureInWindow((_x: number, y: number, _w: number, h: number) => {
        const fark = y + h + bosluk - kl.ust.current;
        if (fark > 0) sc.current?.scrollTo({ y: ofs.current + fark, animated: true });
      });
    };
    const ilk = setTimeout(() => goster(true), 60); // boşluk eklendikten sonra ölç
    const t = setInterval(() => goster(false), 300); // klavye açıkken başka kutuya geçilirse
    return () => { clearTimeout(ilk); clearInterval(t); };
  }, [kl.ortu, bosluk]);
  return { kap: kl.ref, ortu: kl.ortu, sc, kaydir };
}
