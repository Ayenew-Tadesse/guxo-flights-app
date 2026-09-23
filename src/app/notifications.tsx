import { StyleSheet, View } from 'react-native';

import { Card, Screen, Text } from '@/design-system';
import { Spacing } from '@/constants/theme';
import { SAMPLE_NOTIFICATIONS } from '@/data/flights';

export default function Notifications() {
  return (
    <Screen edges={['bottom']}>
      {SAMPLE_NOTIFICATIONS.map((n) => (
        <Card key={n.id} style={styles.card}>
          <View style={styles.text}>
            <Text style={styles.title}>{n.title}</Text>
            <Text variant="caption">{n.body}</Text>
          </View>
          <Text variant="caption">{n.ago}</Text>
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
