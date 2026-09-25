import { useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Button, ComboInput, DateInput, Field, FormError, Icon, T, shadow, useColors, useLayout } from '@/design-system';
import { AIRPORTS, addDaysIso, airport, findAirportByInput, formatAirport, todayIso } from '@/data/flights';
import { goTo } from '@/state/nav';
import { getState, startSearch } from '@/state/store';

/** The prototype's search card: one way / round trip, From/To with swap, dates, passengers. */
export function SearchForm({ compact, style }: { compact?: boolean; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  const { atLeast } = useLayout();
  const init = getState();
  const [tripType, setTripType] = useState<'one' | 'round'>('one');
  const [from, setFrom] = useState(formatAirport(airport(init.origin)));
  const [to, setTo] = useState(formatAirport(airport(init.destination)));
  const [date, setDate] = useState(todayIso());
  const [ret, setRet] = useState('');
  const [pax, setPax] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [spun, setSpun] = useState(false);

  const fromA = findAirportByInput(from);
  const toA = findAirportByInput(to);
  const originOptions = AIRPORTS.filter((a) => a.code !== toA?.code).map(formatAirport);
  const destOptions = AIRPORTS.filter((a) => a.code !== fromA?.code).map(formatAirport);

  function chooseTrip(t: 'one' | 'round') {
    setTripType(t);
    if (t === 'round') setRet((r) => (r && r >= date ? r : addDaysIso(date, 7)));
    else setRet('');
  }

  function changeDate(d: string) {
    setDate(d);
    if (tripType === 'round' && ret && ret < d) setRet(d);
  }

  function submit() {
    const o = findAirportByInput(from);
    const d = findAirportByInput(to);
    if (!o || !d) return setError('Enter a valid departure and destination city.');
    if (o.code === d.code) return setError('Choose two different airports.');
    if (tripType === 'round' && !ret) return setError('Choose a return date.');
    setError(null);
    setFrom(formatAirport(o));
    setTo(formatAirport(d));
    startSearch(o.code, d.code, date, pax, tripType, tripType === 'round' ? ret : null);
    goTo('/results');
  }

  const stepper = (
    <Field label="Passengers" style={{ flex: 1 }}>
      <View style={[styles.stepper, { backgroundColor: c.surfaceAlt, borderColor: c.line }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fewer passengers" onPress={() => setPax((p) => Math.max(1, p - 1))} style={[styles.paxBtn, { borderColor: c.lineStrong, backgroundColor: c.surface }]}>
          <T px={14}>−</T>
        </Pressable>
        <T>{pax}</T>
        <Pressable accessibilityRole="button" accessibilityLabel="More passengers" onPress={() => setPax((p) => Math.min(6, p + 1))} style={[styles.paxBtn, { borderColor: c.lineStrong, backgroundColor: c.surface }]}>
          <T px={14}>+</T>
        </Pressable>
      </View>
    </Field>
  );

  return (
    <View
      style={[
        {
          backgroundColor: c.surface,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: c.line,
          padding: atLeast(1440) ? 28 : atLeast(600) ? 22 : 18,
          gap: 12,
        },
        compact ? { marginTop: 14, borderStyle: 'dashed' } : { boxShadow: shadow },
        style,
      ]}>
      <View style={[styles.toggle, { backgroundColor: c.surfaceAlt, borderColor: c.line }]}>
        {(['one', 'round'] as const).map((t) => {
          const on = tripType === t;
          return (
            <Pressable
              key={t}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => chooseTrip(t)}
              style={[styles.seg, on ? { backgroundColor: c.surface, boxShadow: '0px 1px 2px rgba(9,21,64,0.08), 0px 2px 6px rgba(9,21,64,0.06)' } : null]}>
              <T size={0.8125} weight={700} color={on ? c.primary : c.inkSoft}>
                {t === 'one' ? 'One way' : 'Round trip'}
              </T>
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: 12, position: 'relative' }}>
        <Field label="From">
          <ComboInput label="From" icon="pin" value={from} onChangeText={setFrom} suggestions={originOptions} placeholder="City or airport code" />
        </Field>
        <Field label="To">
          <ComboInput label="To" icon="pin" value={to} onChangeText={setTo} suggestions={destOptions} placeholder="City or airport code" />
        </Field>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Swap departure and destination"
          onPress={() => {
            setFrom(to);
            setTo(from);
            setSpun((v) => !v);
          }}
          style={[
            styles.swap,
            { borderColor: c.lineStrong, backgroundColor: c.surface, transform: [{ translateY: -17 }, { rotate: spun ? '180deg' : '0deg' }] },
          ]}>
          <Icon name="swap" size={16} color={c.primary} strokeWidth={2} />
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Field label="Depart" style={{ flex: 1 }}>
          <DateInput value={date} min={todayIso()} onChange={changeDate} />
        </Field>
        {tripType === 'round' ? (
          <Field label="Return" style={{ flex: 1 }}>
            <DateInput value={ret} min={date} onChange={setRet} />
          </Field>
        ) : (
          stepper
        )}
      </View>
      {tripType === 'round' ? stepper : null}

      <Button block label="Search flights" onPress={submit} style={{ marginTop: 8 }} />
      <FormError>{error}</FormError>
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: { flexDirection: 'row', gap: 4, borderWidth: 1, borderRadius: 13, padding: 4, marginBottom: 4 },
  seg: { flex: 1, alignItems: 'center', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 13, paddingVertical: 10, paddingHorizontal: 12 },
  paxBtn: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  swap: {
    position: 'absolute',
    right: 14,
    top: '50%',
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 1px 2px rgba(9,21,64,0.08), 0px 4px 10px rgba(9,21,64,0.08)',
    zIndex: 2,
  },
});
