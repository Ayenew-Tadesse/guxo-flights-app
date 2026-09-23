import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Badge,
  BrandProvider,
  Button,
  Card,
  Choice,
  Divider,
  IconButton,
  Row,
  Screen,
  Text,
  TextField,
  brands,
  radius,
  spacing,
  type,
  useBrand,
  type BrandName,
  type TypeRole,
} from '@/design-system';

const BRANDS = Object.keys(brands) as BrandName[];
const SWATCHES = ['primary', 'primarySoft', 'primaryTint', 'background', 'surfaceAlt', 'ink', 'inkSoft', 'line', 'good', 'bad'] as const;

/** Living reference for the shared kit: every token and component, in each brand. */
export default function DesignSystem() {
  const [brand, setBrand] = useState<BrandName>('guxoFlights');
  return (
    <BrandProvider brand={brand}>
      <Screen edges={['bottom']}>
        <Text variant="caption">
          Shared by the Guxo app family. Pick a brand to see the same components re-skinned.
        </Text>
        <View style={styles.wrap}>
          {BRANDS.map((b) => (
            <Choice key={b} label={brands[b].displayName} selected={b === brand} onPress={() => setBrand(b)} />
          ))}
        </View>
        <Showcase />
      </Screen>
    </BrandProvider>
  );
}

function Showcase() {
  const { colors } = useBrand();
  const [fare, setFare] = useState('standard');
  return (
    <>
      <Section title="Colour">
        <View style={styles.wrap}>
          {SWATCHES.map((k) => (
            <View key={k} style={styles.swatch}>
              <View style={[styles.chip, { backgroundColor: colors[k], borderColor: colors.line }]} />
              <Text variant="caption">{k}</Text>
              <Text variant="label">{colors[k]}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Type">
        {(Object.keys(type) as TypeRole[]).map((role) => (
          <Text key={role} variant={role}>{role} · Addis Ababa → Bahir Dar</Text>
        ))}
      </Section>

      <Section title="Buttons">
        <Button label="Primary" onPress={() => {}} />
        <Button label="Ghost" kind="ghost" onPress={() => {}} />
        <Button label="Danger" kind="danger" onPress={() => {}} />
        <View style={styles.wrap}>
          <Button label="Small" size="small" icon="flight" onPress={() => {}} />
          <Button label="Disabled" size="small" disabled onPress={() => {}} />
          <IconButton icon="notifications-none" label="Notifications" />
        </View>
      </Section>

      <Section title="Inputs">
        <TextField label="Email" placeholder="you@example.com" />
        <TextField label="Password" placeholder="Your password" error="Choose a password with at least 6 characters." />
        <View style={styles.wrap}>
          {['basic', 'standard', 'flex'].map((f) => (
            <Choice key={f} label={f[0].toUpperCase() + f.slice(1)} detail="ETB 3,450" selected={f === fare} onPress={() => setFare(f)} />
          ))}
        </View>
      </Section>

      <Section title="Cards & display">
        <Card>
          <View style={styles.wrap}>
            <Badge label="Upcoming" />
            <Badge label="Checked in" tone="good" />
            <Badge label="Cancelled" tone="bad" />
            <Badge label="Draft" tone="neutral" />
          </View>
          <Row label="Route" value="ADD → BJR" />
          <Divider />
          <Row label="Total" value="ETB 4,100" />
        </Card>
        <Card tone="primary">
          <Text tone="onPrimary" variant="title">Primary card</Text>
          <Text tone="onPrimary">For banners and confirmations.</Text>
        </Card>
      </Section>

      <Section title="Spacing & radius">
        <View style={styles.wrap}>
          {Object.entries(spacing).map(([k, v]) => (
            <View key={k} style={styles.swatch}>
              <View style={{ width: v, height: 16, backgroundColor: colors.primarySoft }} />
              <Text variant="label">{k} · {v}</Text>
            </View>
          ))}
        </View>
        <View style={styles.wrap}>
          {Object.entries(radius).map(([k, v]) => (
            <View key={k} style={styles.swatch}>
              <View style={[styles.chip, { borderRadius: Math.min(v, 22), backgroundColor: colors.primaryTint, borderColor: colors.primary }]} />
              <Text variant="label">{k} · {v}</Text>
            </View>
          ))}
        </View>
      </Section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="heading">{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.two, marginTop: spacing.two },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.two, alignItems: 'center' },
  swatch: { alignItems: 'flex-start', gap: 2, minWidth: 90 },
  chip: { width: 44, height: 44, borderRadius: radius.small, borderWidth: 1 },
});
