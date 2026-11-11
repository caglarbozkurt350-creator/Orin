import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { esitle } from '@/lib/senk';
import { R } from '@/lib/tema';

const tema = { ...DarkTheme, colors: { ...DarkTheme.colors, background: R.zemin, card: R.zemin, primary: R.ana, text: R.yazi, border: R.cizgi } };

export default function KokDuzen() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(R.zemin).catch(() => {});
    esitle();
    const t = setInterval(esitle, 60000); // bir dakikada bir masaüstüyle eşitle
    return () => clearInterval(t);
  }, []);
  return (
    <ThemeProvider value={tema}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: R.zemin }, animation: 'fade' }} />
    </ThemeProvider>
  );
}
