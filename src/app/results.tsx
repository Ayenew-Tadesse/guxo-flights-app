import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Screen, Text } from '@/design-system';
import { Colors, Spacing } from '@/constants/theme';
import { cityOf, flightsFor, formatBirr } from '@/data/flights';

export default function Results() {
  const router = useRouter();
  const { from = 'ADD', to = 'BJR', passengers = '1' } = useLocalSearchParams<{ from: string; to: string; passengers: string }>();
  const flights = flightsFor(from, to);

  return (
    <Screen edges={[]}>
      <Text variant="heading">{cityOf(from)} → {cityOf(to)}</Text>
      <Text variant="caption">{flights.length} flights · {passengers} passenger{passengers === '1' ? '' : 's'}</Text>
      {flights.map((f) => (
        <Pressable
          key={f.id}
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/fare', params: { flightId: f.id, passengers } })}
          style={({ pressed }) => pressed && { opacity: 0.85 }}>
          <Card>
            <View style={styles.route}>
              <Text style={styles.time}>{f.depart}</Text>
              <View style={styles.mid}>
                <Text variant="caption">{f.duration}</Text>
                <View style={styles.line} />
                <Text variant="caption">Nonstop</Text>
              </View>
              <Text style={styles.time}>{f.arrive}</Text>
            </View>
            <View style={styles.bottom}>
              <Text variant="caption">{f.from} → {f.to}</Text>
              <Text style={styles.price}>{formatBirr(f.price)}</Text>
            </View>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  route: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  time: { fontSize: 18, fontWeight: '700', color: Colors.ink },
  mid: { flex: 1, alignItems: 'center', gap: 2 },
  line: { alignSelf: 'stretch', height: 1, backgroundColor: Colors.lineStrong },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: '800', color: Colors.primary },
});
