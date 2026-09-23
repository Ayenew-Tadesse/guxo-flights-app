import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button, Card, Choice, Text } from '@/design-system';
import { Spacing } from '@/constants/theme';
import { AIRPORTS } from '@/data/flights';

/** Flight search used by Home and Book: pick origin, destination and passengers. */
export function SearchForm() {
  const router = useRouter();
  const [from, setFrom] = useState('ADD');
  const [to, setTo] = useState('BJR');
  const [passengers, setPassengers] = useState(1);

  function pick(side: 'from' | 'to', code: string) {
    if (side === 'from') {
      setFrom(code);
      if (code === to) setTo(from); // swap instead of allowing the same airport twice
    } else {
      setTo(code);
      if (code === from) setFrom(to);
    }
  }

  return (
    <Card>
      <AirportPicker label="From" value={from} onPick={(c) => pick('from', c)} />
      <AirportPicker label="To" value={to} onPick={(c) => pick('to', c)} />
      <View style={styles.pax}>
        <Text variant="label">Passengers</Text>
        <View style={styles.paxRow}>
          <Choice label="−" selected={false} onPress={() => setPassengers((p) => Math.max(1, p - 1))} />
          <Text variant="heading" accessibilityLiveRegion="polite">{passengers}</Text>
          <Choice label="+" selected={false} onPress={() => setPassengers((p) => Math.min(9, p + 1))} />
        </View>
      </View>
      <Button
        label="Search flights"
        onPress={() => router.push({ pathname: '/results', params: { from, to, passengers: String(passengers) } })}
      />
    </Card>
  );
}

function AirportPicker({ label, value, onPick }: { label: string; value: string; onPick: (code: string) => void }) {
  return (
    <View style={styles.picker}>
      <Text variant="label">{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {AIRPORTS.map((a) => (
          <Choice key={a.code} label={a.code} detail={a.city} selected={a.code === value} onPress={() => onPick(a.code)} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  picker: { gap: Spacing.two },
  chips: { gap: Spacing.two },
  pax: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  paxRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
});
