import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { CheckRow, Box, PmBadge, Selectable } from '@/components/ui';
import { Button, Field, Icon, Input, Inset, InsetRow, Screen, SecTitle, T, TopBar, mix, useColors, type IconName } from '@/design-system';
import { AIRLINE, BRAND_LABEL, FARES, cardBrand, fmtPrice, fmtTime, formatCardNumber, formatExpiry, newPnr, uid } from '@/data/flights';
import { goBack, withLoader } from '@/state/nav';
import {
  MIN_REDEEM,
  addPoints,
  addSavedCard,
  fmtPts,
  getState,
  legFromFlight,
  pointsBalance,
  pointsFor,
  savedCards,
  setState,
  tripRouteText,
  useApp,
  type Trip,
} from '@/state/store';

type PayType = 'card' | 'phone' | 'bank';
const TILES: { type: PayType; label: string; icon: IconName }[] = [
  { type: 'card', label: 'Card', icon: 'card' },
  { type: 'phone', label: 'Phone', icon: 'phone' },
  { type: 'bank', label: 'Bank counter', icon: 'bank' },
];

export default function Payment() {
  const c = useColors();
  const s = useApp();
  const [type, setType] = useState<PayType | null>(null);
  const cards = savedCards(s.currentUser);
  const defaultCard = cards.find((x) => x.isDefault) ?? cards[0];
  const [cardId, setCardId] = useState<string>(defaultCard ? defaultCard.id : 'new');
  const [cardName, setCardName] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [phoneName, setPhoneName] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankRef] = useState(() => 'BK-' + uid().toUpperCase());
  const [usePoints, setUsePoints] = useState(false);

  const fare = FARES.find((f) => f.id === s.fareTier);
  if (!s.outFlight || !fare) return <Redirect href="/home" />;
  const isRound = s.tripType === 'round';
  const legSum = s.outFlight.price + (isRound && s.returnFlight ? s.returnFlight.price : 0);
  const base = (legSum + fare.add * (isRound ? 2 : 1)) * s.passengers;
  const tax = Math.round(base * 0.1);
  const gross = base + tax;
  const bal = pointsBalance(s.currentUser);
  const canRedeem = !!s.currentUser && bal >= MIN_REDEEM;
  const maxPts = Math.min(Math.floor(bal / 10) * 10, Math.floor(gross) * 10);
  const usePts = canRedeem && usePoints ? maxPts : 0;
  const total = gross - usePts / 10;
  const picked = cards.find((x) => x.id === cardId);

  let ok = false;
  if (type === 'card') ok = picked ? cvc.length >= 3 : cardName.trim().length > 1 && cardNum.replace(/\s/g, '').length >= 12 && cardExp.length === 5 && cvc.length >= 3;
  if (type === 'phone') ok = phoneName.trim().length > 1 && phoneNum.replace(/\D/g, '').length >= 9;
  if (type === 'bank') ok = bankName.trim().length > 1;

  function pay() {
    const st = getState();
    const pnr = newPnr();
    const legs = [legFromFlight(st.outFlight!, st.origin, st.destination, isRound ? 'Outbound' : null, st.seatsOut)];
    if (isRound && st.returnFlight) legs.push(legFromFlight(st.returnFlight, st.destination, st.origin, 'Return', st.seatsReturn));
    let paymentKind = 'bank';
    let paymentLabel = 'Bank counter';
    let paymentSub = bankRef;
    if (type === 'card') {
      paymentLabel = 'Card';
      if (picked) {
        paymentKind = picked.brand;
        paymentSub = '•••• ' + picked.last4;
      } else {
        const digits = cardNum.replace(/\s/g, '');
        paymentKind = cardBrand(digits);
        paymentSub = '•••• ' + digits.slice(-4);
        if (st.currentUser && saveCard) addSavedCard({ brand: cardBrand(digits), last4: digits.slice(-4), exp: cardExp, name: cardName.trim() });
      }
    } else if (type === 'phone') {
      paymentKind = 'telebirr';
      paymentLabel = 'Mobile Banking';
      paymentSub = phoneNum;
    }
    const trip: Trip = {
      id: 'TR-' + uid(),
      tripType: st.tripType,
      legs,
      fareTier: fare!.id,
      fareName: fare!.name,
      names: st.names.map((n) => n.trim()),
      price: total,
      pnr,
      checkedIn: false,
      cancelled: false,
      paymentKind,
      paymentLabel,
      paymentSub,
      bookedAt: new Date(),
      pointsEarned: 0,
      pointsUsed: usePts,
    };
    const routeTxt = tripRouteText(trip);
    if (usePts) addPoints(-usePts, 'Used on ' + routeTxt + ' · PNR ' + pnr, 'redeem', 'redeem-' + trip.id);
    trip.pointsEarned = st.currentUser ? addPoints(pointsFor(total), 'Booked ' + routeTxt + ' · PNR ' + pnr, 'earn', 'earn-' + trip.id) : 0;
    setState((x) => ({ trips: [trip, ...x.trips], lastTripId: trip.id }));
    // Like the prototype: Back from the confirmation lands on My Trips.
    withLoader(() => {
      if (router.canDismiss()) router.dismissAll();
      router.navigate('/trips');
      router.push({ pathname: '/confirmation', params: { id: trip.id } });
    });
  }

  return (
    <Screen top={<TopBar title="Payment" onBack={goBack} />}>
      <Inset style={{ marginVertical: 14 }}>
        <InsetRow label={isRound ? 'Outbound' : 'Route'} value={s.origin + ' → ' + s.destination} />
        <InsetRow label="Flight" value={AIRLINE.name + ' ' + s.outFlight.flightNo} />
        <InsetRow label="Departs" value={fmtTime(s.outFlight.dep)} />
        <InsetRow label="Seats" value={s.seatsOut.join(', ')} />
        {isRound && s.returnFlight ? (
          <>
            <View style={{ height: 8 }} />
            <InsetRow label="Return" value={s.destination + ' → ' + s.origin} />
            <InsetRow label="Flight" value={AIRLINE.name + ' ' + s.returnFlight.flightNo} />
            <InsetRow label="Departs" value={fmtTime(s.returnFlight.dep)} />
            <InsetRow label="Seats" value={s.seatsReturn.join(', ')} />
          </>
        ) : null}
      </Inset>

      <SecTitle>Choose payment type</SecTitle>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
        {TILES.map((t) => {
          const on = type === t.type;
          return (
            <Selectable key={t.type} selected={on} onPress={() => setType(t.type)} label={t.label} style={{ flex: 1, borderRadius: 13 }}>
              <View style={{ alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 8 }}>
                <Icon name={t.icon} size={20} color={on ? c.primary : c.inkFaint} />
                <T size={0.75} weight={600} color={on ? c.primary : c.inkSoft} align="center">
                  {t.label}
                </T>
              </View>
            </Selectable>
          );
        })}
      </View>

      {type ? (
        <View style={{ gap: 10, marginVertical: 14, padding: 14, backgroundColor: c.surfaceAlt, borderRadius: 14 }}>
          {type === 'card' ? (
            <>
              {cards.length ? (
                <View style={{ gap: 8 }}>
                  {[...cards.map((x) => ({ id: x.id, card: x })), { id: 'new', card: null }].map(({ id, card }) => {
                    const on = cardId === id;
                    return (
                      <Pressable
                        key={id}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: on }}
                        onPress={() => setCardId(id)}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: c.surface, borderWidth: 1.5, borderColor: on ? c.primary : c.line, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 }}>
                        <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: on ? c.primary : c.lineStrong, alignItems: 'center', justifyContent: 'center' }}>
                          {on ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.primary }} /> : null}
                        </View>
                        {card ? <PmBadge kind={card.brand} /> : null}
                        <T size={0.8125} weight={600} style={{ flex: 1 }}>
                          {card ? BRAND_LABEL[card.brand] + ' •••• ' + card.last4 : 'Use a new card'}
                          {card ? (
                            <T size={0.8125} color={c.inkFaint}>
                              {' · exp ' + card.exp}
                            </T>
                          ) : null}
                        </T>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
              {picked ? (
                <Field label={'CVC for ' + BRAND_LABEL[picked.brand] + ' •••• ' + picked.last4}>
                  <Input accessibilityLabel="CVC" value={cvc} onChangeText={(v) => setCvc(v.replace(/\D/g, '').slice(0, 4))} placeholder="CVC" secureTextEntry inputMode="numeric" />
                </Field>
              ) : (
                <>
                  <Field label="Name on card">
                    <Input accessibilityLabel="Name on card" value={cardName} onChangeText={setCardName} placeholder="Full name" />
                  </Field>
                  <Field label="Card number">
                    <Input accessibilityLabel="Card number" value={cardNum} onChangeText={(v) => setCardNum(formatCardNumber(v))} placeholder="0000 0000 0000 0000" inputMode="numeric" />
                  </Field>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Field label="Expiry" style={{ flex: 1 }}>
                      <Input accessibilityLabel="Expiry" value={cardExp} onChangeText={(v) => setCardExp(formatExpiry(v))} placeholder="MM/YY" inputMode="numeric" />
                    </Field>
                    <Field label="CVC" style={{ flex: 1 }}>
                      <Input accessibilityLabel="CVC" value={cvc} onChangeText={(v) => setCvc(v.replace(/\D/g, '').slice(0, 4))} placeholder="CVC" secureTextEntry inputMode="numeric" />
                    </Field>
                  </View>
                  {s.currentUser ? <CheckRow label="Save this card for next time" checked={saveCard} onToggle={() => setSaveCard((v) => !v)} /> : null}
                </>
              )}
            </>
          ) : null}
          {type === 'phone' ? (
            <>
              <Field label="Full name">
                <Input accessibilityLabel="Full name" value={phoneName} onChangeText={setPhoneName} placeholder="Full name" />
              </Field>
              <Field label="Phone number">
                <Input accessibilityLabel="Phone number" value={phoneNum} onChangeText={setPhoneNum} placeholder="09xx xxx xxx" inputMode="tel" maxLength={13} />
              </Field>
              <T size={0.75} color={c.inkSoft} lh={1.5}>
                {"We'll send a payment prompt to this number to confirm the deposit."}
              </T>
            </>
          ) : null}
          {type === 'bank' ? (
            <>
              <Field label="Full name">
                <Input accessibilityLabel="Full name" value={bankName} onChangeText={setBankName} placeholder="Full name" />
              </Field>
              <View style={{ alignItems: 'center', padding: 12, backgroundColor: c.surface, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: c.lineStrong }}>
                <T size={0.625} color={c.inkFaint} upper ls={0.06} style={{ marginBottom: 4 }}>
                  Payment reference
                </T>
                <T size={1.125} weight={700} color={c.primary} ls={0.1}>
                  {bankRef}
                </T>
              </View>
              <T size={0.75} color={c.inkSoft} lh={1.5}>
                Take this reference to any Ethiopian Airlines partner bank counter and pay the total shown below within 24 hours.
              </T>
            </>
          ) : null}
        </View>
      ) : null}

      {canRedeem ? (
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: usePoints }}
          onPress={() => setUsePoints((v) => !v)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: mix(c.primary, 6, c.surface), borderWidth: 1, borderColor: mix(c.primary, 20, c.line), borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, marginTop: 14 }}>
          <Box checked={usePoints} />
          <View style={{ flex: 1 }}>
            <T size={0.8125} weight={700}>
              Use Guxo Points
            </T>
            <T size={0.6875} color={c.inkSoft}>
              {fmtPts(maxPts) + ' of your ' + fmtPts(bal) + ' points'}
            </T>
          </View>
          <T size={0.8125} weight={800} color={c.good}>
            {'−' + fmtPrice(maxPts / 10)}
          </T>
        </Pressable>
      ) : null}

      <Inset style={{ marginTop: 16, marginBottom: 6 }}>
        <PriceLine label={'Fare (' + fare.name + (isRound ? ', round trip' : '') + ') × ' + s.passengers} value={fmtPrice(base)} />
        <PriceLine label="Taxes & fees" value={fmtPrice(tax)} />
        {usePts ? <PriceLine label={'Guxo Points (' + fmtPts(usePts) + ')'} value={'−' + fmtPrice(usePts / 10)} good /> : null}
        <View style={{ borderTopWidth: 1, borderTopColor: c.line, paddingTop: 8, marginTop: 4 }}>
          <PriceLine label="Total" value={fmtPrice(total)} total />
        </View>
        <T size={0.7188} weight={700} color={c.primary} align="right" style={{ marginTop: 8 }}>
          {s.currentUser ? "You'll earn " + fmtPts(pointsFor(total)) + ' Guxo Points' : 'Sign up to earn ' + fmtPts(pointsFor(total)) + ' Guxo Points on this trip'}
        </T>
      </Inset>
      <Button block label="Pay & confirm" disabled={!ok} onPress={pay} style={{ marginTop: 6 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.surfaceAlt, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginTop: 14 }}>
        <Icon name="shield" size={16} color={c.good} strokeWidth={2} />
        <T size={0.75} color={c.inkSoft} style={{ flex: 1 }}>
          Secure checkout · No hidden fees · The total above is exactly what you pay
        </T>
      </View>
      <T size={0.6875} color={c.inkFaint} align="center" style={{ marginTop: 10 }}>
        Demo checkout — this is a prototype, no real payment is processed.
      </T>
    </Screen>
  );
}

function PriceLine({ label, value, total, good }: { label: string; value: string; total?: boolean; good?: boolean }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, gap: 10 }}>
      <T size={total ? 0.9375 : 0.8125} weight={total ? 800 : 400}>
        {label}
      </T>
      <T size={total ? 0.9375 : 0.8125} weight={total ? 800 : 400} color={good ? c.good : c.ink}>
        {value}
      </T>
    </View>
  );
}
