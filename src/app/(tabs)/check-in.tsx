import { TripCard } from '@/components/trip-card';
import { AccountButtons } from '@/components/ui';
import { EmptyState, Screen, TopBar } from '@/design-system';
import { showRoot } from '@/state/nav';
import { useApp } from '@/state/store';
import { checkIn } from '@/state/trips';

export default function CheckIn() {
  const s = useApp();
  const trips = s.trips.filter((t) => !t.cancelled);
  return (
    <Screen top={<TopBar title="Check-In" right={<AccountButtons bell={false} />} />}>
      {trips.length ? (
        trips.map((t) => <TripCard key={t.id} trip={t} variant="checkin" onCheckIn={() => checkIn(t)} />)
      ) : (
        <EmptyState message="No upcoming trips to check in for." action="Search flights" onAction={() => showRoot('/home')} />
      )}
    </Screen>
  );
}
