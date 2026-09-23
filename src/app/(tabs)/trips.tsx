import { TripCard } from '@/components/trip-card';
import { AppText } from '@/components/ui/primitives';
import { Screen } from '@/components/ui/screen';
import { SAMPLE_TRIPS } from '@/data/flights';

export default function Trips() {
  return (
    <Screen>
      <AppText variant="title">My trips</AppText>
      {SAMPLE_TRIPS.map((t) => (
        <TripCard key={t.pnr} trip={t} />
      ))}
    </Screen>
  );
}
