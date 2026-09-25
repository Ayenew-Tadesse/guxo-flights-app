import { Redirect, useLocalSearchParams } from 'expo-router';

import { BpRow, PassCard, PnrBox, QrCode } from '@/components/ui';
import { Screen, TopBar } from '@/design-system';
import { AIRLINE, fmtDate, fmtTime } from '@/data/flights';
import { goBack } from '@/state/nav';
import { useApp } from '@/state/store';

export default function Boarding() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = useApp();
  const t = s.trips.find((x) => x.id === id);
  if (!t) return <Redirect href="/check-in" />;
  return (
    <Screen top={<TopBar title="Boarding Pass" onBack={goBack} />}>
      {t.legs.map((lg, i) => (
        <PassCard key={i} badge={lg.label} title={lg.origin + ' → ' + lg.destination} sub={AIRLINE.name + ' ' + lg.flightNo + ' · ' + fmtDate(lg.dep)}>
          <BpRow label={'Passenger' + (t.names.length > 1 ? 's' : '')} value={t.names.join(', ')} />
          <BpRow label={'Seat' + (lg.seats.length > 1 ? 's' : '')} value={lg.seats.join(', ')} />
          <BpRow label="Boarding time" value={lg.boardingTime ? fmtTime(lg.boardingTime) : '—'} />
          <BpRow label="Gate" value={lg.gate ?? '—'} />
          <BpRow label="Departs" value={fmtTime(lg.dep)} />
          <PnrBox label="Boarding reference" code={t.pnr} />
          <QrCode seed={t.pnr + '-' + lg.flightNo} />
        </PassCard>
      ))}
    </Screen>
  );
}
