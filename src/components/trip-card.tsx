import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, Text } from '@/design-system';
import { Colors, Spacing } from '@/constants/theme';
import { cityOf } from '@/data/flights';

type Trip = { pnr: string; from: string; to: string; date: string; time: string; status: string };

/** Route summary card shared by My Trips and Check-in. */
export function TripCard({ trip, children }: { trip: Trip; children?: ReactNode }) {
  return (
    <Card>
      <View style={styles.row}>
        <Text variant="label">{trip.status}</Text>
        <Text variant="label">PNR {trip.pnr}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.code}>{trip.from}</Text>
        <Text variant="caption">✈</Text>
        <Text style={styles.code}>{trip.to}</Text>
      </View>
      <View style={styles.row}>
        <Text variant="caption">{cityOf(trip.from)}</Text>
        <Text variant="caption">{cityOf(trip.to)}</Text>
      </View>
      <Text variant="caption">{trip.date} · {trip.time}</Text>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  code: { fontSize: 22, fontWeight: '800', color: Colors.ink },
});
