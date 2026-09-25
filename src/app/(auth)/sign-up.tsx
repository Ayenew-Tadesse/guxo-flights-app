import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AuthScreen, DobInput, OrDivider, PasswordMeter } from '@/components/auth';
import { Button, Field, FormError, Gradient, IconButton, Input, ScreenIn, T, useColors } from '@/design-system';
import { parseDobDigits } from '@/data/flights';
import { resetTo, withLoader } from '@/state/nav';
import { saveAccount, saveTraveler, setState } from '@/state/store';

const STEPS = [
  { title: "What's your name?", sub: "Let's start with the basics." },
  { title: 'Where do you live?', sub: 'We use your address for bookings and receipts.' },
  { title: 'How can we reach you?', sub: "You'll use this to log in and get trip updates." },
  { title: 'Create a password', sub: 'Almost done — keep your account safe.' },
];

const validPhone = (v: string) => {
  const d = v.replace(/\D/g, '');
  return d.length >= 9 && d.length <= 12 && !/[^\d\s+]/.test(v);
};

/** Sign up one step per page: name, address, email or phone, password. */
export default function SignUp() {
  const c = useColors();
  const [step, setStep] = useState(1);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [dob, setDob] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [contact, setContact] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState<string | null>(null);

  function check(n: number) {
    if (n === 1) {
      if (!first.trim() || !last.trim()) return 'Enter your first and last name.';
      const d = parseDobDigits(dob);
      if (d.error) return d.error;
    }
    if (n === 2 && (street.trim().length < 2 || !city.trim())) return 'Enter your street address and city.';
    if (n === 3) {
      if (contact === 'email' && email.trim().indexOf('@') < 1) return 'Enter a valid email address.';
      if (contact === 'phone' && !validPhone(phone.trim())) return 'Enter a valid phone number, e.g. 0911 234 567.';
    }
    if (n === 4) {
      if (pw.length < 6) return 'Choose a password with at least 6 characters.';
      if (pw !== pw2) return 'Passwords do not match.';
    }
    return null;
  }

  function go(n: number) {
    setError(null);
    setStep(n);
  }

  function next() {
    const msg = check(step);
    if (msg) return setError(msg);
    if (step < STEPS.length) return go(step + 1);
    const name = first.trim() + ' ' + last.trim();
    const mail = contact === 'email' ? email.trim() : '';
    saveAccount({
      firstName: first.trim(),
      lastName: last.trim(),
      name,
      dob: parseDobDigits(dob).value!,
      street: street.trim(),
      city: city.trim(),
      email: mail,
      phone: contact === 'phone' ? phone.trim() : '',
      password: pw,
    });
    saveTraveler(name, mail);
    resetTo('/home');
  }

  const header = (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18, minHeight: 34 }}>
        {step > 1 ? <IconButton icon="back" label="Previous step" variant="surface" onPress={() => go(step - 1)} /> : null}
        <View style={{ flex: 1, flexDirection: 'row', gap: 5 }} accessibilityLabel={`Step ${step} of ${STEPS.length}`}>
          {STEPS.map((_, i) =>
            i < step ? (
              <Gradient key={i} style={{ flex: 1, height: 5, borderRadius: 3 }} />
            ) : (
              <View key={i} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: c.line }} />
            ),
          )}
        </View>
      </View>
      <T size={0.6875} weight={700} upper ls={0.06} color={c.primary} align="center" style={{ marginBottom: 6 }}>
        {`Step ${step} of ${STEPS.length}`}
      </T>
    </View>
  );

  return (
    <AuthScreen title={STEPS[step - 1].title} sub={STEPS[step - 1].sub} header={header}>
      {/* Keyed by step so each page slides in like the prototype. */}
      <ScreenIn key={step} style={{ flexGrow: 0, flexShrink: 0, flexBasis: 'auto' }}>
        <View style={{ gap: 12 }}>
          {step === 1 ? (
            <>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Field label="First name" style={{ flex: 1 }}>
                  <Input accessibilityLabel="First name" value={first} onChangeText={setFirst} placeholder="First name" autoComplete="given-name" autoFocus onSubmitEditing={next} />
                </Field>
                <Field label="Last name" style={{ flex: 1 }}>
                  <Input accessibilityLabel="Last name" value={last} onChangeText={setLast} placeholder="Last name" autoComplete="family-name" onSubmitEditing={next} />
                </Field>
              </View>
              <Field label="Date of birth">
                <DobInput label="Date of birth" digits={dob} onDigits={setDob} onSubmit={next} />
                <T size={0.6875} color={c.inkFaint}>
                  Type month, day, then year
                </T>
              </Field>
            </>
          ) : null}
          {step === 2 ? (
            <>
              <Field label="Street address">
                <Input accessibilityLabel="Street address" value={street} onChangeText={setStreet} placeholder="e.g. Bole Road 14" autoFocus onSubmitEditing={next} />
              </Field>
              <Field label="City">
                <Input accessibilityLabel="City" value={city} onChangeText={setCity} placeholder="e.g. Addis Ababa" onSubmitEditing={next} />
              </Field>
            </>
          ) : null}
          {step === 3 ? (
            <>
              <View style={{ flexDirection: 'row', gap: 4, backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: c.line, borderRadius: 13, padding: 4 }}>
                {(['email', 'phone'] as const).map((k) => {
                  const on = contact === k;
                  return (
                    <Pressable
                      key={k}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: on }}
                      onPress={() => {
                        setContact(k);
                        setError(null);
                      }}
                      style={[{ flex: 1, alignItems: 'center', borderRadius: 10, paddingVertical: 9, paddingHorizontal: 8 }, on ? { backgroundColor: c.surface, boxShadow: '0px 1px 2px rgba(9,21,64,0.08), 0px 2px 6px rgba(9,21,64,0.06)' } : null]}>
                      <T size={0.8125} weight={700} color={on ? c.primary : c.inkSoft}>
                        {k === 'email' ? 'Email' : 'Phone number'}
                      </T>
                    </Pressable>
                  );
                })}
              </View>
              {contact === 'email' ? (
                <Field label="Email address">
                  <Input key="email" accessibilityLabel="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" autoComplete="email" autoFocus onSubmitEditing={next} />
                </Field>
              ) : (
                <Field label="Phone number">
                  <Input key="phone" accessibilityLabel="Phone number" value={phone} onChangeText={setPhone} placeholder="09xx xxx xxx" inputMode="tel" autoComplete="tel" maxLength={13} autoFocus onSubmitEditing={next} />
                </Field>
              )}
            </>
          ) : null}
          {step === 4 ? (
            <>
              <Field label="Password">
                <Input accessibilityLabel="Password" value={pw} onChangeText={setPw} placeholder="Create a password" secureTextEntry autoComplete="new-password" autoFocus onSubmitEditing={next} />
                <PasswordMeter password={pw} />
              </Field>
              <Field label="Confirm password">
                <Input accessibilityLabel="Confirm password" value={pw2} onChangeText={setPw2} placeholder="Re-enter your password" secureTextEntry autoComplete="new-password" onSubmitEditing={next} />
              </Field>
              <T size={0.75} color={c.inkSoft} align="center" style={{ marginTop: 2 }}>
                {'Signing up as ' + first.trim() + ' · ' + (contact === 'email' ? email.trim() : phone.trim())}
              </T>
            </>
          ) : null}
          <FormError>{error}</FormError>
          <Button block label={step === STEPS.length ? 'Create account' : 'Continue'} onPress={next} style={{ marginTop: 6 }} />
        </View>
      </ScreenIn>
      {step === 1 ? (
        <>
          <OrDivider />
          <Button
            block
            kind="ghost"
            label="Continue as guest"
            onPress={() => {
              setState({ currentUser: null });
              resetTo('/home');
            }}
          />
        </>
      ) : null}
      <T size={0.8125} color={c.inkSoft} align="center" style={{ marginTop: 18 }}>
        {'Already have an account? '}
        <T size={0.8125} weight={700} color={c.primary} onPress={() => withLoader(() => router.replace('/log-in'))}>
          Log in
        </T>
      </T>
    </AuthScreen>
  );
}
