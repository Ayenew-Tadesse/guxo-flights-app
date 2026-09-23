import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Brand } from '@/components/brand';
import { Button, Screen, Text, TextField } from '@/design-system';
import { Colors, Spacing } from '@/constants/theme';

export default function SignUp() {
  const router = useRouter();
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function submit() {
    if (!first.trim() || !last.trim()) return setError('Enter your first and last name.');
    if (email.indexOf('@') < 1) return setError('Enter a valid email address.');
    if (password.length < 6) return setError('Choose a password with at least 6 characters.');
    setError('');
    router.replace('/home');
  }

  return (
    <Screen edges={['top', 'bottom']} contentStyle={styles.column}>
      <Brand />
      <View style={styles.head}>
        <Text variant="display" style={styles.center}>Create your account</Text>
        <Text variant="caption" style={styles.center}>
          Sign up to search, book, and manage your Ethiopian domestic flights.
        </Text>
      </View>
      <View style={styles.row}>
        <View style={styles.flex}><TextField label="First name" value={first} onChangeText={setFirst} placeholder="First name" /></View>
        <View style={styles.flex}><TextField label="Last name" value={last} onChangeText={setLast} placeholder="Last name" /></View>
      </View>
      <TextField label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
      <TextField label="Password" value={password} onChangeText={setPassword} placeholder="Create a password" secureTextEntry />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label="Sign up" onPress={submit} />
      <Button label="Continue as guest" kind="ghost" onPress={() => router.replace('/home')} />
      <Pressable onPress={() => router.replace('/log-in')} accessibilityRole="link">
        <Text variant="caption" style={styles.center}>
          Already have an account? <Text style={styles.link}>Log in</Text>
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  column: { maxWidth: 420, justifyContent: 'center' },
  head: { gap: Spacing.one, marginBottom: Spacing.two },
  center: { textAlign: 'center' },
  row: { flexDirection: 'row', gap: Spacing.two },
  flex: { flex: 1 },
  error: { color: Colors.bad, fontWeight: '600' },
  link: { color: Colors.primary, fontWeight: '700' },
});
