import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps, ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  View,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useBrand } from './theme';
import { maxContentWidth, radius, spacing, type, type TypeRole } from './tokens';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

// ---------- Text ----------

type TextTone = 'ink' | 'soft' | 'faint' | 'primary' | 'onPrimary' | 'bad' | 'good';

export function Text({
  variant = 'body',
  tone,
  style,
  ...props
}: TextProps & { variant?: TypeRole; tone?: TextTone }) {
  const { colors } = useBrand();
  const defaultTone: TextTone = variant === 'label' ? 'faint' : variant === 'caption' ? 'soft' : 'ink';
  const color = {
    ink: colors.ink,
    soft: colors.inkSoft,
    faint: colors.inkFaint,
    primary: colors.primary,
    onPrimary: colors.onPrimary,
    bad: colors.bad,
    good: colors.good,
  }[tone ?? defaultTone];
  return <RNText {...props} style={[type[variant] as TextStyle, { color }, style]} />;
}

// ---------- Surfaces ----------

export function Card({ children, style, tone = 'surface' }: { children: ReactNode; style?: ViewStyle; tone?: 'surface' | 'primary' }) {
  const { colors } = useBrand();
  const bg = tone === 'primary' ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: colors.surface, borderColor: colors.line };
  return <View style={[styles.card, bg, style]}>{children}</View>;
}

type ScreenProps = { children: ReactNode; scroll?: boolean; edges?: Edge[]; contentStyle?: ViewStyle };

/** Page wrapper: brand background, safe areas and a centred max-width column. */
export function Screen({ children, scroll = true, edges = ['top'], contentStyle }: ScreenProps) {
  const { colors } = useBrand();
  const inner = <View style={[styles.column, contentStyle]}>{children}</View>;
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={edges}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.grow} keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

// ---------- Actions ----------

type ButtonProps = {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'ghost' | 'danger';
  size?: 'regular' | 'small';
  icon?: IconName;
  disabled?: boolean;
};

export function Button({ label, onPress, kind = 'primary', size = 'regular', icon, disabled }: ButtonProps) {
  const { colors } = useBrand();
  const look = {
    primary: { bg: colors.primary, border: colors.primary, fg: colors.onPrimary },
    ghost: { bg: colors.surfaceAlt, border: colors.line, fg: colors.ink },
    danger: { bg: colors.surface, border: colors.bad, fg: colors.bad },
  }[kind];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        size === 'small' && styles.buttonSmall,
        { backgroundColor: look.bg, borderColor: look.border },
        (pressed || disabled) && { opacity: disabled ? 0.45 : 0.85 },
      ]}>
      {icon ? <MaterialIcons name={icon} size={size === 'small' ? 16 : 18} color={look.fg} /> : null}
      <RNText style={[styles.buttonLabel, size === 'small' && styles.buttonLabelSmall, { color: look.fg }]}>{label}</RNText>
    </Pressable>
  );
}

export function IconButton({ icon, onPress, label }: { icon: IconName; onPress?: () => void; label: string }) {
  const { colors } = useBrand();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: colors.surfaceAlt, borderColor: colors.line },
        pressed && { opacity: 0.8 },
      ]}>
      <MaterialIcons name={icon} size={20} color={colors.inkSoft} />
    </Pressable>
  );
}

// ---------- Inputs ----------

export function TextField({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  const { colors } = useBrand();
  return (
    <View style={styles.field}>
      <Text variant="label">{label}</Text>
      <TextInput
        placeholderTextColor={colors.inkFaint}
        accessibilityLabel={label}
        {...props}
        style={[
          styles.input,
          { backgroundColor: colors.surfaceAlt, borderColor: error ? colors.bad : colors.line, color: colors.ink },
        ]}
      />
      {error ? <Text variant="caption" tone="bad">{error}</Text> : null}
    </View>
  );
}

type ChoiceProps = { label: string; selected: boolean; onPress: () => void; detail?: string };

/** Selectable option: airports, fare tiers, payment methods, filters. */
export function Choice({ label, selected, onPress, detail }: ChoiceProps) {
  const { colors } = useBrand();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.choice,
        { borderColor: selected ? colors.primary : colors.line, backgroundColor: selected ? colors.primaryTint : colors.surface },
      ]}>
      <RNText style={[styles.choiceLabel, { color: selected ? colors.primary : colors.ink }]}>{label}</RNText>
      {detail ? <RNText style={[styles.choiceDetail, { color: colors.inkFaint }]}>{detail}</RNText> : null}
    </Pressable>
  );
}

// ---------- Display ----------

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text variant="caption">{label}</Text>
      <Text variant="bodyStrong">{value}</Text>
    </View>
  );
}

export function Badge({ label, tone = 'primary' }: { label: string; tone?: 'primary' | 'good' | 'bad' | 'neutral' }) {
  const { colors } = useBrand();
  const look = {
    primary: { bg: colors.primaryTint, fg: colors.primary },
    good: { bg: '#E3F4EA', fg: colors.good },
    bad: { bg: '#F8E4E4', fg: colors.bad },
    neutral: { bg: colors.surfaceAlt, fg: colors.inkSoft },
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: look.bg }]}>
      <RNText style={[styles.badgeLabel, { color: look.fg }]}>{label}</RNText>
    </View>
  );
}

export function Divider() {
  const { colors } = useBrand();
  return <View style={{ height: 1, backgroundColor: colors.line }} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  grow: { flexGrow: 1 },
  column: {
    flexGrow: 1,
    width: '100%',
    maxWidth: maxContentWidth,
    alignSelf: 'center',
    padding: spacing.three,
    gap: spacing.three,
  },
  card: { borderRadius: radius.large, borderWidth: 1, padding: spacing.three, gap: spacing.three },
  button: {
    flexDirection: 'row',
    gap: spacing.two,
    borderRadius: radius.medium,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSmall: { paddingVertical: 9, paddingHorizontal: spacing.three, borderRadius: radius.small },
  buttonLabel: { fontSize: 15, fontWeight: '700' },
  buttonLabelSmall: { fontSize: 13 },
  iconButton: { width: 36, height: 36, borderRadius: radius.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  field: { gap: spacing.one },
  input: { borderWidth: 1, borderRadius: radius.medium, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15 },
  choice: { borderWidth: 1.5, borderRadius: radius.medium, paddingVertical: 10, paddingHorizontal: 14, gap: 2 },
  choiceLabel: { fontSize: 14, fontWeight: '700' },
  choiceDetail: { fontSize: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.three },
  badge: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingVertical: 3, paddingHorizontal: 10 },
  badgeLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
});
