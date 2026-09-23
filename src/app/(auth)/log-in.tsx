import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Brand } from '@/components/brand';
import { AppText, Button, Field } from '@/components/ui/primitives';
import { Screen } from '@/components/ui/screen';
import { Colors, Spacing } from '@/constants/theme';

export default function LogIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function submit() {
    if (email.indexOf('@') < 1 || password.length < 1) return setError('Enter your email and password.');
    setError('');
    router.replace('/home');
  }

  return (
    <Screen edges={['top', 'bottom']} contentStyle={styles.column}>
      <Brand />
      <View style={styles.head}>
        <AppText variant="title" style={styles.center}>Welcome back</AppText>
        <AppText variant="caption" style={styles.center}>Log in to continue to your account.</AppText>
      </View>
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
      <Field label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry />
      {error ? <AppText style={styles.error}>{error}</AppText> : null}
      <Button label="Log in" onPress={submit} />
      <Button label="Continue as guest" kind="ghost" onPress={() => router.replace('/home')} />
      <Pressable onPress={() => router.replace('/sign-up')} accessibilityRole="link">
        <AppText variant="caption" style={styles.center}>
          New here? <AppText style={styles.link}>Sign up</AppText>
        </AppText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  column: { maxWidth: 420, justifyContent: 'center' },
  head: { gap: Spacing.one, marginBottom: Spacing.two },
  center: { textAlign: 'center' },
  error: { color: Colors.bad, fontWeight: '600' },
  link: { color: Colors.primary, fontWeight: '700' },
});
