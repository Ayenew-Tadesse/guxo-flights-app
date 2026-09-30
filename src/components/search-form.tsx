import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type TextInput, type ViewStyle } from 'react-native';

import { Button, DateInput, Field, FormError, Icon, T, shadow, useColors, useLayout } from '@/design-system';
import { airport, findAirportByInput, fmtDate, todayIso } from '@/data/flights';
import { goTo } from '@/state/nav';
import { clearRecent, rerun, runSearch, setForm, swapForm, useBooking, type Search } from '@/state/booking';

import { AirportField } from './airport-field';

/** The prototype's search card: one way / round trip, From/To with swap, dates, passengers. */
export function SearchForm({ compact, style }: { compact?: boolean; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  const { atLeast } = useLayout();
  // The fields live in the booking store: Home and Book share them, and
  // they're remembered for next time.
  const { form, recent } = useBooking();
  const { tripType, from, to, departDate: date, returnDate: ret, passengers: pax } = form;
  const [error, setError] = useState<string | null>(null);
  const [spun, setSpun] = useState(false);

  const fromA = findAirportByInput(from);
  const toA = findAirportByInput(to);
  const toRef = useRef<TextInput>(null);

  function submit() {
    const o = findAirportByInput(from);
    const d = findAirportByInput(to);
    if (!o || !d) return setError('Enter a valid departure and destination city.');
    if (o.code === d.code) return setError('Choose two different airports.');
    if (tripType === 'round' && !ret) return setError('Choose a return date.');
    setError(null);
    runSearch({ origin: o.code, destination: d.code, departDate: date, returnDate: ret, tripType, passengers: pax });
    goTo('/results');
  }

  function again(q: Search) {
    setError(null);
    rerun(q);
    goTo('/results');
  }

  const stepper = (
    <Field label="Passengers" style={{ flex: 1 }}>
      <View style={[styles.stepper, { backgroundColor: c.surfaceAlt, borderColor: c.line }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fewer passengers" onPress={() => setForm({ passengers: pax - 1 })} style={[styles.paxBtn, { borderColor: c.lineStrong, backgroundColor: c.surface }]}>
          <T px={14}>−</T>
        </Pressable>
        <T>{pax}</T>
        <Pressable accessibilityRole="button" accessibilityLabel="More passengers" onPress={() => setForm({ passengers: pax + 1 })} style={[styles.paxBtn, { borderColor: c.lineStrong, backgroundColor: c.surface }]}>
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
              onPress={() => setForm({ tripType: t })}
              style={[styles.seg, on ? { backgroundColor: c.surface, boxShadow: '0px 1px 2px rgba(9,21,64,0.08), 0px 2px 6px rgba(9,21,64,0.06)' } : null]}>
              <T size={0.8125} weight={700} color={on ? c.primary : c.inkSoft}>
                {t === 'one' ? 'One way' : 'Round trip'}
              </T>
            </Pressable>
          );
        })}
      </View>

      {/* Above the rows below it, so an open airport list covers them. */}
      <View style={{ gap: 12, position: 'relative', zIndex: 10 }}>
        {/* Picking From moves straight on to To. */}
        <AirportField label="From" value={from} onChange={(v) => setForm({ from: v })} exclude={toA?.code} onPicked={() => toRef.current?.focus()} />
        <AirportField label="To" value={to} onChange={(v) => setForm({ to: v })} exclude={fromA?.code} inputRef={toRef} onPicked={() => toRef.current?.blur()} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Swap departure and destination"
          onPress={() => {
            swapForm();
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
          <DateInput value={date} min={todayIso()} onChange={(d) => setForm({ departDate: d })} />
        </Field>
        {tripType === 'round' ? (
          <Field label="Return" style={{ flex: 1 }}>
            <DateInput value={ret} min={date} onChange={(d) => setForm({ returnDate: d })} />
          </Field>
        ) : (
          stepper
        )}
      </View>
      {tripType === 'round' ? stepper : null}

      <Button block label="Search flights" onPress={submit} style={{ marginTop: 8 }} />
      <FormError>{error}</FormError>

      {recent.length ? (
        <View style={{ marginTop: 6, gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <T size={0.6875} weight={700} color={c.inkFaint} upper ls={0.06}>
              Recent searches
            </T>
            <Pressable accessibilityRole="button" accessibilityLabel="Clear recent searches" onPress={clearRecent} hitSlop={8}>
              <T size={0.75} weight={600} color={c.primary}>
                Clear
              </T>
            </Pressable>
          </View>
          {recent.map((q) => (
            <Pressable
              key={q.origin + q.destination + q.tripType}
              accessibilityRole="button"
              accessibilityLabel={'Search again: ' + airport(q.origin).city + ' to ' + airport(q.destination).city}
              onPress={() => again(q)}
              style={({ pressed }) => [styles.recent, { borderColor: c.line, backgroundColor: pressed ? c.surfaceAlt : c.surface }]}>
              <Icon name="plane" size={15} color={c.primary} strokeWidth={2} />
              <View style={{ flex: 1 }}>
                <T size={0.8125} weight={700}>
                  {airport(q.origin).city + (q.tripType === 'round' ? ' ⇄ ' : ' → ') + airport(q.destination).city}
                </T>
                <T size={0.6875} color={c.inkFaint}>
                  {recentWhen(q) + ' · ' + q.passengers + ' traveller' + (q.passengers > 1 ? 's' : '')}
                </T>
              </View>
              <T size={0.75} weight={700} color={c.primary}>
                Search
              </T>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const day = (iso: string) => fmtDate(new Date(iso + 'T00:00:00'));
function recentWhen(q: Search) {
  if (q.departDate < todayIso()) return 'From today';
  return day(q.departDate) + (q.tripType === 'round' && q.returnDate ? ' – ' + day(q.returnDate) : '');
}

const styles = StyleSheet.create({
  toggle: { flexDirection: 'row', gap: 4, borderWidth: 1, borderRadius: 13, padding: 4, marginBottom: 4 },
  seg: { flex: 1, alignItems: 'center', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 13, paddingVertical: 10, paddingHorizontal: 12 },
  paxBtn: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  recent: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 13, paddingVertical: 10, paddingHorizontal: 12 },
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
