// Klavye açılınca alttaki yazı kutusu görünür kalsın.
// Android'de uç uca (edge-to-edge) ekranda pencere klavyeyle küçülmediği için KeyboardAvoidingView işe yaramıyor;
// klavyenin ekranın altını ne kadar örttüğünü ölçüp o kadar boşluk bırakırız (pencere küçülse de çift boşluk olmaz).
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, Platform } from 'react-native';

export function useKlavye() {
  const ref = useRef<any>(null); // View örneği (measureInWindow)
  const [ortu, setOrtu] = useState(0);
  useEffect(() => {
    const ac = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (e) => {
      const ust = e.endCoordinates.screenY || Dimensions.get('window').height - e.endCoordinates.height;
      const v = ref.current;
      if (!v) { setOrtu(e.endCoordinates.height); return; }
      v.measureInWindow((_x: number, y: number, _w: number, h: number) => setOrtu(Math.max(0, Math.round(y + h - ust))));
    });
    const kapa = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setOrtu(0));
    return () => { ac.remove(); kapa.remove(); };
  }, []);
  return { ref, ortu };
}
