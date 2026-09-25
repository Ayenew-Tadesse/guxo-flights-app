import { useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  Badge,
  BrandProvider,
  Button,
  Card,
  Field,
  Gradient,
  Heading,
  IconButton,
  Input,
  LogoMark,
  RouteDots,
  Screen,
  SecTitle,
  T,
  TopBar,
  brands,
  mix,
  useBrand,
  type BrandName,
} from '@/design-system';
import { goBack } from '@/state/nav';

const BRANDS = Object.keys(brands) as BrandName[];
const SWATCHES = ['primary', 'primary2', 'surfaceAlt', 'ink', 'inkSoft', 'inkFaint', 'line', 'lineStrong', 'good', 'bad'] as const;

/** Living reference for the shared Guxo kit: every token and component, in each brand. */
export default function DesignSystem() {
  const [brand, setBrand] = useState<BrandName>('guxoFlights');
  return (
    <BrandProvider brand={brand}>
      <Screen top={<TopBar title="Design system" onBack={goBack} />}>
        <T size={0.8125}>Shared by the Guxo app family. Pick a brand to see the same components re-skinned.</T>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          {BRANDS.map((b) => (
            <BrandChip key={b} name={b} on={b === brand} onPress={() => setBrand(b)} />
          ))}
        </View>
        <Showcase />
      </Screen>
    </BrandProvider>
  );
}

function BrandChip({ name, on, onPress }: { name: BrandName; on: boolean; onPress: () => void }) {
  const { colors } = useBrand();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={{ borderWidth: 1.5, borderColor: on ? colors.primary : colors.line, backgroundColor: on ? mix(colors.primary, 8, colors.surface) : colors.surface, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14 }}>
      <T size={0.8125} weight={700} color={on ? colors.primary : colors.ink}>
        {brands[name].displayName}
      </T>
    </Pressable>
  );
}

function Showcase() {
  const { colors } = useBrand();
  return (
    <>
      <SecTitle>Colour</SecTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {SWATCHES.map((k) => (
          <View key={k} style={{ width: 92, gap: 2 }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors[k], borderWidth: 1, borderColor: colors.line }} />
            <T size={0.6875}>{k}</T>
            <T size={0.625} color={colors.inkFaint}>
              {colors[k]}
            </T>
          </View>
        ))}
        <View style={{ width: 92, gap: 2 }}>
          <Gradient style={{ width: 44, height: 44, borderRadius: 12 }} />
          <T size={0.6875}>gradient</T>
          <T size={0.625} color={colors.inkFaint}>
            135° primary
          </T>
        </View>
      </View>

      <SecTitle>Type · Poppins</SecTitle>
      <Heading size={2} weight={800}>
        Display 2rem
      </Heading>
      <Heading size={1.5}>Title 1.5rem</Heading>
      <T size={1.0625} weight={700}>
        Top bar 1.0625rem
      </T>
      <T>Body 14px · Addis Ababa → Bahir Dar</T>
      <T size={0.6875} weight={700} upper ls={0.06} color={colors.inkFaint}>
        Field label
      </T>

      <SecTitle>Buttons</SecTitle>
      <View style={{ gap: 8 }}>
        <Button block label="Primary" />
        <Button block kind="ghost" label="Ghost" />
        <Button block kind="tint" icon="refresh" label="Tint with icon" />
        <Button block kind="danger" icon="cancel" label="Danger" />
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Button small label="Small" />
          <Button small disabled label="Disabled" />
          <IconButton icon="bell" label="Notifications" dot />
          <IconButton icon="user" label="Profile" />
        </View>
      </View>

      <SecTitle>Inputs</SecTitle>
      <View style={{ gap: 12 }}>
        <Field label="From">
          <Input icon="pin" value="Addis Ababa (ADD)" accessibilityLabel="From" />
        </Field>
        <Field label="Email">
          <Input placeholder="you@example.com" accessibilityLabel="Email" />
        </Field>
      </View>

      <SecTitle>Cards & display</SecTitle>
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          <Badge label="Cheapest" tone="good" />
          <Badge label="Fastest" tone="primary" />
          <Badge label="Cancelled" tone="bad" />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <T weight={700}>7:20 AM</T>
          <View style={{ flex: 1 }}>
            <RouteDots />
          </View>
          <T weight={700}>9:52 AM</T>
        </View>
      </Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 }}>
        <LogoMark size={44} />
        <T size={0.8125} color={colors.inkSoft} style={{ flexShrink: 1 }}>
          Logo mark — the gradient plane used on the splash, auth and home screens.
        </T>
      </View>
    </>
  );
}
