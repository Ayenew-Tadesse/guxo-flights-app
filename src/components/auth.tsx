import { useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Heading, Input, Logo, ScreenIn, T, payColors, useColors } from '@/design-system';
import { passwordStrength } from '@/data/flights';

/** Centered auth column: logo, title, subtitle, form. */
export function AuthScreen({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.frame }}>
      <ScreenIn>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32, paddingHorizontal: 18 }}>
          <View style={{ width: '100%', maxWidth: 380, alignSelf: 'center' }}>
            <View style={{ alignItems: 'center', marginBottom: 28 }}>
              <Logo />
            </View>
            <Heading size={1.5} align="center">
              {title}
            </Heading>
            <T size={0.8438} color={c.inkFaint} align="center" style={{ marginTop: 6, marginBottom: 26 }}>
              {sub}
            </T>
            {children}
          </View>
        </ScrollView>
      </ScreenIn>
    </View>
  );
}

/** "or" divider between the form and Continue as guest. */
export function OrDivider() {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18, marginBottom: 12 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
      <T size={0.75} color={c.inkFaint}>
        or
      </T>
      <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
    </View>
  );
}

const MASK = 'mm/dd/yyyy';
const slotPos = (n: number) => (n < 2 ? n : n < 4 ? n + 1 : n + 2);

/**
 * Date of birth as a fixed mm/dd/yyyy mask filled strictly left to right:
 * digits land in the next empty slot and Backspace removes the last one.
 */
export function DobInput({ digits, onDigits, label }: { digits: string; onDigits: (d: string) => void; label: string }) {
  const [focused, setFocused] = useState(false);
  let display = '';
  if (digits || focused) {
    let d = 0;
    for (const ch of MASK) display += ch === '/' ? '/' : d < digits.length ? digits.charAt(d++) : ch;
  }
  const pos = digits.length >= 8 ? MASK.length : slotPos(digits.length);
  return (
    <Input
      accessibilityLabel={label}
      value={display}
      placeholder="mm/dd/yyyy"
      inputMode="numeric"
      keyboardType="number-pad"
      autoComplete="birthdate-full"
      selection={focused ? { start: pos, end: pos } : undefined}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ fontVariant: ['tabular-nums'], letterSpacing: 0.6 }}
      onChangeText={(text) => {
        if (text.length < display.length) onDigits(digits.slice(0, -1));
        else onDigits(text.replace(/\D/g, '').slice(0, 8));
      }}
    />
  );
}

export function PasswordMeter({ password }: { password: string }) {
  const c = useColors();
  const level = passwordStrength(password);
  const color = level === 'weak' ? c.bad : level === 'medium' ? payColors.mcYellow : c.good;
  const filled = level === 'weak' ? 1 : level === 'medium' ? 2 : level === 'strong' ? 3 : 0;
  return (
    <View style={{ marginTop: 7 }}>
      <View style={{ flexDirection: 'row', gap: 4, height: 5 }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ flex: 1, borderRadius: 3, backgroundColor: i < filled ? color : c.line }} />
        ))}
      </View>
      <T size={0.6875} weight={700} color={level === 'medium' ? '#8A6A1E' : color} style={{ marginTop: 5, minHeight: 11 }}>
        {level ? level.charAt(0).toUpperCase() + level.slice(1) : ''}
      </T>
    </View>
  );
}
