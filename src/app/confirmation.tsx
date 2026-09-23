import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Row, Screen, Text } from '@/design-system';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { cityOf, FARES, findFlight } from '@/data/flights';

export default function Confirmation() {
  const router = useRouter();
  const { flightId = '', fare = 'standard', seat = '', pnr = '' } =
    useLocalSearchParams<{ flightId: string; fare: string; seat: string; pnr: string }>();
  const flight = findFlight(flightId);
  const fareName = FARES.find((f) => f.id === fare)?.name ?? 'Standard';

  return (
    <Screen edges={['bottom']}>
      <View style={styles.banner}>
        <View style={styles.ok}>
          <MaterialIcons name="check" size={26} color={Colors.onPrimary} />
        </View>
        <Text style={styles.bannerTitle}>{"You're booked!"}</Text>
        <Text style={styles.bannerSub}>Your e-ticket is in My Trips.</Text>
      </View>
      {flight ? (
        <Card>
          <Row label="From" value={`${cityOf(flight.from)} (${flight.from})`} />
          <Row label="To" value={`${cityOf(flight.to)} (${flight.to})`} />
          <Row label="Departs" value={flight.depart} />
          <Row label="Fare" value={fareName} />
          <Row label="Seat" value={seat} />
        </Card>
      ) : null}
      <Card style={styles.pnrCard}>
        <Text variant="label">Booking reference</Text>
        <Text style={styles.pnr}>{pnr}</Text>
      </Card>
      <Button label="Go to My Trips" onPress={() => router.replace('/trips')} />
      <Button label="Back to Home" kind="ghost" onPress={() => router.replace('/home')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.large,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.one,
  },
  ok: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  bannerTitle: { color: Colors.onPrimary, fontSize: 22, fontWeight: '800' },
  bannerSub: { color: '#DCE3FF' },
  pnrCard: { alignItems: 'center', gap: Spacing.one },
  pnr: { fontSize: 24, fontWeight: '800', letterSpacing: 3, color: Colors.primary },
});
