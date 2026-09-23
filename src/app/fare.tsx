import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Choice, Row, Screen, Text } from '@/design-system';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { FARES, findFlight, formatBirr, type FareId } from '@/data/flights';

const ROWS = 8;
const COLS = ['A', 'B', 'C', 'D'];
// A fixed set of occupied seats so the map looks lived-in without random layout shifts.
const TAKEN = new Set(['1B', '2C', '3A', '4D', '5B', '6A', '6C', '8D']);

export default function Fare() {
  const router = useRouter();
  const { flightId = '', passengers = '1' } = useLocalSearchParams<{ flightId: string; passengers: string }>();
  const flight = findFlight(flightId);
  const [fare, setFare] = useState<FareId>('standard');
  const [seat, setSeat] = useState<string | null>(null);

  if (!flight) {
    return (
      <Screen edges={[]}>
        <Text>That flight is no longer available.</Text>
      </Screen>
    );
  }

  const fareInfo = FARES.find((f) => f.id === fare)!;
  const total = (flight.price + fareInfo.extra) * Number(passengers);

  return (
    <Screen edges={['bottom']}>
      <Card>
        <Row label="Flight" value={`${flight.from} → ${flight.to}`} />
        <Row label="Departs" value={`${flight.depart} · ${flight.duration}`} />
      </Card>

      <Text variant="label">Fare</Text>
      <View style={styles.fares}>
        {FARES.map((f) => (
          <Choice
            key={f.id}
            label={`${f.name} · ${formatBirr(flight.price + f.extra)}`}
            detail={f.note}
            selected={f.id === fare}
            onPress={() => setFare(f.id)}
          />
        ))}
      </View>

      <Text variant="label">Seat</Text>
      <Card style={styles.seatCard}>
        {Array.from({ length: ROWS }, (_, r) => (
          <View key={r} style={styles.seatRow}>
            <Text variant="caption" style={styles.rowNo}>{r + 1}</Text>
            {COLS.map((c, ci) => {
              const id = `${r + 1}${c}`;
              const taken = TAKEN.has(id);
              const picked = seat === id;
              return (
                <View key={c} style={[styles.seatWrap, ci === 1 && styles.aisle]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Seat ${id}${taken ? ', taken' : ''}`}
                    accessibilityState={{ disabled: taken, selected: picked }}
                    disabled={taken}
                    onPress={() => setSeat(id)}
                    style={[styles.seat, taken && styles.seatTaken, picked && styles.seatPicked]}>
                    <Text style={[styles.seatLabel, picked && { color: Colors.onPrimary }]}>{taken ? '' : c}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ))}
      </Card>

      <Card>
        <Row label="Seat" value={seat ?? 'Choose a seat'} />
        <Row label={`Total · ${passengers} passenger${passengers === '1' ? '' : 's'}`} value={formatBirr(total)} />
      </Card>
      <Button
        label="Continue to payment"
        disabled={!seat}
        onPress={() => router.push({ pathname: '/payment', params: { flightId, fare, seat: seat ?? '', passengers } })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  fares: { gap: Spacing.two },
  seatCard: { alignItems: 'center', gap: Spacing.two },
  seatRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  rowNo: { width: 18, textAlign: 'center' },
  seatWrap: {},
  aisle: { marginRight: Spacing.four },
  seat: {
    width: 34,
    height: 34,
    borderRadius: Radius.small,
    borderWidth: 1,
    borderColor: Colors.lineStrong,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatTaken: { backgroundColor: Colors.line, borderColor: Colors.line },
  seatPicked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  seatLabel: { fontSize: 11, color: Colors.inkFaint, fontWeight: '600' },
});
