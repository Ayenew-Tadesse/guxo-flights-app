import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Choice, Row } from '@/components/ui/primitives';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { FARES, findFlight, formatBirr, PAYMENT_METHODS } from '@/data/flights';

export default function Payment() {
  const router = useRouter();
  const { flightId = '', fare = 'standard', seat = '', passengers = '1' } =
    useLocalSearchParams<{ flightId: string; fare: string; seat: string; passengers: string }>();
  const flight = findFlight(flightId);
  const [method, setMethod] = useState<string>('telebirr');

  if (!flight) {
    return (
      <Screen edges={[]}>
        <AppText>That flight is no longer available.</AppText>
      </Screen>
    );
  }

  const fareInfo = FARES.find((f) => f.id === fare) ?? FARES[1];
  const total = (flight.price + fareInfo.extra) * Number(passengers);

  function pay() {
    // Mock payment: a random-looking booking reference derived from the flight.
    const pnr = ('GX' + (flight!.depart.replace(':', '') + seat).toUpperCase()).slice(0, 6);
    router.replace({ pathname: '/confirmation', params: { flightId, fare: fareInfo.id, seat, pnr, passengers } });
  }

  return (
    <Screen edges={['bottom']}>
      <Card>
        <Row label="Route" value={`${flight.from} → ${flight.to}`} />
        <Row label="Departs" value={flight.depart} />
        <Row label="Fare" value={fareInfo.name} />
        <Row label="Seat" value={seat} />
        <Row label="Total" value={formatBirr(total)} />
      </Card>
      <AppText variant="label">Pay with</AppText>
      <View style={styles.methods}>
        {PAYMENT_METHODS.map((m) => (
          <Choice key={m.id} label={m.name} selected={m.id === method} onPress={() => setMethod(m.id)} />
        ))}
      </View>
      <AppText variant="caption">Demo only — no real payment is taken.</AppText>
      <Button label={`Pay ${formatBirr(total)}`} onPress={pay} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  methods: { gap: Spacing.two },
});
