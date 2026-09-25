import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { FlightCard } from '@/components/flight-card';
import { FieldLabel, Gradient, RangeInput, Screen, SelectInput, T, TopBar, alpha, mix, useColors } from '@/design-system';
import { airport, fmtDate, fmtPrice, withSeatMap, type Flight } from '@/data/flights';
import { goBack, goTo } from '@/state/nav';
import { currentLegParams, getState, loadLegResults, loadTraveler, setState, useApp } from '@/state/store';

function chooseFlight(f: Flight) {
  const s = getState();
  const flight = withSeatMap(f);
  if (s.bookingLeg === 'out') {
    setState({ outFlight: flight });
    if (s.tripType === 'round') {
      setState({ bookingLeg: 'return' });
      loadLegResults();
      return;
    }
  } else {
    setState({ returnFlight: flight });
  }
  const saved = loadTraveler();
  setState({
    fareTier: null,
    seatsOut: [],
    seatsReturn: [],
    names: Array.from({ length: s.passengers }, (_, i) => (i === 0 && saved?.name ? saved.name : '')),
    paxEmail: saved?.email ?? '',
  });
  goTo('/fare');
}

export default function Results() {
  const s = useApp();
  if (!s.flights.length) return <Redirect href="/home" />;
  const p = currentLegParams(s);
  return (
    <Screen top={<TopBar title={p.o + ' → ' + p.d} onBack={goBack} />}>
      {/* Remount per result set so filters reset like the prototype. */}
      <ResultsBody key={s.flights[0].id} />
    </Screen>
  );
}

function ResultsBody() {
  const c = useColors();
  const s = useApp();
  const p = currentLegParams(s);
  const prices = s.flights.map((f) => f.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const [stops, setStops] = useState('any');
  const [time, setTime] = useState('any');
  const [sort, setSort] = useState('best');
  const [cap, setCap] = useState(max);
  const isRound = s.tripType === 'round';
  const isOut = s.bookingLeg === 'out';

  const list = s.flights
    .filter((f) => {
      if (stops === 'nonstop' && f.stops !== 0) return false;
      if (stops === 'onestop' && f.stops !== 1) return false;
      if (f.price > cap) return false;
      const h = f.dep.getHours();
      if (time === 'morning' && h >= 12) return false;
      if (time === 'afternoon' && (h < 12 || h >= 17)) return false;
      if (time === 'evening' && h < 17) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'price') return a.price - b.price;
      if (sort === 'duration') return a.durationMin - b.durationMin;
      if (sort === 'depart') return a.dep.getTime() - b.dep.getTime();
      return a.price * 0.55 + a.durationMin * 4.5 - (b.price * 0.55 + b.durationMin * 4.5);
    });
  const cheapestId = list.length ? list.slice().sort((a, b) => a.price - b.price)[0].id : null;
  const fastestId = list.length ? list.slice().sort((a, b) => a.durationMin - b.durationMin)[0].id : null;

  function pickDate(iso: string) {
    if (isOut) setState((st) => ({ departDate: iso, returnDate: st.returnDate && st.returnDate < iso ? iso : st.returnDate }));
    else setState({ returnDate: iso });
    loadLegResults();
  }

  return (
    <View>
      {isRound ? (
        <Gradient style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, paddingVertical: 11, paddingHorizontal: 14, marginBottom: 12 }}>
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' }}>
            <T size={0.75} weight={800} color="#fff">
              {isOut ? '1' : '2'}
            </T>
          </View>
          <View style={{ flexShrink: 1 }}>
            <T size={0.9375} weight={800} color="#fff">
              {isOut ? 'Outbound flight' : 'Return flight'}
            </T>
            <T size={0.7188} color="rgba(255,255,255,0.85)" style={{ marginTop: 1 }}>
              {isOut ? 'Step 1 of 2 — choose your departing flight, then pick your return' : 'Step 2 of 2 — now choose your flight back to ' + airport(p.d).city}
            </T>
          </View>
        </Gradient>
      ) : null}

      <View style={{ backgroundColor: mix(c.good, 14, c.surface), borderWidth: 1, borderColor: mix(c.good, 40, c.line), borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14 }}>
        <T size={0.7188} weight={600} color={c.inkSoft}>
          {fmtDate(new Date(p.date + 'T00:00:00')) + ' · ' + s.passengers + ' passenger' + (s.passengers > 1 ? 's' : '') + ' to ' + airport(p.d).city}
        </T>
        <T size={0.7188} color={c.inkFaint} style={{ marginTop: 4 }}>
          {'Fares on ' + p.o + ' → ' + p.d + ' have stayed within a similar range over the last few weeks.'}
        </T>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        {s.dateChips.map((chip) => {
          const now = chip.iso === p.date;
          const disabled = chip.price === null;
          return (
            <Pressable
              key={chip.iso}
              disabled={disabled || now}
              accessibilityRole="button"
              accessibilityState={{ disabled, selected: now }}
              onPress={() => pickDate(chip.iso)}
              style={{
                flex: 1,
                alignItems: 'center',
                borderWidth: 1,
                borderRadius: 12,
                paddingVertical: 8,
                paddingHorizontal: 6,
                borderColor: now && !disabled ? c.primary : c.line,
                backgroundColor: disabled ? c.surfaceAlt : now ? mix(c.primary, 8, c.surface) : c.surface,
                opacity: disabled ? 0.45 : 1,
              }}>
              <T size={0.6562} weight={600} color={c.inkFaint}>
                {fmtDate(new Date(chip.iso + 'T00:00:00'))}
              </T>
              <T size={0.7812} weight={700} style={{ marginTop: 2 }}>
                {disabled ? 'Unavailable' : 'from ' + fmtPrice(chip.price!)}
              </T>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 14, paddingBottom: 4 }}>
        <View style={{ flexGrow: 1, flexBasis: 150, gap: 5 }}>
          <FieldLabel>Stops</FieldLabel>
          <SelectInput
            label="Stops"
            value={stops}
            onChange={setStops}
            options={[
              { value: 'any', label: 'Any number of stops' },
              { value: 'nonstop', label: 'Nonstop only' },
              { value: 'onestop', label: '1 stop only' },
            ]}
          />
        </View>
        <View style={{ flexGrow: 1, flexBasis: 150, gap: 5 }}>
          <FieldLabel>Departure time</FieldLabel>
          <SelectInput
            label="Departure time"
            value={time}
            onChange={setTime}
            options={[
              { value: 'any', label: 'Any time' },
              { value: 'morning', label: 'Morning · before 12 PM' },
              { value: 'afternoon', label: 'Afternoon · 12–5 PM' },
              { value: 'evening', label: 'Evening · after 5 PM' },
            ]}
          />
        </View>
        <View style={{ flexGrow: 1, flexBasis: 150, gap: 5 }}>
          <FieldLabel>Sort by</FieldLabel>
          <SelectInput
            label="Sort by"
            value={sort}
            onChange={setSort}
            options={[
              { value: 'best', label: 'Best' },
              { value: 'price', label: 'Cheapest' },
              { value: 'duration', label: 'Fastest' },
              { value: 'depart', label: 'Earliest' },
            ]}
          />
        </View>
      </View>

      <View style={{ marginTop: 10, marginBottom: 4 }}>
        <RangeInput label="Maximum price" min={min} max={max} value={cap} onChange={setCap} />
        <T size={0.75} color={c.inkFaint}>
          {'up to ' + fmtPrice(cap)}
        </T>
      </View>

      <View style={{ gap: 12, marginTop: 12 }}>
        {list.length ? (
          list.map((f) => (
            <FlightCard
              key={f.id}
              f={f}
              origin={p.o}
              destination={p.d}
              cheapest={f.id === cheapestId}
              fastest={f.id === fastestId}
              onSelect={() => chooseFlight(f)}
            />
          ))
        ) : (
          <T size={0.8438} color={c.inkFaint} align="center" style={{ paddingVertical: 34 }}>
            No flights match these filters.
          </T>
        )}
      </View>
      <View style={{ height: 1, backgroundColor: alpha(c.line, 0) }} />
    </View>
  );
}
