import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchForm } from '@/components/search-form';
import { AccountButtons } from '@/components/ui';
import { Button, Heading, Logo, Screen, T, useLayout } from '@/design-system';
import { goTo, resetTo } from '@/state/nav';
import { loadAccount, useApp } from '@/state/store';

const HERO = require('../../../assets/images/hero.jpg');

export default function Home() {
  const s = useApp();
  const insets = useSafeAreaInsets();
  const { height, column, atLeast, pad } = useLayout();
  const user = s.currentUser;
  // Phones: half the window tall. Wider: sized from the photo's crop ratio.
  const heroH = atLeast(768) ? (column * 597) / 1400 : height * 0.5;
  const cardTop = atLeast(768) ? -46 : 212 - heroH;

  const hero = (
    <View style={{ height: heroH, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden', backgroundColor: '#B8BEC9', marginTop: -insets.top }}>
      <Image source={HERO} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} contentFit="cover" accessibilityIgnoresInvertColors />
      <LinearGradient
        colors={['rgba(9,21,64,0.15)', 'rgba(9,21,64,0.1)', 'rgba(9,21,64,0.55)']}
        locations={[0, 0.4, 1]}
        style={{ position: 'absolute', inset: 0 }}
        pointerEvents="none"
      />
      <View style={{ position: 'absolute', top: insets.top, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 18 }}>
        <Logo onHero />
        {user ? (
          <AccountButtons onHero />
        ) : (
          <Button small kind="tint" label="Sign up" onPress={() => resetTo(loadAccount() ? '/log-in' : '/sign-up')} style={{ backgroundColor: 'rgba(255,255,255,0.18)' }} />
        )}
      </View>
      <Pressable
        disabled={!user}
        accessibilityRole={user ? 'button' : undefined}
        accessibilityLabel={user ? 'Open profile' : undefined}
        onPress={() => goTo('/profile')}
        style={{ position: 'absolute', left: 18, right: 18, top: insets.top + 100 }}>
        {user ? (
          <T size={1} weight={500} color="rgba(255,255,255,0.9)">
            Welcome back ›
          </T>
        ) : null}
        <Heading size={2} weight={800} color="#fff" style={{ marginTop: 2, maxWidth: 360 }}>
          {user ? user.name : 'Hello there'}
        </Heading>
      </Pressable>
    </View>
  );

  return (
    <Screen top={hero}>
      <View style={{ marginTop: cardTop, zIndex: 4, marginHorizontal: 0 }}>
        <SearchForm />
      </View>
      <View style={{ height: pad }} />
    </Screen>
  );
}
