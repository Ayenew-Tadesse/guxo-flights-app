import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Screen, Text } from '@/design-system';
import { Colors, Spacing } from '@/constants/theme';

const ROWS = ['Saved passengers', 'Payment methods', 'Notification preferences', 'Help & support'];

export default function Profile() {
  const router = useRouter();
  return (
    <Screen edges={['bottom']}>
      <View style={styles.head}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>G</Text>
        </View>
        <Text variant="heading">Guest</Text>
        <Text variant="caption">Sign in to keep your trips and miles in sync.</Text>
      </View>
      <Card style={styles.list}>
        {ROWS.map((r) => (
          <View key={r} style={styles.row}>
            <Text>{r}</Text>
            <MaterialIcons name="chevron-right" size={20} color={Colors.inkFaint} />
          </View>
        ))}
        <Pressable accessibilityRole="button" onPress={() => router.push('/design-system')} style={styles.row}>
          <Text>Design system</Text>
          <MaterialIcons name="chevron-right" size={20} color={Colors.inkFaint} />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/log-in')} style={styles.row}>
          <Text style={{ color: Colors.bad, fontWeight: '600' }}>Log out</Text>
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
