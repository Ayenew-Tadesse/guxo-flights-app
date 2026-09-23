import { useState } from 'react';

import { TripCard } from '@/components/trip-card';
import { AppText, Button } from '@/components/ui/primitives';
import { Screen } from '@/components/ui/screen';
import { SAMPLE_TRIPS } from '@/data/flights';

export default function CheckIn() {
  const [checkedIn, setCheckedIn] = useState<Record<string, boolean>>({});

  return (
    <Screen>
      <AppText variant="title">Check-in</AppText>
      <AppText variant="caption">Online check-in opens 24 hours before departure.</AppText>
      {SAMPLE_TRIPS.map((t) => (
        <TripCard key={t.pnr} trip={{ ...t, status: checkedIn[t.pnr] ? 'Checked in' : t.status }}>
          <Button
            label={checkedIn[t.pnr] ? 'Checked in ✓' : 'Check in'}
            kind={checkedIn[t.pnr] ? 'ghost' : 'primary'}
            disabled={checkedIn[t.pnr]}
            onPress={() => setCheckedIn((c) => ({ ...c, [t.pnr]: true }))}
          />
        </TripCard>
      ))}
    </Screen>
  );
}
