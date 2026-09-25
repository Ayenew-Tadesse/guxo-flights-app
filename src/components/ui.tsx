/**
 * Guxo Flights building blocks shared by several screens. Each mirrors a
 * piece of the web prototype (class names noted where it helps).
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Modal, Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect } from 'react-native-svg';

import {
  Button,
  Gradient,
  Icon,
  IconButton,
  Spinner,
  T,
  alpha,
  mix,
  payColors,
  shadow,
  useColors,
  useLayout,
  type IconName,
} from '@/design-system';
import { qrCells } from '@/data/flights';
import { hasUnread } from '@/state/notifications';
import { goTo } from '@/state/nav';
import {
  closeConfirm,
  fmtPts,
  pointsBalance,
  profileCompletion,
  PROFILE_BONUS,
  SIBLING_APPS,
  ledger,
  tierInfo,
  useApp,
  type Account,
} from '@/state/store';

/* --------------------------------------------------- top bar account icons */

/** Bell (with unread dot) and profile buttons; hidden for guests. */
export function AccountButtons({ onHero, bell = true }: { onHero?: boolean; bell?: boolean }) {
  const s = useApp();
  if (!s.currentUser) return null;
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {bell ? (
        <IconButton
          icon="bell"
          label={hasUnread(s) ? 'Notifications (unread)' : 'Notifications'}
          onHero={onHero}
          dot={hasUnread(s)}
          onPress={() => goTo('/notifications')}
        />
      ) : null}
      <IconButton icon="user" label="Profile" onHero={onHero} onPress={() => goTo('/profile')} />
    </View>
  );
}

/* ----------------------------------------------------------- payment badge */

export function PmBadge({ kind, big }: { kind: string; big?: boolean }) {
  const c = useColors();
  const w = big ? 42 : 34;
  const h = big ? 27 : 21;
  if (kind === 'mastercard') {
    const d = big ? 15 : 12;
    return (
      <View style={{ width: w, height: h, borderRadius: 5, backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: c.line }}>
        <View style={{ position: 'absolute', width: d, height: d, borderRadius: d / 2, top: (h - d) / 2 - 1, left: big ? 7 : 6, backgroundColor: payColors.mcRed }} />
        <View style={{ position: 'absolute', width: d, height: d, borderRadius: d / 2, top: (h - d) / 2 - 1, left: big ? 17 : 13, backgroundColor: payColors.mcYellow, opacity: 0.85 }} />
      </View>
    );
  }
  const bg = kind === 'visa' ? payColors.visa : kind === 'telebirr' ? payColors.telebirr : c.primary;
  const label = kind === 'visa' ? 'VISA' : kind === 'telebirr' ? 'Telebirr' : kind === 'bank' ? 'Bank' : 'Card';
  return (
    <View style={{ width: w, height: h, borderRadius: 5, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <T px={big ? 10 : 9} weight={700} color="#fff">
        {label}
      </T>
    </View>
  );
}

/* --------------------------------------------------- boarding pass pieces */

export function BpRow({ label, value, strong }: { label: string; value?: ReactNode; strong?: boolean }) {
  const c = useColors();
  return (
    <View style={[styles.bpRow, { borderBottomColor: c.line }]}>
      <T size={0.8125} weight={strong ? 700 : 400} color={strong ? c.ink : c.inkFaint}>
        {label}
      </T>
      {typeof value === 'string' || typeof value === 'number' ? (
        <T size={0.8125} style={{ flexShrink: 1, textAlign: 'right' }}>
          {value}
        </T>
      ) : (
        value
      )}
    </View>
  );
}

/** Gradient-topped card with a perforation, used for confirmations, receipts and boarding passes. */
export function PassCard({
  icon,
  badge,
  title,
  sub,
  cancelled,
  children,
  style,
}: {
  icon?: IconName;
  badge?: string | null;
  title: string;
  sub: string;
  cancelled?: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  return (
    <View style={[{ marginTop: 16, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: c.line, boxShadow: shadow, backgroundColor: c.surface }, style]}>
      <Gradient from={cancelled ? '#4C5A85' : undefined} to={cancelled ? '#7484B5' : undefined} style={{ padding: 24, alignItems: 'center' }}>
        {icon ? (
          <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <Icon name={icon} size={22} color="#fff" strokeWidth={2.4} />
          </View>
        ) : null}
        {badge ? (
          <View style={{ backgroundColor: 'rgba(255,255,255,0.22)', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 999, marginBottom: 8 }}>
            <T size={0.625} weight={800} color="#fff" upper ls={0.05}>
              {badge}
            </T>
          </View>
        ) : null}
        <T size={1.1875} weight={700} color="#fff" align="center">
          {title}
        </T>
        <T size={0.7812} color="rgba(255,255,255,0.85)" align="center" style={{ marginTop: 4 }}>
          {sub}
        </T>
      </Gradient>
      <View style={{ borderTopWidth: 2, borderStyle: 'dashed', borderColor: c.lineStrong, marginHorizontal: 16 }} />
      <View style={{ padding: 18 }}>{children}</View>
    </View>
  );
}

export function PnrBox({ label, code }: { label: string; code: string }) {
  const c = useColors();
  return (
    <View style={{ alignItems: 'center', marginTop: 14, padding: 12, backgroundColor: c.surfaceAlt, borderRadius: 12 }}>
      <T size={0.625} color={c.inkFaint} upper ls={0.07} style={{ marginBottom: 3 }}>
        {label}
      </T>
      <T size={1.3125} weight={700} color={c.primary} ls={0.12}>
        {code}
      </T>
    </View>
  );
}

export function QrCode({ seed, size = 132 }: { seed: string; size?: number }) {
  const c = useColors();
  const cells = qrCells(seed);
  const n = cells.length;
  const cell = size / n;
  const finder = (row: number, col: number) => (
    <>
      <Rect x={col * cell} y={row * cell} width={7 * cell} height={7 * cell} fill={c.ink} />
      <Rect x={(col + 1) * cell} y={(row + 1) * cell} width={5 * cell} height={5 * cell} fill={c.surface} />
      <Rect x={(col + 2) * cell} y={(row + 2) * cell} width={3 * cell} height={3 * cell} fill={c.ink} />
    </>
  );
  return (
    <View style={{ alignSelf: 'center', marginTop: 16, marginBottom: 18, borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: c.line }}>
      <Svg width={size} height={size} accessibilityLabel="Boarding pass QR code">
        <Rect x={0} y={0} width={size} height={size} fill={c.surface} />
        {cells.flatMap((row, y) => row.map((on, x) => (on ? <Rect key={x + '-' + y} x={x * cell} y={y * cell} width={cell} height={cell} fill={c.ink} /> : null)))}
        {finder(0, 0)}
        {finder(0, n - 7)}
        {finder(n - 7, 0)}
      </Svg>
    </View>
  );
}

/* ---------------------------------------------------------- Guxo Points */

export function PointsCard({ onPress }: { onPress?: () => void }) {
  const s = useApp();
  const a = s.currentUser;
  const t = tierInfo(a);
  const bal = pointsBalance(a);
  const linked = (a && a.linked) || {};
  const apps = ['Guxo Flights', ...SIBLING_APPS.filter((x) => linked[x.id]).map((x) => x.name)];
  const body = (
    <Gradient style={{ borderRadius: 16, padding: 16, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.1)' }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <View>
          <T size={0.7188} color="rgba(255,255,255,0.85)">
            Guxo Points balance
          </T>
          <T size={1.625} weight={800} color="#fff" lh={1.1} style={{ marginTop: 2 }}>
            {fmtPts(bal)}
          </T>
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.22)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 }}>
          <T size={0.6562} weight={800} color="#fff" upper ls={0.06}>
            {t.tier}
          </T>
        </View>
      </View>
      <View style={{ height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)', marginTop: 14, marginBottom: 6, overflow: 'hidden' }}>
        <View style={{ width: `${t.pct}%`, height: '100%', borderRadius: 3, backgroundColor: '#fff' }} />
      </View>
      <T size={0.7188} color="rgba(255,255,255,0.9)">
        {(t.next ? fmtPts(t.toNext) + ' more to ' + t.next.name : 'Top tier reached') + ' · worth ETB ' + Math.round(bal / 10).toLocaleString() + ' at checkout'}
      </T>
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
        {apps.map((n) => (
          <View key={n} style={{ backgroundColor: 'rgba(255,255,255,0.18)', paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999 }}>
            <T size={0.6562} weight={700} color="#fff">
              {n}
            </T>
          </View>
        ))}
      </View>
    </Gradient>
  );
  return (
    <View style={{ marginTop: 14, marginBottom: 6 }}>
      {onPress ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Guxo Points: ${fmtPts(bal)} points, ${t.tier} tier`} onPress={onPress}>
          {body}
        </Pressable>
      ) : (
        body
      )}
    </View>
  );
}

export function CompleteCard({ account, onPress }: { account: Partial<Account>; onPress?: () => void }) {
  const c = useColors();
  const s = useApp();
  const comp = profileCompletion(account);
  const bonusDone = ledger(s.currentUser).some((e) => e.key === 'profile-bonus');
  const right = comp.pct === 100 ? (bonusDone ? '+' + PROFILE_BONUS + ' pts earned' : 'Save to earn +' + PROFILE_BONUS + ' pts') : 'Finish for +' + PROFILE_BONUS + ' pts';
  const missing = comp.missing;
  const list = missing.length < 2 ? missing.join('') : missing.slice(0, -1).join(', ') + ' and ' + missing[missing.length - 1];
  const inner = (
    <View style={{ backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: c.line, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, marginTop: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <T size={0.8125} weight={700}>
          {'Profile ' + comp.pct + '% complete'}
        </T>
        <T size={0.75} weight={700} color={c.primary}>
          {right}
        </T>
      </View>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: c.line, marginTop: 8, marginBottom: 6, overflow: 'hidden' }}>
        <Gradient style={{ width: `${comp.pct}%`, height: '100%', borderRadius: 3 }} />
      </View>
      <T size={0.7188} color={c.inkSoft}>
        {missing.length ? 'Add your ' + list + '.' : 'All set — your details fill in at checkout automatically.'}
      </T>
    </View>
  );
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {inner}
    </Pressable>
  ) : (
    inner
  );
}

/* ----------------------------------------------------------------- rows */

export function ProfileRow({
  icon,
  label,
  meta,
  tone,
  onPress,
}: {
  icon: IconName;
  label: string;
  meta?: string;
  tone?: 'danger' | 'accent';
  onPress: () => void;
}) {
  const c = useColors();
  const color = tone === 'danger' ? c.bad : tone === 'accent' ? c.primary : c.ink;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.profileRow,
        { borderBottomColor: c.line, backgroundColor: pressed || hovered ? alpha(c.primary, 0.04) : 'transparent' },
      ]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 }}>
        <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: tone === 'danger' ? alpha(c.bad, 0.1) : c.surfaceAlt }}>
          <Icon name={icon} size={16} color={tone === 'danger' ? c.bad : c.primary} />
        </View>
        <T size={0.875} weight={600} color={color}>
          {label}
        </T>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {meta ? (
          <T size={0.75} weight={600} color={c.inkFaint}>
            {meta}
          </T>
        ) : null}
        <T color={c.inkFaint}>›</T>
      </View>
    </Pressable>
  );
}

export function EarnRow({
  icon,
  title,
  detail,
  pts,
  done,
  soon,
  onPress,
}: {
  icon: IconName;
  title: string;
  detail: string;
  pts: string;
  done?: boolean;
  soon?: boolean;
  onPress?: () => void;
}) {
  const c = useColors();
  const row = (
    <View style={[styles.earnRow, { borderBottomColor: c.line, opacity: soon ? 0.6 : 1 }]}>
      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={16} color={c.primary} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <T size={0.8438} weight={700}>
          {title}
        </T>
        <T size={0.7188} color={c.inkSoft} style={{ marginTop: 1 }}>
          {detail}
        </T>
      </View>
      <T size={0.75} weight={800} color={done ? c.good : c.primary}>
        {pts}
      </T>
    </View>
  );
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {row}
    </Pressable>
  ) : (
    row
  );
}

export function InfoNote({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return (
    <View style={[{ backgroundColor: c.surfaceAlt, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginTop: 12 }, style]}>
      <T size={0.75} color={c.inkSoft} lh={1.5}>
        {children}
      </T>
    </View>
  );
}

/** Small pill like the prototype's status badges. */
export function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: bg, paddingVertical: 4, paddingHorizontal: 9, borderRadius: 999 }}>
      <T size={0.6562} weight={800} color={color} upper ls={0.04}>
        {label}
      </T>
    </View>
  );
}

/* --------------------------------------------------------------- tab bar */

const TABS: { route: 'home' | 'book' | 'trips' | 'check-in'; label: string; icon: IconName }[] = [
  { route: 'home', label: 'Home', icon: 'home' },
  { route: 'book', label: 'Book', icon: 'book' },
  { route: 'trips', label: 'My Trips', icon: 'trips' },
  { route: 'check-in', label: 'Check-in', icon: 'checkin' },
];

/** The prototype's tab bar: icon + label, with a sliding indicator above the active tab. */
export function TabBar({ active, onSelect }: { active: string; onSelect: (route: string) => void }) {
  const c = useColors();
  const { atLeast } = useLayout();
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const index = Math.max(0, TABS.findIndex((t) => t.route === active));
  const [x] = useState(() => new Animated.Value(0));
  const tabW = width / TABS.length;
  useEffect(() => {
    if (!width) return;
    Animated.timing(x, { toValue: tabW * index + tabW / 2 - 15, duration: 250, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [x, index, tabW, width]);
  const big = atLeast(768);
  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ flexDirection: 'row', backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.line, paddingBottom: insets.bottom }}>
      {width ? (
        <Animated.View style={{ position: 'absolute', top: -5, height: 4, width: 30, borderRadius: 4, backgroundColor: c.primary, transform: [{ translateX: x }] }} />
      ) : null}
      {TABS.map((t) => {
        const on = t.route === active;
        return (
          <Pressable
            key={t.route}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onSelect(t.route)}
            style={{ flex: 1, alignItems: 'center', gap: 3, paddingTop: big ? 12 : 10, paddingBottom: big ? 14 : 12 }}>
            <Icon name={t.icon} size={big ? 22 : 20} color={on ? c.primary : c.inkFaint} />
            <T size={0.6562} weight={on ? 700 : 600} color={on ? c.primary : c.inkFaint}>
              {t.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

/* -------------------------------------------------------------- overlays */

export function PageLoader() {
  const c = useColors();
  const { loading } = useApp();
  if (!loading) return null;
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 200, alignItems: 'center', justifyContent: 'center', backgroundColor: alpha(c.page, 0.8) }]}>
      <Spinner />
    </View>
  );
}

export function Toast() {
  const c = useColors();
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 96, alignItems: 'center', zIndex: 150 }}>
      <View accessibilityLiveRegion="polite" style={{ backgroundColor: c.ink, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 16, boxShadow: shadow }}>
        <T size={0.8125} weight={600} color={c.frame}>
          {toast.text}
        </T>
      </View>
    </View>
  );
}

export function ConfirmModal() {
  const c = useColors();
  const { confirm } = useApp();
  return (
    <Modal transparent visible={!!confirm} animationType="fade" onRequestClose={closeConfirm}>
      <Pressable onPress={closeConfirm} style={{ flex: 1, backgroundColor: 'rgba(20,10,40,0.55)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        {confirm ? (
          <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 340, backgroundColor: c.surface, borderRadius: 18, padding: 22, boxShadow: shadow }}>
            <T size={1.0625} weight={700}>
              {confirm.title}
            </T>
            <T size={0.8125} color={c.inkSoft} lh={1.5} style={{ marginTop: 8 }}>
              {confirm.body}
            </T>
            <View style={{ gap: 8, marginTop: 20 }}>
              <Button
                block
                label={confirm.ok}
                kind={confirm.danger ? 'danger' : 'primary'}
                onPress={() => {
                  const fn = confirm.onOk;
                  closeConfirm();
                  fn();
                }}
              />
              <Button block kind="ghost" label={confirm.cancel ?? 'Not now'} onPress={closeConfirm} />
            </View>
          </Pressable>
        ) : null}
      </Pressable>
    </Modal>
  );
}

/** Tinted, bordered row (fare cards, payment tiles, saved cards). */
export function Selectable({
  selected,
  onPress,
  children,
  style,
  label,
}: {
  selected?: boolean;
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  label?: string;
}) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        {
          borderWidth: 1.5,
          borderColor: selected ? c.primary : c.line,
          borderRadius: 14,
          backgroundColor: selected ? mix(c.primary, 7, c.surface) : c.surface,
        },
        style,
      ]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bpRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderStyle: 'dashed' },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderRadius: 10,
  },
  earnRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 2, borderBottomWidth: 1 },
});

/* ------------------------------------------------------------- checkbox */

/** Square checkbox mark. */
export function Box({ checked }: { checked: boolean }) {
  const c = useColors();
  return (
    <View style={{ width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: checked ? c.primary : c.inkFaint, backgroundColor: checked ? c.primary : c.surface, alignItems: 'center', justifyContent: 'center' }}>
      {checked ? <Icon name="check" size={12} color="#fff" strokeWidth={3} /> : null}
    </View>
  );
}

/** Checkbox with a label; the whole row toggles. */
export function CheckRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={onToggle} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Box checked={checked} />
      <T size={0.8125} weight={600}>
        {label}
      </T>
    </Pressable>
  );
}
