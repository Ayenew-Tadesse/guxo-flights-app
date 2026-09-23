import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Card } from '@/components/ui/primitives';
import { Screen } from '@/components/ui/screen';
import { Colors, Spacing } from '@/constants/theme';
import { cityOf, flightsFor, formatBirr } from '@/data/flights';

export default function Results() {
  const router = useRouter();
  const { from = 'ADD', to = 'BJR', passengers = '1' } = useLocalSearchParams<{ from: string; to: string; passengers: string }>();
  const flights = flightsFor(from, to);

  return (
    <Screen edges={[]}>
      <AppText variant="heading">{cityOf(from)} → {cityOf(to)}</AppText>
      <AppText variant="caption">{flights.length} flights · {passengers} passenger{passengers === '1' ? '' : 's'}</AppText>
      {flights.map((f) => (
        <Pressable
          key={f.id}
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/fare', params: { flightId: f.id, passengers } })}
          style={({ pressed }) => pressed && { opacity: 0.85 }}>
          <Card>
            <View style={styles.route}>
              <AppText style={styles.time}>{f.depart}</AppText>
              <View style={styles.mid}>
                <AppText variant="caption">{f.duration}</AppText>
                <View style={styles.line} />
                <AppText variant="caption">Nonstop</AppText>
              </View>
              <AppText style={styles.time}>{f.arrive}</AppText>
            </View>
            <View style={styles.bottom}>
              <AppText variant="caption">{f.from} → {f.to}</AppText>
              <AppText style={styles.price}>{formatBirr(f.price)}</AppText>
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
