import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextProps,
  type ViewStyle,
} from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

type Variant = 'title' | 'heading' | 'body' | 'label' | 'caption';

export function AppText({ variant = 'body', style, ...props }: TextProps & { variant?: Variant }) {
  return <Text {...props} style={[textStyles[variant], style]} />;
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'ghost';
  disabled?: boolean;
};

export function Button({ label, onPress, kind = 'primary', disabled }: ButtonProps) {
  const primary = kind === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.buttonPrimary : styles.buttonGhost,
        (pressed || disabled) && { opacity: disabled ? 0.45 : 0.85 },
      ]}>
      <Text style={[styles.buttonLabel, { color: primary ? Colors.onPrimary : Colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      <TextInput placeholderTextColor={Colors.inkFaint} {...props} style={styles.input} />
    </View>
  );
}

type ChoiceProps = { label: string; selected: boolean; onPress: () => void; detail?: string };

/** Selectable pill used for airports, fare tiers and payment methods. */
export function Choice({ label, selected, onPress, detail }: ChoiceProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.choice, selected && styles.choiceSelected]}>
      <Text style={[styles.choiceLabel, selected && { color: Colors.primary }]}>{label}</Text>
      {detail ? <Text style={styles.choiceDetail}>{detail}</Text> : null}
    </Pressable>
  );
}

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText variant="caption">{label}</AppText>
      <AppText style={{ fontWeight: '600' }}>{value}</AppText>
    </View>
  );
}

const textStyles = StyleSheet.create({
  title: { fontSize: 30, fontWeight: '800', color: Colors.ink, letterSpacing: -0.3 },
  heading: { fontSize: 18, fontWeight: '700', color: Colors.ink },
  body: { fontSize: 15, color: Colors.ink, lineHeight: 21 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  caption: { fontSize: 13, color: Colors.inkSoft },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.large,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  button: {
    borderRadius: Radius.medium,
    paddingVertical: 14,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: { backgroundColor: Colors.primary },
  buttonGhost: { backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: Colors.line },
  buttonLabel: { fontSize: 15, fontWeight: '700' },
  field: { gap: Spacing.one },
  input: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.medium,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.ink,
  },
  choice: {
    borderWidth: 1.5,
    borderColor: Colors.line,
    backgroundColor: Colors.surface,
    borderRadius: Radius.medium,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 2,
  },
  choiceSelected: { borderColor: Colors.primary, backgroundColor: '#EEF1FF' },
  choiceLabel: { fontSize: 14, fontWeight: '700', color: Colors.ink },
  choiceDetail: { fontSize: 12, color: Colors.inkFaint },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.three },
});
