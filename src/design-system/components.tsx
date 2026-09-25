import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState, type ReactNode, type Ref } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { alpha, mix } from './color';
import { Icon, type IconName } from './icons';
import { useColors, useLayout } from './theme';
import { fonts, radius, shadow, type Weight } from './tokens';

/* ------------------------------------------------------------------ text */

type TProps = {
  children: ReactNode;
  /** Size in prototype rems; scales with the responsive tier. */
  size?: number;
  /** Fixed pixel size (for the prototypes' px-sized text). */
  px?: number;
  weight?: Weight;
  color?: string;
  align?: TextStyle['textAlign'];
  /** Letter spacing in em. */
  ls?: number;
  upper?: boolean;
  /** Line height as a multiple of the font size. */
  lh?: number;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
  /** Makes the text a link-style button. */
  onPress?: () => void;
};

/** Poppins text. Default matches the prototypes' body: 14px, regular, ink. */
export function T({ children, size, px, weight = 400, color, align, ls, upper, lh, numberOfLines, style, onPress }: TProps) {
  const c = useColors();
  const { rem } = useLayout();
  const fontSize = px ?? (size ? rem(size) : 14);
  return (
    <Text
      numberOfLines={numberOfLines}
      onPress={onPress}
      accessibilityRole={onPress ? 'link' : undefined}
      style={[
        {
          fontFamily: fonts[weight],
          fontSize,
          color: color ?? c.ink,
          textAlign: align,
          letterSpacing: ls ? ls * fontSize : undefined,
          textTransform: upper ? 'uppercase' : undefined,
          lineHeight: lh ? lh * fontSize : undefined,
        },
        style,
      ]}>
      {children}
    </Text>
  );
}

/** Headline (h1/h2/h3): 1.14 line height, slightly tight tracking. */
export function Heading({ size, weight = 700, color, align, style, children }: Omit<TProps, 'lh' | 'ls'>) {
  return (
    <T size={size} weight={weight} color={color} align={align} lh={1.14} ls={-0.01} style={style}>
      {children}
    </T>
  );
}

/* -------------------------------------------------------------- surfaces */

/** The brand's 135° primary gradient. */
export function Gradient({ style, children, from, to }: { style?: StyleProp<ViewStyle>; children?: ReactNode; from?: string; to?: string }) {
  const c = useColors();
  return (
    <LinearGradient colors={[from ?? c.primary, to ?? c.primary2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={style}>
      {children}
    </LinearGradient>
  );
}

/** White card with the prototypes' border and shadow. */
export function Card({ style, children }: { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const c = useColors();
  return (
    <View
      style={[
        { backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: radius.card, padding: 14, boxShadow: shadow },
        style,
      ]}>
      {children}
    </View>
  );
}

/** Tinted inset box (itinerary, price breakdown, payment status). */
export function Inset({ style, children }: { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const c = useColors();
  return <View style={[{ backgroundColor: c.surfaceAlt, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14 }, style]}>{children}</View>;
}

/** Label / value row inside an Inset. */
export function InsetRow({ label, value, children }: { label: string; value?: string; children?: ReactNode }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, paddingVertical: 4 }}>
      <T size={0.7812} color={c.inkFaint}>{label}</T>
      {children ?? <T size={0.7812} style={{ flexShrink: 1, textAlign: 'right' }}>{value}</T>}
    </View>
  );
}

/* --------------------------------------------------------------- buttons */

type ButtonKind = 'primary' | 'ghost' | 'danger' | 'tint';

export function Button({
  label,
  onPress,
  kind = 'primary',
  small,
  block,
  icon,
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  kind?: ButtonKind;
  small?: boolean;
  block?: boolean;
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  const { atLeast } = useLayout();
  // The prototypes' wider tiers pad every button (small ones too) more.
  const [py, px] = atLeast(1440) ? [16, 30] : atLeast(1024) ? [15, 28] : atLeast(600) ? [14, 24] : small ? [10, 14] : [13, 18];
  const palette = {
    primary: { bg: 'transparent', border: 'transparent', fg: c.primaryInk },
    ghost: { bg: c.surfaceAlt, border: c.line, fg: c.ink },
    danger: { bg: mix(c.bad, 12, c.surface), border: mix(c.bad, 35, c.line), fg: c.bad },
    tint: { bg: mix(c.primary, 12, c.surface), border: mix(c.primary, 30, c.line), fg: c.primary },
  }[kind];
  const inner = (
    <>
      {icon ? <Icon name={icon} size={16} color={palette.fg} strokeWidth={2} /> : null}
      <T size={small ? 0.8125 : 0.9062} weight={700} color={palette.fg}>
        {label}
      </T>
    </>
  );
  const box: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: py,
    paddingHorizontal: px,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.bg,
    overflow: 'hidden',
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        block ? { alignSelf: 'stretch' } : { alignSelf: 'flex-start' },
        { opacity: disabled ? 0.4 : pressed ? 0.85 : 1, borderRadius: radius.button },
        Platform.OS === 'web' ? ({ cursor: disabled ? 'not-allowed' : 'pointer' } as ViewStyle) : null,
        style,
      ]}>
      {kind === 'primary' ? <Gradient style={box}>{inner}</Gradient> : <View style={box}>{inner}</View>}
    </Pressable>
  );
}

/** Round icon button used in top bars (bell, profile, back). */
export function IconButton({
  icon,
  label,
  onPress,
  onHero,
  dot,
  variant = 'alt',
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  onHero?: boolean;
  dot?: boolean;
  variant?: 'alt' | 'surface';
}) {
  const c = useColors();
  const { atLeast } = useLayout();
  const size = atLeast(1024) ? 40 : atLeast(600) ? 37 : 34;
  const isBack = icon === 'back';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: onHero ? 'rgba(255,255,255,0.3)' : c.line,
        backgroundColor: onHero ? 'rgba(255,255,255,0.18)' : variant === 'surface' ? c.surface : c.surfaceAlt,
      }}>
      <Icon name={icon} size={16} color={onHero ? '#fff' : isBack ? c.ink : c.inkSoft} strokeWidth={isBack ? 2.2 : 1.8} />
      {dot ? (
        <View
          style={{
            position: 'absolute',
            top: 6,
            right: 7,
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: c.primary2,
            borderWidth: 1.5,
            borderColor: c.frame,
          }}
        />
      ) : null}
    </Pressable>
  );
}

/* ----------------------------------------------------------------- brand */

export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <Gradient style={{ width: size, height: size, borderRadius: size * 0.3, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="plane" size={size * 0.53} color="#fff" strokeWidth={2} />
    </Gradient>
  );
}

export function Logo({ onHero }: { onHero?: boolean }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <LogoMark />
      <T size={1.0625} weight={800} color={onHero ? '#fff' : c.ink}>
        Guxo Flights
      </T>
    </View>
  );
}

/* ---------------------------------------------------------------- inputs */

/** Uppercase field label. */
export function FieldLabel({ children }: { children: string }) {
  const c = useColors();
  return (
    <T size={0.6875} weight={700} color={c.inkFaint} upper ls={0.06}>
      {children}
    </T>
  );
}

/** Label above a control, with the prototypes' 5px gap. */
export function Field({ label, children, style }: { label: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ gap: 5 }, style]}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </View>
  );
}

/** Shared look for text inputs, selects and date inputs. */
export function useInputStyle(hasIcon: boolean, focused: boolean) {
  const c = useColors();
  const { rem, atLeast } = useLayout();
  const p = atLeast(768) ? 13 : 12;
  return {
    fontFamily: fonts[400],
    fontSize: rem(0.9062),
    color: c.ink,
    backgroundColor: c.surfaceAlt,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.field,
    paddingVertical: p,
    paddingRight: p,
    paddingLeft: hasIcon ? (atLeast(768) ? 38 : 36) : p,
    width: '100%',
    ...(Platform.OS === 'web'
      ? { outlineStyle: focused ? 'solid' : 'none', outlineWidth: 2, outlineColor: c.primary, outlineOffset: 1 }
      : focused
        ? { borderColor: c.primary }
        : null),
  } as TextStyle;
}

export function Input({ icon, style, inputRef, ...props }: TextInputProps & { icon?: IconName; inputRef?: Ref<TextInput> }) {
  const c = useColors();
  const [focused, setFocused] = useState(false);
  // The prototypes indent every text input's text as if it had an icon.
  const inputStyle = useInputStyle(true, focused);
  return (
    <View style={{ position: 'relative', justifyContent: 'center' }}>
      <TextInput
        ref={inputRef}
        placeholderTextColor={c.inkFaint}
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[inputStyle, style]}
      />
      {icon ? (
        <View pointerEvents="none" style={{ position: 'absolute', left: 12 }}>
          <Icon name={icon} size={16} color={c.primary} />
        </View>
      ) : null}
    </View>
  );
}

/** Red form error line. */
export function FormError({ children }: { children: string | null }) {
  const c = useColors();
  if (!children) return null;
  return (
    <T size={0.7812} weight={600} color={c.bad} style={{ marginTop: 8 }}>
      {children}
    </T>
  );
}

/* --------------------------------------------------------------- display */

/** Small uppercase section heading. */
export function SecTitle({ children }: { children: ReactNode }) {
  const c = useColors();
  return (
    <T size={0.8125} weight={700} color={c.inkFaint} upper ls={0.06} style={{ marginTop: 20, marginBottom: 10 }}>
      {children}
    </T>
  );
}

/** Pill badge: status (good / bad) or ribbon (cheap / fast). */
export function Badge({ label, tone }: { label: string; tone: 'good' | 'bad' | 'primary' }) {
  const c = useColors();
  const color = { good: c.good, bad: c.bad, primary: c.primary }[tone];
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: alpha(color, tone === 'primary' ? 0.16 : 0.14), borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: 10 }}>
      <T size={0.6562} weight={700} color={color} upper ls={0.04}>
        {label}
      </T>
    </View>
  );
}

/** Origin dot, dashed track with a plane, destination dot. */
export function RouteDots({ style }: { style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 4, width: '100%' }, style]}>
      <Gradient from="#091540" to={c.primary} style={styles.dot} />
      <View style={{ flex: 1, height: 0, borderTopWidth: 1.6, borderStyle: 'dashed', borderColor: c.lineStrong, alignItems: 'center' }}>
        <View style={{ position: 'absolute', top: -7.5, backgroundColor: 'transparent' }}>
          <Icon name="plane" size={13} color={c.inkFaint} strokeWidth={2} />
        </View>
      </View>
      <Gradient from={c.primary2} to="#ABD2FA" style={styles.dot} />
    </View>
  );
}

/** Rotating ring spinner. */
export function Spinner({ size = 34, color, track }: { size?: number; color?: string; track?: string }) {
  const c = useColors();
  const [spin] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 700, easing: Easing.linear, useNativeDriver: Platform.OS !== 'web' }));
    loop.start();
    return () => loop.stop();
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 3,
        borderColor: track ?? c.lineStrong,
        borderTopColor: color ?? c.primary,
        transform: [{ rotate }],
      }}
    />
  );
}

/** Empty list placeholder with a call to action. */
export function EmptyState({ message, action, onAction }: { message: string; action?: string; onAction?: () => void }) {
  const c = useColors();
  return (
    <View style={{ alignItems: 'center', paddingTop: 60, paddingBottom: 30 }}>
      <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: c.surfaceAlt, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <Icon name="plane" size={22} color={c.inkFaint} strokeWidth={1.6} />
      </View>
      <T size={0.8438} color={c.inkFaint} align="center" style={{ marginBottom: 14 }}>
        {message}
      </T>
      {action ? <Button label={action} onPress={onAction} style={{ alignSelf: 'center' }} /> : null}
    </View>
  );
}

/* ---------------------------------------------------------------- layout */

/** Fades and lifts a screen in, like the prototypes' screenIn keyframes. */
export function ScreenIn({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration: 380,
      easing: Easing.bezier(0.22, 0.61, 0.36, 1),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [t]);
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });
  return <Animated.View style={[{ flex: 1, opacity: t, transform: [{ translateY }] }, style]}>{children}</Animated.View>;
}

/** Top bar: optional back button and title on the left, actions on the right. */
export function TopBar({ title, onBack, right }: { title?: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <View style={styles.topbar}>
      <View style={styles.tbSide}>
        {onBack ? <IconButton icon="back" label="Back" onPress={onBack} variant="surface" /> : null}
        {title ? (
          <T size={1.0625} weight={700} numberOfLines={1} style={{ flexShrink: 1 }}>
            {title}
          </T>
        ) : null}
      </View>
      {right ? <View style={[styles.tbSide, { flexShrink: 0 }]}>{right}</View> : null}
    </View>
  );
}

/**
 * A scrolling screen: safe-area top, the prototypes' side padding, room
 * for the tab bar, and the screen-in animation.
 */
export function Screen({
  children,
  top,
  tabBar,
  padded = true,
  contentStyle,
}: {
  children: ReactNode;
  /** Rendered above the padded content (top bar or hero). */
  top?: ReactNode;
  /** Leave room for the fixed tab bar. */
  tabBar?: boolean;
  padded?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { pad } = useLayout();
  return (
    <View style={{ flex: 1, backgroundColor: c.frame, paddingTop: insets.top }}>
      <ScreenIn>
        {/* Scrolls the focused field into view above the keyboard. */}
        <KeyboardAwareScrollView
          bottomOffset={24}
          contentContainerStyle={{ paddingBottom: (tabBar ? 84 : 0) + insets.bottom }}
          keyboardShouldPersistTaps="handled">
          {top}
          <View style={[padded ? { paddingHorizontal: pad, paddingBottom: pad } : null, contentStyle]}>{children}</View>
        </KeyboardAwareScrollView>
      </ScreenIn>
    </View>
  );
}

const styles = StyleSheet.create({
  dot: { width: 8, height: 8, borderRadius: 4 },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 18,
    zIndex: 5,
  },
  tbSide: { flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 0, flexShrink: 1 },
});
