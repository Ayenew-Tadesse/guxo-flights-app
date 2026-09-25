import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AuthScreen, DobInput, OrDivider, PasswordMeter } from '@/components/auth';
import { Button, Field, FormError, Input, T, useColors } from '@/design-system';
import { parseDobDigits } from '@/data/flights';
import { resetTo, withLoader } from '@/state/nav';
import { saveAccount, saveTraveler, setState } from '@/state/store';

export default function SignUp() {
  const c = useColors();
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [dob, setDob] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (!first.trim() || !last.trim()) return setError('Enter your first and last name.');
    const d = parseDobDigits(dob);
    if (d.error) return setError(d.error);
    if (street.trim().length < 2 || !city.trim()) return setError('Enter your street address and city.');
    if (email.trim().indexOf('@') < 1) return setError('Enter a valid email address.');
    if (pw.length < 6) return setError('Choose a password with at least 6 characters.');
    if (pw !== pw2) return setError('Passwords do not match.');
    setError(null);
    const name = first.trim() + ' ' + last.trim();
    saveAccount({ firstName: first.trim(), lastName: last.trim(), name, dob: d.value!, street: street.trim(), city: city.trim(), email: email.trim(), password: pw });
    saveTraveler(name, email.trim());
    resetTo('/home');
  }

  return (
    <AuthScreen title="Create your account" sub="Sign up to search, book, and manage your Ethiopian domestic flights.">
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Field label="First name" style={{ flex: 1 }}>
            <Input accessibilityLabel="First name" value={first} onChangeText={setFirst} placeholder="First name" autoComplete="given-name" />
          </Field>
          <Field label="Last name" style={{ flex: 1 }}>
            <Input accessibilityLabel="Last name" value={last} onChangeText={setLast} placeholder="Last name" autoComplete="family-name" />
          </Field>
        </View>
        <Field label="Date of birth">
          <DobInput label="Date of birth" digits={dob} onDigits={setDob} />
          <T size={0.6875} color={c.inkFaint}>
            Type month, day, then year
          </T>
        </Field>
        <Field label="Street address">
          <Input accessibilityLabel="Street address" value={street} onChangeText={setStreet} placeholder="e.g. Bole Road 14" />
        </Field>
        <Field label="City">
          <Input accessibilityLabel="City" value={city} onChangeText={setCity} placeholder="e.g. Addis Ababa" />
        </Field>
        <Field label="Email address">
          <Input accessibilityLabel="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" />
        </Field>
        <Field label="Password">
          <Input accessibilityLabel="Password" value={pw} onChangeText={setPw} placeholder="Create a password" secureTextEntry />
          <PasswordMeter password={pw} />
        </Field>
        <Field label="Confirm password">
          <Input accessibilityLabel="Confirm password" value={pw2} onChangeText={setPw2} placeholder="Re-enter your password" secureTextEntry />
        </Field>
        <FormError>{error}</FormError>
        <Button block label="Sign up" onPress={submit} style={{ marginTop: 6 }} />
      </View>
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
      <T size={0.8125} color={c.inkSoft} align="center" style={{ marginTop: 18 }}>
        {'Already have an account? '}
        <T size={0.8125} weight={700} color={c.primary} onPress={() => withLoader(() => router.replace('/log-in'))}>
          Log in
        </T>
      </T>
    </AuthScreen>
  );
}
