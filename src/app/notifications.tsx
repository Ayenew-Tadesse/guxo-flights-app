import { StyleSheet, View } from 'react-native';

import { AppText, Card } from '@/components/ui/primitives';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { SAMPLE_NOTIFICATIONS } from '@/data/flights';

export default function Notifications() {
  return (
    <Screen edges={['bottom']}>
      {SAMPLE_NOTIFICATIONS.map((n) => (
        <Card key={n.id} style={styles.card}>
          <View style={styles.text}>
            <AppText style={styles.title}>{n.title}</AppText>
            <AppText variant="caption">{n.body}</AppText>
          </View>
          <AppText variant="caption">{n.ago}</AppText>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  text: { flex: 1, gap: 2 },
  title: { fontWeight: '700' },
});
