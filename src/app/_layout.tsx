import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import '@/global.css';
import { ConfirmModal, PageLoader, Toast } from '@/components/ui';
import { BrandProvider, brands, useLayout } from '@/design-system';
import { hydrateStorage } from '@/state/storage';
import { ACCOUNT_KEY, TRAVELER_KEY } from '@/state/store';

const colors = brands.guxoFlights.colors;

// Screens paint their own backgrounds; match the frame so there's no flash.
const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.frame, card: colors.surface, text: colors.ink, border: colors.line },
};

/**
 * Like the prototype, the app is one column that widens with the window
 * (up to 1200px) over the light-blue page background.
 */
function AppColumn({ children }: { children: React.ReactNode }) {
  const { maxWidth } = useLayout();
  return (
    <View style={{ flex: 1, backgroundColor: colors.page, alignItems: 'center' }}>
      <View style={{ flex: 1, width: '100%', maxWidth, backgroundColor: colors.frame, overflow: 'hidden' }}>{children}</View>
    </View>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold });
  // Phones: read what's saved on the device before any screen asks for it.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    hydrateStorage([ACCOUNT_KEY, TRAVELER_KEY]).finally(() => setHydrated(true));
  }, []);
  if (!loaded || !hydrated) return <View style={{ flex: 1, backgroundColor: colors.primary }} />;
  return (
    <KeyboardProvider>
    <BrandProvider brand="guxoFlights">
      <ThemeProvider value={navTheme}>
        <StatusBar style="dark" />
        <AppColumn>
          <Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: colors.frame } }} />
          <Toast />
          <PageLoader />
        </AppColumn>
        <ConfirmModal />
      </ThemeProvider>
    </BrandProvider>
    </KeyboardProvider>
  );
}
