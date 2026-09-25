import { Pressable, View } from 'react-native';

import { InfoNote, Pill, PmBadge } from '@/components/ui';
import { Button, EmptyState, Icon, Screen, SecTitle, T, TopBar, alpha, mix, useColors } from '@/design-system';
import { BRAND_LABEL } from '@/data/flights';
import { goBack, goTo } from '@/state/nav';
import { openConfirm, removeCard, savedCards, setDefaultCard, showToast, useApp } from '@/state/store';

export default function Cards() {
  const c = useColors();
  const s = useApp();
  const cards = savedCards(s.currentUser);
  return (
    <Screen top={<TopBar title="Payment methods" onBack={goBack} />}>
      {!s.currentUser ? (
        <EmptyState message="Sign up to save cards." />
      ) : (
        <>
          {cards.length ? (
            <>
              <View style={{ marginTop: -16 }}>
                <SecTitle>Saved cards</SecTitle>
              </View>
              <View style={{ gap: 10, marginTop: 6 }}>
                {cards.map((card) => {
                  const label = BRAND_LABEL[card.brand] + ' •••• ' + card.last4;
                  return (
                    <View
                      key={card.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        borderWidth: 1.5,
                        borderRadius: 14,
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                        borderColor: card.isDefault ? c.primary : c.line,
                        backgroundColor: card.isDefault ? mix(c.primary, 6, c.surface) : c.surface,
                      }}>
                      <PmBadge kind={card.brand} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <T size={0.875} weight={700}>
                          {label}
                        </T>
                        <T size={0.7188} color={c.inkFaint} style={{ marginTop: 1 }}>
                          {'Expires ' + card.exp + ' · ' + card.name}
                        </T>
                      </View>
                      {card.isDefault ? (
                        <Pill label="Default" color={c.primary} bg={alpha(c.primary, 0.14)} />
                      ) : (
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => {
                            setDefaultCard(card.id);
                            showToast('Default card updated');
                          }}
                          style={{ paddingVertical: 6, paddingHorizontal: 4 }}>
                          <T size={0.75} weight={700} color={c.primary}>
                            Set default
                          </T>
                        </Pressable>
                      )}
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={'Remove ' + label}
                        onPress={() =>
                          openConfirm({
                            title: 'Remove this card?',
                            body: label + ' will be removed from Guxo Flights on this device.',
                            ok: 'Remove card',
                            danger: true,
                            onOk: () => {
                              removeCard(card.id);
                              showToast('Card removed');
                            },
                          })
                        }
                        style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surface }}>
                        <Icon name="close" size={14} color={c.inkFaint} />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <EmptyState message="No saved cards yet. Add one to check out faster." />
          )}
          <Button block kind="tint" icon="plus" label="Add a new card" onPress={() => goTo('/add-card')} style={{ marginTop: 16 }} />
          <SecTitle>Other ways to pay</SecTitle>
          <InfoNote style={{ marginTop: 0 }}>Telebirr / mobile banking and bank-counter payments are picked at checkout — nothing to set up here.</InfoNote>
          <InfoNote>{"Only each card's brand, last 4 digits and expiry are kept, on this device."}</InfoNote>
        </>
      )}
    </Screen>
  );
}
