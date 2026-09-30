import { router } from 'expo-router';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Button, Icon, T, mix, useColors } from '@/design-system';
import { airport, fmtDate } from '@/data/flights';
import { clearDraft, hasDraft, useBooking, type BookingStep } from '@/state/booking';
import { withLoader } from '@/state/nav';

const NEXT: Record<BookingStep, string> = {
  results: 'Choose your flight',
  fare: 'Fare, seats & travellers',
  payment: 'Payment',
};

/** Reopen the booking at the step you left, with the steps before it underneath for Back. */
function resume(step: BookingStep) {
  withLoader(() => {
    router.push('/results');
    if (step !== 'results') router.push('/fare');
    if (step === 'payment') router.push('/payment');
  });
}

/** "Continue your booking": shown on Home and Book while a booking is unfinished. */
export function ResumeBooking({ style }: { style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  const s = useBooking();
  if (!hasDraft(s) || !s.step) return null;
  const step = s.step;
  const round = s.tripType === 'round';
  const when = fmtDate(new Date(s.departDate + 'T00:00:00')) + (round && s.returnDate ? ' – ' + fmtDate(new Date(s.returnDate + 'T00:00:00')) : '');
  return (
    <View
      accessibilityLabel="Continue your booking"
      style={[{ backgroundColor: c.surface, borderWidth: 1, borderColor: mix(c.primary, 30, c.line), borderRadius: 20, padding: 16, gap: 12, marginBottom: 12 }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: mix(c.primary, 12, c.surface), alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="plane" size={18} color={c.primary} strokeWidth={2} />
        </View>
        <View style={{ flex: 1 }}>
          <T size={0.6875} weight={700} color={c.primary} upper ls={0.05}>
            Continue your booking
          </T>
          <T size={0.9375} weight={800} style={{ marginTop: 2 }}>
            {airport(s.origin).city + (round ? ' ⇄ ' : ' → ') + airport(s.destination).city}
          </T>
          <T size={0.75} color={c.inkSoft} style={{ marginTop: 2 }}>
            {when + ' · ' + s.passengers + ' traveller' + (s.passengers > 1 ? 's' : '') + ' · Next: ' + NEXT[step]}
          </T>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button small label="Continue" onPress={() => resume(step)} style={{ flex: 1 }} />
        <Button small kind="ghost" label="Start over" onPress={clearDraft} style={{ flex: 1 }} />
      </View>
    </View>
  );
}
