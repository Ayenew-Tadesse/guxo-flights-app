import { TripCard } from '@/components/trip-card';
import { AccountButtons } from '@/components/ui';
import { EmptyState, Screen, TopBar } from '@/design-system';
import { goTo, showRoot } from '@/state/nav';
import { useApp } from '@/state/store';
import { askCancel, rebook } from '@/state/trips';

export default function Trips() {
  const s = useApp();
  return (
    <Screen top={<TopBar title="My Trips" right={<AccountButtons bell={false} />} />}>
      {s.trips.length ? (
        s.trips.map((t) => (
          <TripCard
            key={t.id}
            trip={t}
            variant="trips"
            onOpen={() => goTo({ pathname: '/trip-detail', params: { id: t.id } })}
            onRebook={() => rebook(t)}
            onCancel={() => askCancel(t)}
          />
        ))
      ) : (
        <EmptyState message="No trips yet — book a flight to see it here." action="Search flights" onAction={() => showRoot('/home')} />
      )}
    </Screen>
  );
}
