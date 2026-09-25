import { Pressable, View } from 'react-native';

import { EmptyState, Icon, Screen, T, TopBar, alpha, mix, useColors } from '@/design-system';
import { fmtAgo } from '@/data/flights';
import { goBack } from '@/state/nav';
import { buildNotifications, markRead } from '@/state/notifications';
import { useApp } from '@/state/store';

/** Each notification opens the page it's about; unread ones are tinted with a dot. */
export default function Notifications() {
  const c = useColors();
  const s = useApp();
  const items = buildNotifications(s);
  const unread = items.filter((n) => n.unread).length;
  return (
    <Screen top={<TopBar title="Notifications" onBack={goBack} />}>
      {!items.length ? (
        <EmptyState message="No notifications yet." />
      ) : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingTop: 4, paddingBottom: 10, paddingHorizontal: 2 }}>
            <T size={0.75} weight={600} color={c.inkFaint}>
              {unread ? (
                <T size={0.75} weight={700} color={c.primary}>
                  {unread + ' unread'}
                </T>
              ) : (
                'All caught up'
              )}
              {' · ' + items.length + ' total'}
            </T>
            <Pressable accessibilityRole="button" disabled={!unread} onPress={() => markRead(items.map((n) => n.id))} style={{ paddingVertical: 6, paddingHorizontal: 4 }}>
              <T size={0.75} weight={700} color={unread ? c.primary : c.inkFaint}>
                Mark all as read
              </T>
            </Pressable>
          </View>
          <View style={{ gap: 6 }}>
            {items.map((n) => {
              const tone = n.tone === 'bad' ? c.bad : n.tone === 'good' ? c.good : c.primary;
              return (
                <Pressable
                  key={n.id}
                  accessibilityRole="button"
                  accessibilityLabel={(n.unread ? 'Unread: ' : '') + n.t + '. ' + n.d + ' ' + n.go}
                  onPress={() => {
                    markRead([n.id]);
                    n.open();
                  }}
                  style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => ({
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 12,
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: n.unread ? mix(c.primary, 18, c.line) : 'transparent',
                    backgroundColor: n.unread ? mix(c.primary, pressed || hovered ? 10 : 6, c.surface) : pressed || hovered ? c.surfaceAlt : 'transparent',
                    transform: [{ scale: pressed ? 0.99 : 1 }],
                  })}>
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 19,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: n.unread ? alpha(tone, n.tone ? 0.15 : 0.18) : c.surfaceAlt,
                    }}>
                    <Icon name={n.icon} size={17} color={n.unread || n.tone ? tone : c.inkFaint} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <T size={0.8438} weight={n.unread ? 700 : 600} color={n.unread ? c.ink : c.inkSoft}>
                      {n.t}
                    </T>
                    <T size={0.7812} color={c.inkSoft} style={{ marginTop: 2 }}>
                      {n.d}
                    </T>
                    <T size={0.6875} color={c.inkFaint} style={{ marginTop: 4 }}>
                      {fmtAgo(n.at) + ' · '}
                      <T size={0.6875} weight={700} color={c.primary}>
                        {n.go}
                      </T>
                    </T>
                  </View>
                  <View style={{ alignItems: 'center', alignSelf: 'stretch', justifyContent: 'space-between', gap: 8 }}>
                    {n.unread ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.primary2, marginTop: 5 }} /> : <View />}
                    <T size={1.1} color={c.inkFaint}>
                      ›
                    </T>
                    <View />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}
