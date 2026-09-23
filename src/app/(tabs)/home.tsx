import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Brand } from '@/components/brand';
import { SearchForm } from '@/components/search-form';
import { AppText } from '@/components/ui/primitives';
import { Screen } from '@/components/ui/screen';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function Home() {
  return (
    <Screen>
      <View style={styles.top}>
        <Brand />
        <View style={styles.icons}>
          <Link href="/notifications" asChild>
            <Pressable style={styles.iconBtn} accessibilityLabel="Notifications">
              <MaterialIcons name="notifications-none" size={20} color={Colors.inkSoft} />
            </Pressable>
          </Link>
          <Link href="/profile" asChild>
            <Pressable style={styles.iconBtn} accessibilityLabel="Profile">
              <MaterialIcons name="person-outline" size={20} color={Colors.inkSoft} />
            </Pressable>
          </Link>
        </View>
      </View>
      <View style={styles.hero}>
        <AppText style={styles.heroHi}>Welcome back</AppText>
        <AppText style={styles.heroTitle}>Where are you flying next?</AppText>
      </View>
      <SearchForm />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  icons: { flexDirection: 'row', gap: Spacing.two },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.large,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  heroHi: { color: '#DCE3FF', fontSize: 15, fontWeight: '500' },
  heroTitle: { color: Colors.onPrimary, fontSize: 28, fontWeight: '800', lineHeight: 32 },
});
