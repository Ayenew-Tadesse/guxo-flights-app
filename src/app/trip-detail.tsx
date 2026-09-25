import { Redirect, useLocalSearchParams } from 'expo-router';
import { Fragment } from 'react';
import { View } from 'react-native';

import { BpRow, PassCard, PmBadge, PnrBox } from '@/components/ui';
import { Inset, InsetRow, Screen, SecTitle, T, TopBar } from '@/design-system';
import { AIRLINE, fmtDate, fmtPrice, fmtTime } from '@/data/flights';
import { goBack } from '@/state/nav';
import { fmtPts, useApp } from '@/state/store';

/** Booking details / receipt for a trip (also shows cancelled trips). */
export default function TripDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = useApp();
  const t = s.trips.find((x) => x.id === id);
  if (!t) return <Redirect href="/trips" />;
  const cancelled = t.cancelled;
  return (
    <Screen top={<TopBar title="Booking Details" onBack={goBack} />}>
      <PassCard
        icon={cancelled ? 'close' : 'check'}
        cancelled={cancelled}
        title={cancelled ? 'Trip cancelled' : "You're booked"}
        sub={cancelled ? 'This booking is no longer active.' : 'Saved to My Trips on this device.'}>
        {t.legs.map((lg, i) => (
          <Fragment key={i}>
            {lg.label ? <BpRow label={lg.label} strong /> : null}
            <BpRow label="Route" value={lg.origin + ' → ' + lg.destination} />
            <BpRow label="Flight" value={AIRLINE.name + ' ' + lg.flightNo} />
            <BpRow label="Departs" value={fmtDate(lg.dep) + ' · ' + fmtTime(lg.dep)} />
            <BpRow label="Seats" value={lg.seats.join(', ')} />
          </Fragment>
        ))}
        <BpRow label="Booked" value={fmtDate(t.bookedAt) + ' · ' + fmtTime(t.bookedAt)} />
        <BpRow label="Fare" value={t.fareName} />
        <BpRow label={'Passenger' + (t.names.length > 1 ? 's' : '')} value={t.names.join(', ')} />
        <BpRow label="Total paid" value={fmtPrice(t.price)} />
        {t.pointsUsed ? <BpRow label="Guxo Points used" value={cancelled ? 'Refunded' : '−' + fmtPts(t.pointsUsed)} /> : null}
        <BpRow label="Guxo Points earned" value={!t.pointsEarned ? '—' : cancelled ? 'Reversed' : '+' + fmtPts(t.pointsEarned)} />
        <PnrBox label="Confirmation code" code={t.pnr} />
      </PassCard>
      <SecTitle>Payment & status</SecTitle>
      <Inset>
        <InsetRow label="Payment method">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
            <PmBadge kind={t.paymentKind} />
            <T size={0.7812} weight={600}>
              {t.paymentLabel + ' · ' + t.paymentSub}
            </T>
          </View>
        </InsetRow>
        <InsetRow label="Amount charged" value={fmtPrice(t.price)} />
        <InsetRow label="Status" value={cancelled ? 'Cancelled' : 'Confirmed'} />
      </Inset>
    </Screen>
  );
}
