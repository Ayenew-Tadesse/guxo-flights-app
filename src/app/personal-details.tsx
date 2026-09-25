import { Redirect } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { DobInput } from '@/components/auth';
import { CompleteCard } from '@/components/ui';
import { Button, Field, FormError, Input, Screen, T, TopBar, useColors } from '@/design-system';
import { parseDobDigits } from '@/data/flights';
import { goBack } from '@/state/nav';
import { PROFILE_BONUS, addPoints, profileCompletion, saveTraveler, showToast, updateAccount, useApp } from '@/state/store';

const isoToDigits = (iso: string) => (iso ? iso.slice(5, 7) + iso.slice(8, 10) + iso.slice(0, 4) : '');

export default function PersonalDetails() {
  const c = useColors();
  const s = useApp();
  const a = s.currentUser;
  const [first, setFirst] = useState(a?.firstName ?? '');
  const [last, setLast] = useState(a?.lastName ?? '');
  const [email, setEmail] = useState(a?.email ?? '');
  const [phone, setPhone] = useState(a?.phone ?? '');
  const [dob, setDob] = useState(isoToDigits(a?.dob ?? ''));
  const [street, setStreet] = useState(a?.street ?? '');
  const [city, setCity] = useState(a?.city ?? '');
  const [error, setError] = useState<string | null>(null);
  if (!a) return <Redirect href="/sign-up" />;

  const draft = { firstName: first, lastName: last, email, phone, dob: dob ? (parseDobDigits(dob).value ?? 'x') : '', street, city };

  function save() {
    if (!first.trim() || !last.trim()) return setError('Enter your first and last name.');
    if (!email.trim() && !phone.trim()) return setError('Add an email address or a phone number so you can log in.');
    if (email.trim() && email.trim().indexOf('@') < 1) return setError('Enter a valid email address.');
    const digits = phone.replace(/\D/g, '');
    if (phone.trim() && (digits.length < 9 || digits.length > 12 || /[^\d\s+]/.test(phone.trim()))) return setError('Enter a valid phone number, e.g. 0911 234 567.');
    let iso = '';
    if (dob) {
      const r = parseDobDigits(dob);
      if (r.error) return setError(r.error);
      iso = r.value!;
    }
    setError(null);
    const name = first.trim() + ' ' + last.trim();
    updateAccount((acc) => {
      acc.firstName = first.trim();
      acc.lastName = last.trim();
      acc.name = name;
      acc.email = email.trim();
      acc.phone = phone.trim();
      acc.dob = iso;
      acc.street = street.trim();
      acc.city = city.trim();
    });
    saveTraveler(name, email.trim());
    const complete = profileCompletion({ ...draft, dob: iso }).pct === 100;
    const bonus = complete ? addPoints(PROFILE_BONUS, 'Completed your profile', 'bonus', 'profile-bonus') : 0;
    showToast(bonus ? 'Profile saved · +' + PROFILE_BONUS + ' points' : 'Profile saved');
    goBack();
  }

  return (
    <Screen top={<TopBar title="Personal details" onBack={goBack} />}>
      <CompleteCard account={draft} />
      <View style={{ gap: 12, marginTop: 8 }}>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
          <Field label="First name" style={{ flex: 1 }}>
            <Input accessibilityLabel="First name" value={first} onChangeText={setFirst} placeholder="First name" />
          </Field>
          <Field label="Last name" style={{ flex: 1 }}>
            <Input accessibilityLabel="Last name" value={last} onChangeText={setLast} placeholder="Last name" />
          </Field>
        </View>
        <Field label="Email address">
          <Input accessibilityLabel="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" />
        </Field>
        <Field label="Phone number">
          <Input accessibilityLabel="Phone number" value={phone} onChangeText={setPhone} placeholder="09xx xxx xxx" inputMode="tel" maxLength={13} />
        </Field>
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
        <FormError>{error}</FormError>
        <Button block label="Save changes" onPress={save} />
      </View>
    </Screen>
  );
}
