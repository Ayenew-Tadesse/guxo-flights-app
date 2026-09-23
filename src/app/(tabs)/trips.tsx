import { TripCard } from '@/components/trip-card';
import { Screen, Text } from '@/design-system';
import { SAMPLE_TRIPS } from '@/data/flights';

export default function Trips() {
  return (
    <Screen>
      <Text variant="display">My trips</Text>
      {SAMPLE_TRIPS.map((t) => (
        <TripCard key={t.pnr} trip={t} />
      ))}
    </Screen>
  );
}
