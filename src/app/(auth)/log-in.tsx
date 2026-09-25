import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AuthScreen, OrDivider } from '@/components/auth';
import { Button, Field, FormError, Input, T, useColors } from '@/design-system';
import { resetTo, withLoader } from '@/state/nav';
import { loadAccount, setState } from '@/state/store';

export default function LogIn() {
  const c = useColors();
  const [email, setEmail] = useState(() => loadAccount()?.email ?? '');
  const [pw, setPw] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submit() {
    const account = loadAccount();
    if (!account || account.email.toLowerCase() !== email.trim().toLowerCase() || account.password !== pw) {
      return setError('Incorrect email or password.');
    }
    setError(null);
    setState({ currentUser: account });
    resetTo('/home');
  }

  return (
    <AuthScreen title="Welcome back" sub="Log in to continue to your account.">
      <View style={{ gap: 12 }}>
        <Field label="Email">
          <Input accessibilityLabel="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" />
        </Field>
        <Field label="Password">
          <Input accessibilityLabel="Password" value={pw} onChangeText={setPw} placeholder="Your password" secureTextEntry onSubmitEditing={submit} />
        </Field>
        <FormError>{error}</FormError>
        <Button block label="Log in" onPress={submit} style={{ marginTop: 6 }} />
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
        {'New here? '}
        <T size={0.8125} weight={700} color={c.primary} onPress={() => withLoader(() => router.replace('/sign-up'))}>
          Sign up
        </T>
      </T>
    </AuthScreen>
  );
}
