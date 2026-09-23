import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Card } from '@/components/ui/primitives';
import { Colors, Spacing } from '@/constants/theme';
import { cityOf } from '@/data/flights';

type Trip = { pnr: string; from: string; to: string; date: string; time: string; status: string };

/** Route summary card shared by My Trips and Check-in. */
export function TripCard({ trip, children }: { trip: Trip; children?: ReactNode }) {
  return (
    <Card>
      <View style={styles.row}>
        <AppText variant="label">{trip.status}</AppText>
        <AppText variant="label">PNR {trip.pnr}</AppText>
      </View>
      <View style={styles.row}>
        <AppText style={styles.code}>{trip.from}</AppText>
        <AppText variant="caption">✈</AppText>
        <AppText style={styles.code}>{trip.to}</AppText>
      </View>
      <View style={styles.row}>
        <AppText variant="caption">{cityOf(trip.from)}</AppText>
        <AppText variant="caption">{cityOf(trip.to)}</AppText>
      </View>
      <AppText variant="caption">{trip.date} · {trip.time}</AppText>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  code: { fontSize: 22, fontWeight: '800', color: Colors.ink },
});
