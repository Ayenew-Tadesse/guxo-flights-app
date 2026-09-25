import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { View } from 'react-native';

import { CheckRow, InfoNote } from '@/components/ui';
import { Button, Field, FormError, Input, Screen, T, TopBar, shadow, useColors } from '@/design-system';
import { BRAND_LABEL, cardBrand, expiryError, formatCardNumber, formatExpiry, luhnOk } from '@/data/flights';
import { goBack } from '@/state/nav';
import { addSavedCard, savedCards, showToast, useApp } from '@/state/store';

export default function AddCard() {
  const c = useColors();
  const s = useApp();
  const [name, setName] = useState(s.currentUser?.name ?? '');
  const [num, setNum] = useState('');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [makeDefault, setMakeDefault] = useState(() => !savedCards(s.currentUser).length);
  const [error, setError] = useState<string | null>(null);
  const digits = num.replace(/\D/g, '');

  function save() {
    if (name.trim().length < 2) return setError('Enter the name shown on the card.');
    if (digits.length < 13 || !luhnOk(digits)) return setError("That card number doesn't look right — check it and try again.");
    const expErr = expiryError(exp);
    if (expErr) return setError(expErr);
    if (cvc.length < 3) return setError('Enter the 3 or 4 digit CVC.');
    setError(null);
    const card = addSavedCard({ brand: cardBrand(digits), last4: digits.slice(-4), exp, name: name.trim(), makeDefault });
    if (card) showToast('Card added · ' + BRAND_LABEL[card.brand] + ' •••• ' + card.last4);
    goBack();
  }

  const shown = (digits + '••••••••••••••••').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  return (
    <Screen top={<TopBar title="Add a card" onBack={goBack} />}>
      {/* Live preview of the card being added. */}
      <LinearGradient
        colors={['#091540', c.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 18, padding: 20, marginTop: 14, marginBottom: 4, aspectRatio: 1.7, width: '100%', maxWidth: 360, alignSelf: 'center', justifyContent: 'space-between', boxShadow: shadow }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <LinearGradient colors={['#F2D48A', '#C9A24B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 34, height: 25, borderRadius: 6 }} />
          <T size={0.875} weight={800} color="#fff" ls={0.06}>
            {digits ? BRAND_LABEL[cardBrand(digits)].toUpperCase() : 'CARD'}
          </T>
        </View>
        <T size={1.125} weight={600} color="#fff" ls={0.12} numberOfLines={1}>
          {shown}
        </T>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flexShrink: 1 }}>
            <T size={0.625} color="rgba(255,255,255,0.95)" upper ls={0.06}>
              Card holder
            </T>
            <T size={0.8125} weight={600} color="#fff" numberOfLines={1} style={{ marginTop: 2 }}>
              {name.trim() || 'Your name'}
            </T>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <T size={0.625} color="rgba(255,255,255,0.95)" upper ls={0.06}>
              Expires
            </T>
            <T size={0.8125} weight={600} color="#fff" style={{ marginTop: 2 }}>
              {exp || 'MM/YY'}
            </T>
          </View>
        </View>
      </LinearGradient>
      <View style={{ gap: 12, marginTop: 8 }}>
        <Field label="Name on card">
          <Input accessibilityLabel="Name on card" value={name} onChangeText={setName} placeholder="Full name" autoComplete="cc-name" />
        </Field>
        <Field label="Card number">
          <Input accessibilityLabel="Card number" value={num} onChangeText={(v) => setNum(formatCardNumber(v))} placeholder="0000 0000 0000 0000" inputMode="numeric" autoComplete="cc-number" />
        </Field>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Field label="Expiry" style={{ flex: 1 }}>
            <Input accessibilityLabel="Expiry" value={exp} onChangeText={(v) => setExp(formatExpiry(v))} placeholder="MM/YY" inputMode="numeric" autoComplete="cc-exp" />
          </Field>
          <Field label="CVC" style={{ flex: 1 }}>
            <Input accessibilityLabel="CVC" value={cvc} onChangeText={(v) => setCvc(v.replace(/\D/g, '').slice(0, 4))} placeholder="CVC" secureTextEntry inputMode="numeric" autoComplete="cc-csc" />
          </Field>
        </View>
        <CheckRow label="Make this my default card" checked={makeDefault} onToggle={() => setMakeDefault((v) => !v)} />
        <FormError>{error}</FormError>
        <Button block label="Save card" onPress={save} />
        <InfoNote style={{ marginTop: 0 }}>
          {"We only keep the card's brand, last 4 digits and expiry on this device — never the full number or CVC. This is a prototype; no card is charged."}
        </InfoNote>
      </View>
    </Screen>
  );
}
