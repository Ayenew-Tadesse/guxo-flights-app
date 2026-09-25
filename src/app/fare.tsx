import { Redirect } from 'expo-router';
import { Fragment } from 'react';
import { Pressable, View } from 'react-native';

import { Selectable } from '@/components/ui';
import { Button, Field, Gradient, Input, Screen, SecTitle, T, TopBar, useColors, useLayout } from '@/design-system';
import { AIRLINE, FARES, SEAT_LETTERS, SEAT_ROWS, fmtDur, fmtPrice, fmtTime, type Flight } from '@/data/flights';
import { goBack, goTo } from '@/state/nav';
import { fmtPts, loadTraveler, pointsFor, saveTraveler, setState, useApp } from '@/state/store';

function SummaryStrip({ f, o, d, label }: { f: Flight; o: string; d: string; label?: string }) {
  return (
    <Gradient style={{ borderRadius: 18, paddingVertical: 22, paddingHorizontal: 20, marginVertical: 8, gap: 16, minHeight: 118, justifyContent: 'center' }}>
      {label ? (
        <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.22)', paddingVertical: 4, paddingHorizontal: 11, borderRadius: 999 }}>
          <T size={0.6562} weight={800} color="#fff" upper ls={0.05}>
            {label + ' flight'}
          </T>
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <View>
          <T size={1} weight={700} color="#fff">
            {o + ' → ' + d}
          </T>
          <T size={0.75} color="rgba(255,255,255,0.8)" style={{ marginTop: 4 }}>
            {AIRLINE.name + ' ' + f.flightNo + ' · ' + fmtTime(f.dep)}
          </T>
        </View>
        <View>
          <T size={1} weight={700} color="#fff">
            {fmtDur(f.durationMin)}
          </T>
          <T size={0.75} color="rgba(255,255,255,0.8)" style={{ marginTop: 4 }}>
            {f.stops === 0 ? 'Nonstop' : '1 stop'}
          </T>
        </View>
      </View>
    </Gradient>
  );
}

function SeatMap({ f, picked, max, onToggle }: { f: Flight; picked: string[]; max: number; onToggle: (seat: string) => void }) {
  const c = useColors();
  const { atLeast } = useLayout();
  const size = atLeast(768) ? 32 : 28;
  const gap = atLeast(768) ? 6 : 4;
  const left = max - picked.length;
  return (
    <View style={{ alignItems: 'center', gap: 5, marginTop: 10 }}>
      {Array.from({ length: SEAT_ROWS }, (_, i) => i + 1).map((r) => (
        <View key={r} style={{ flexDirection: 'row', alignItems: 'center', gap }}>
          <T size={0.625} color={c.inkFaint} align="center" style={{ width: atLeast(768) ? 24 : 20 }}>
            {r}
          </T>
          {SEAT_LETTERS.map((l, idx) => {
            const id = r + l;
            const taken = !!f.seatMap?.[id];
            const on = picked.includes(id);
            return (
              <Fragment key={id}>
                {idx === 3 ? <View style={{ width: atLeast(768) ? 12 : 10 }} /> : null}
                <Pressable
                  disabled={taken}
                  accessibilityRole="button"
                  accessibilityLabel={'Seat ' + id + (taken ? ', taken' : on ? ', selected' : '')}
                  onPress={() => onToggle(id)}
                  style={{
                    width: size,
                    height: size,
                    borderRadius: 7,
                    borderWidth: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderColor: on ? c.primary : taken ? c.line : c.lineStrong,
                    backgroundColor: on ? c.primary : taken ? c.line : c.surfaceAlt,
                  }}>
                  <T size={0.5938} color={on ? '#fff' : taken ? c.line : c.inkFaint}>
                    {l}
                  </T>
                </Pressable>
              </Fragment>
            );
          })}
        </View>
      ))}
      <T size={0.75} color={c.inkFaint} align="center" style={{ marginTop: 8 }}>
        {picked.length === 0 ? max + ' seat(s) to select' : left > 0 ? left + ' more seat(s) to select' : 'Selected: ' + picked.join(', ')}
      </T>
    </View>
  );
}

export default function Fare() {
  const c = useColors();
  const s = useApp();
  if (!s.outFlight || (s.tripType === 'round' && !s.returnFlight)) return <Redirect href="/home" />;
  const isRound = s.tripType === 'round';
  const legSum = s.outFlight.price + (isRound && s.returnFlight ? s.returnFlight.price : 0);
  const saved = loadTraveler();
  const pax = s.passengers;

  function toggleSeat(key: 'seatsOut' | 'seatsReturn', id: string) {
    const arr = s[key];
    if (arr.includes(id)) setState({ [key]: arr.filter((x) => x !== id) } as never);
    else if (arr.length < pax) setState({ [key]: [...arr, id] } as never);
  }
  function setName(i: number, v: string) {
    const names = s.names.slice();
    names[i] = v;
    setState({ names });
    if (i === 0) saveTraveler(v.trim(), s.paxEmail.trim());
  }

  const namesOk = s.names.length === pax && s.names.every((n) => n.trim().length > 1);
  const seatsOk = s.seatsOut.length === pax && (!isRound || s.seatsReturn.length === pax);
  const ok = !!s.fareTier && seatsOk && namesOk && s.paxEmail.trim().length > 3;

  return (
    <Screen top={<TopBar title="Fare & Seats" onBack={goBack} />}>
      <View style={{ marginTop: 8 }}>
        <SummaryStrip f={s.outFlight} o={s.origin} d={s.destination} label={isRound ? 'Outbound' : undefined} />
        {isRound && s.returnFlight ? <SummaryStrip f={s.returnFlight} o={s.destination} d={s.origin} label="Return" /> : null}
      </View>

      <SecTitle>Choose your fare</SecTitle>
      <View style={{ gap: 10 }}>
        {FARES.map((t) => {
          const per = legSum + t.add * (isRound ? 2 : 1);
          const on = s.fareTier === t.id;
          return (
            <Selectable key={t.id} selected={on} onPress={() => setState({ fareTier: t.id })} label={t.name + ' fare, ' + fmtPrice(per)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, paddingVertical: 14, paddingHorizontal: 16 }}>
                <View style={{ flexShrink: 1 }}>
                  <T size={0.9375} weight={700}>
                    {t.name}
                  </T>
                  <T size={0.75} color={c.inkFaint} style={{ marginTop: 3 }}>
                    {t.feats.join(' · ')}
                  </T>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ alignItems: 'flex-end' }}>
                    <T size={0.9375} weight={800}>
                      {fmtPrice(per)}
                    </T>
                    <T size={0.6562} weight={700} color={c.primary} style={{ marginTop: 2 }}>
                      {'+' + fmtPts(pointsFor(per)) + ' pts'}
                    </T>
                  </View>
                  <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: on ? c.primary : c.lineStrong, alignItems: 'center', justifyContent: 'center' }}>
                    {on ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.primary }} /> : null}
                  </View>
                </View>
              </View>
            </Selectable>
          );
        })}
      </View>
      <View style={{ backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: c.line, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, marginTop: 12, gap: 6 }}>
        {[
          "Infants under 2 fly free on a parent's lap",
          'Standard & Flex include 1 checked bag · Basic is personal item only',
          'The price shown at payment is final — no fees added at checkout',
        ].map((line) => (
          <T key={line} size={0.75} color={c.inkSoft}>
            {'•  ' + line}
          </T>
        ))}
      </View>

      <SecTitle>Passenger details</SecTitle>
      <T size={0.75} color={c.inkFaint} style={{ marginTop: 2, marginBottom: 4 }}>
        {"Enter each traveler once — we'll keep everyone organized for checkout, no repeating details."}
      </T>
      <View style={{ gap: 10, marginTop: 8 }}>
        {saved && (saved.name || saved.email) ? (
          <T size={0.75} color={c.inkFaint}>
            Filled in from your saved details — edit anytime.
          </T>
        ) : null}
        {Array.from({ length: pax }, (_, i) => (
          <View key={i} style={{ gap: 10 }}>
            <Field label={'Passenger ' + (i + 1) + ' full name'}>
              <Input accessibilityLabel={'Passenger ' + (i + 1) + ' full name'} value={s.names[i] ?? ''} onChangeText={(v) => setName(i, v)} />
            </Field>
            {i === 0 ? (
              <Field label="Email">
                <Input
                  accessibilityLabel="Email"
                  value={s.paxEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={(v) => {
                    setState({ paxEmail: v });
                    saveTraveler((s.names[0] ?? '').trim(), v.trim());
                  }}
                />
              </Field>
            ) : null}
          </View>
        ))}
      </View>

      <SecTitle>{(isRound ? 'Outbound seats' : 'Pick your seat') + ' — pick ' + pax + ' seat' + (pax > 1 ? 's' : '')}</SecTitle>
      <SeatMap f={s.outFlight} picked={s.seatsOut} max={pax} onToggle={(id) => toggleSeat('seatsOut', id)} />
      {isRound && s.returnFlight ? (
        <>
          <SecTitle>{'Return seats — pick ' + pax + ' seat' + (pax > 1 ? 's' : '')}</SecTitle>
          <SeatMap f={s.returnFlight} picked={s.seatsReturn} max={pax} onToggle={(id) => toggleSeat('seatsReturn', id)} />
        </>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 }}>
        {[
          ['Available', c.surfaceAlt, c.lineStrong],
          ['Selected', c.primary, c.primary],
          ['Taken', c.line, c.line],
        ].map(([label, bg, border]) => (
          <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: bg, borderWidth: 1, borderColor: border }} />
            <T size={0.6875} color={c.inkSoft}>
              {label}
            </T>
          </View>
        ))}
      </View>
      <Button block label="Continue to payment" disabled={!ok} onPress={() => goTo('/payment')} style={{ marginTop: 18 }} />
    </Screen>
  );
}
