import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Badge, Button, Card, RouteDots, T, useColors } from '@/design-system';
import { AIRLINE, airport, fmtDur, fmtPrice, fmtTime, type Flight } from '@/data/flights';

const LOGO = require('../../assets/images/airline-logo.png');

export function AirlineMark({ size = 26 }: { size?: number }) {
  const c = useColors();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: c.line,
        padding: size > 22 ? 4 : 3,
        boxShadow: '0px 1px 2px rgba(9,21,64,0.08)',
      }}>
      <Image source={LOGO} style={{ width: '100%', height: '100%' }} contentFit="contain" accessibilityLabel="Ethiopian Airlines" />
    </View>
  );
}

/** One result: ribbons, airline, times with route dots, price, details timeline and Select. */
export function FlightCard({
  f,
  origin,
  destination,
  cheapest,
  fastest,
  onSelect,
}: {
  f: Flight;
  origin: string;
  destination: string;
  cheapest?: boolean;
  fastest?: boolean;
  onSelect: () => void;
}) {
  const c = useColors();
  const [open, setOpen] = useState(false);
  const stopsLabel = f.stops === 0 ? 'Nonstop' : '1 stop in ' + airport(f.layoverCity!).city + (f.layoverMin ? ' · ' + f.layoverMin + 'm layover' : '');
  return (
    <Card>
      {cheapest || fastest ? (
        <View style={{ flexDirection: 'row', gap: 4, marginBottom: 6 }}>
          {cheapest ? <Badge label="Cheapest" tone="good" /> : null}
          {fastest ? <Badge label="Fastest" tone="primary" /> : null}
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <AirlineMark />
        <T size={0.7812} weight={600} color={c.inkSoft}>
          {AIRLINE.name + ' · ' + f.flightNo}
        </T>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <T size={0.9375} weight={700}>
          {fmtTime(f.dep)}
        </T>
        <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
          <T size={0.6562} weight={600} color={c.inkFaint}>
            {fmtDur(f.durationMin)}
          </T>
          <RouteDots />
        </View>
        <T size={0.9375} weight={700}>
          {fmtTime(f.arr)}
        </T>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 10, gap: 10 }}>
        <T size={0.7188} color={c.inkFaint} style={{ flexShrink: 1 }}>
          {stopsLabel}
        </T>
        <View style={{ alignItems: 'flex-end', gap: 1 }}>
          <T size={1} weight={700} color={c.primary}>
            {fmtPrice(f.price)}
          </T>
          <T size={0.625} color={c.inkFaint}>
            {'+' + fmtPrice(Math.round(f.price * 0.1)) + ' est. tax'}
          </T>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((v) => !v)}
        style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8, padding: 6 }}>
        <T size={0.75} weight={700} color={c.primary}>
          {open ? 'Hide details' : 'Flight details'}
        </T>
        <T size={0.75} weight={700} color={c.primary} style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          ▾
        </T>
      </Pressable>
      {open ? <FlightDetails f={f} origin={origin} destination={destination} /> : null}
      <Button block label="Select flight" onPress={onSelect} style={{ marginTop: 10 }} />
    </Card>
  );
}

/** Timeline of the trip: airports, any stop, and when to arrive. */
function FlightDetails({ f, origin, destination }: { f: Flight; origin: string; destination: string }) {
  const c = useColors();
  const oa = airport(origin);
  const da = airport(destination);
  const stops: { kind: 'first' | 'mid' | 'last'; time: string; title: string; sub: string }[] = [
    { kind: 'first', time: fmtTime(f.dep), title: `${oa.city} (${oa.code})`, sub: `${oa.name} · ${AIRLINE.name} ${f.flightNo}` },
  ];
  if (f.stops && f.layoverCity) {
    const la = airport(f.layoverCity);
    const firstLeg = Math.round((f.durationMin - f.layoverMin) / 2);
    stops.push({
      kind: 'mid',
      time: fmtTime(new Date(f.dep.getTime() + firstLeg * 60000)),
      title: `Stop in ${la.city} (${la.code})`,
      sub: `${f.layoverMin}m layover at ${la.name} · stay on board or follow crew`,
    });
  }
  stops.push({ kind: 'last', time: fmtTime(f.arr), title: `${da.city} (${da.code})`, sub: `${da.name} · ${fmtDur(f.durationMin)} total` });
  return (
    <View style={{ borderTopWidth: 1, borderStyle: 'dashed', borderColor: c.line, marginTop: 6, paddingTop: 12 }}>
      {stops.map((st) => (
        <View key={st.kind} style={{ flexDirection: 'row', gap: 10 }}>
          <T size={0.8125} weight={700} align="right" style={{ width: 62 }}>
            {st.time}
          </T>
          <View style={{ width: 14, alignItems: 'center' }}>
            <View
              style={[
                styles.node,
                st.kind === 'mid'
                  ? { width: 8, height: 8, borderColor: c.inkFaint, backgroundColor: c.surface }
                  : { borderColor: c.primary, backgroundColor: st.kind === 'last' ? c.primary : c.surface },
              ]}
            />
            {st.kind !== 'last' ? <View style={{ flex: 1, borderLeftWidth: 2, borderStyle: 'dotted', borderColor: c.lineStrong, marginTop: 2 }} /> : null}
          </View>
          <View style={{ flex: 1, paddingBottom: 14, minWidth: 0 }}>
            <T size={0.8125} weight={700}>
              {st.title}
            </T>
            <T size={0.7188} color={c.inkSoft} style={{ marginTop: 1 }}>
              {st.sub}
            </T>
          </View>
        </View>
      ))}
      <View style={{ backgroundColor: c.surfaceAlt, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 11, marginTop: 2 }}>
        <T size={0.7188} color={c.inkSoft} lh={1.5}>
          <T size={0.7188} weight={700}>
            Check-in closes 45 minutes before departure.
          </T>
          {` Arrive at ${oa.name} at least 1 hour early for domestic flights. Standard & Flex fares include 1 checked bag.`}
        </T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  node: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, marginTop: 3 },
});
