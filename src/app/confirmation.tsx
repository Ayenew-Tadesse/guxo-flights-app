import { Redirect, useLocalSearchParams } from 'expo-router';
import { Fragment } from 'react';
import { View } from 'react-native';

import { BpRow, PassCard, PnrBox } from '@/components/ui';
import { Button, Screen, TopBar } from '@/design-system';
import { AIRLINE, fmtPrice, fmtTime } from '@/data/flights';
import { showRoot } from '@/state/nav';
import { fmtPts, useApp } from '@/state/store';

export default function Confirmation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = useApp();
  const t = s.trips.find((x) => x.id === id);
  if (!t) return <Redirect href="/trips" />;
  return (
    <Screen top={<TopBar title="Booked" />}>
      <PassCard icon="check" title="You're booked" sub="Saved to My Trips on this device.">
        {t.legs.map((lg, i) => (
          <Fragment key={i}>
            {lg.label ? <BpRow label={lg.label} strong /> : null}
            <BpRow label="Route" value={lg.origin + ' → ' + lg.destination} />
            <BpRow label="Flight" value={AIRLINE.name + ' ' + lg.flightNo} />
            <BpRow label="Departs" value={fmtTime(lg.dep)} />
            <BpRow label="Seats" value={lg.seats.join(', ')} />
          </Fragment>
        ))}
        <BpRow label="Fare" value={t.fareName} />
        <BpRow label={'Passenger' + (t.names.length > 1 ? 's' : '')} value={t.names.join(', ')} />
        <BpRow label="Total paid" value={fmtPrice(t.price)} />
        {t.pointsUsed ? <BpRow label="Guxo Points used" value={'−' + fmtPts(t.pointsUsed)} /> : null}
        <BpRow label="Guxo Points earned" value={t.pointsEarned ? '+' + fmtPts(t.pointsEarned) : 'Sign up to earn points'} />
        <PnrBox label="Confirmation code" code={t.pnr} />
      </PassCard>
      <View style={{ gap: 10, marginTop: 18 }}>
        <Button block label="View in My Trips" onPress={() => showRoot('/trips')} />
        <Button block kind="ghost" label="Book another flight" onPress={() => showRoot('/home')} />
      </View>
    </Screen>
  );
}
