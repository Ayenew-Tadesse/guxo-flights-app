import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Card } from '@/components/ui/primitives';
import { Screen } from '@/components/ui/screen';
import { Colors, Spacing } from '@/constants/theme';

const ROWS = ['Saved passengers', 'Payment methods', 'Notification preferences', 'Help & support'];

export default function Profile() {
  const router = useRouter();
  return (
    <Screen edges={['bottom']}>
      <View style={styles.head}>
        <View style={styles.avatar}>
          <AppText style={styles.initials}>G</AppText>
        </View>
        <AppText variant="heading">Guest</AppText>
        <AppText variant="caption">Sign in to keep your trips and miles in sync.</AppText>
      </View>
      <Card style={styles.list}>
        {ROWS.map((r) => (
          <View key={r} style={styles.row}>
            <AppText>{r}</AppText>
            <MaterialIcons name="chevron-right" size={20} color={Colors.inkFaint} />
          </View>
        ))}
        <Pressable accessibilityRole="button" onPress={() => router.replace('/log-in')} style={styles.row}>
          <AppText style={{ color: Colors.bad, fontWeight: '600' }}>Log out</AppText>
          <MaterialIcons name="chevron-right" size={20} color={Colors.inkFaint} />
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: Spacing.one, paddingVertical: Spacing.three },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  initials: { color: Colors.onPrimary, fontSize: 26, fontWeight: '800' },
  list: { gap: 0, paddingVertical: Spacing.one },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
});
