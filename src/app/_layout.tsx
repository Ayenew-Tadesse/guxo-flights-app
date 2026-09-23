import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Colors } from '@/constants/theme';
import { BrandProvider } from '@/design-system';

// The navigation theme paints screen backgrounds, so match the brand
// background to avoid a white flash between screens.
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.ink,
    border: Colors.line,
  },
};

export default function RootLayout() {
  return (
    <BrandProvider brand="guxoFlights">
    <ThemeProvider value={navTheme}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: Colors.primary,
          headerTitleStyle: { color: Colors.ink, fontWeight: '700' },
          headerStyle: { backgroundColor: Colors.surface },
          headerShadowVisible: false,
          headerBackTitle: 'Back',
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="results" options={{ title: 'Choose a flight' }} />
        <Stack.Screen name="fare" options={{ title: 'Fare & seat' }} />
        <Stack.Screen name="payment" options={{ title: 'Payment' }} />
        <Stack.Screen name="confirmation" options={{ title: 'Booked', headerBackVisible: false, gestureEnabled: false }} />
        <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
        <Stack.Screen name="profile" options={{ title: 'Profile' }} />
        <Stack.Screen name="design-system" options={{ title: 'Design system' }} />
      </Stack>
    </ThemeProvider>
    </BrandProvider>
  );
}
