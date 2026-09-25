import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, View } from 'react-native';

import { Gradient, Icon, Spinner, T } from '@/design-system';
import { loadAccount } from '@/state/store';

/** Splash: brand gradient, logo pops in, then sign up (or log in if an account exists). */
export default function Splash() {
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 500, easing: Easing.bezier(0.22, 0.61, 0.36, 1), useNativeDriver: Platform.OS !== 'web' }).start();
    const timer = setTimeout(() => router.replace(loadAccount() ? '/log-in' : '/sign-up'), 1400);
    return () => clearTimeout(timer);
  }, [t]);
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  const lift = t.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });
  return (
    <Gradient style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <Animated.View style={{ opacity: t, transform: [{ scale }] }}>
        <View style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="plane" size={30} color="#fff" strokeWidth={2} />
        </View>
      </Animated.View>
      <Animated.View style={{ opacity: t, transform: [{ translateY: lift }] }}>
        <T size={1.5} weight={800} color="#fff" ls={-0.01}>
          Guxo Flights
        </T>
      </Animated.View>
      <View style={{ marginTop: 8 }}>
        <Spinner size={26} color="#fff" track="rgba(255,255,255,0.3)" />
      </View>
    </Gradient>
  );
}
