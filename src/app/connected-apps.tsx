import { LinearGradient } from 'expo-linear-gradient';
import { Linking, View } from 'react-native';

import { InfoNote, Pill } from '@/components/ui';
import { Button, EmptyState, Screen, T, TopBar, alpha, shadow, useColors } from '@/design-system';
import { fmtDate } from '@/data/flights';
import { goBack } from '@/state/nav';
import { LINK_BONUS, SIBLING_APPS, addPoints, openConfirm, showToast, updateAccount, useApp } from '@/state/store';

/** Link the sibling Guxo apps so they share one account and one Guxo Points balance. */
export default function ConnectedApps() {
  const c = useColors();
  const s = useApp();
  const a = s.currentUser;
  if (!a) {
    return (
      <Screen top={<TopBar title="Connected apps" onBack={goBack} />}>
        <EmptyState message="Sign up to link your Guxo apps." />
      </Screen>
    );
  }
  const linked = a.linked ?? {};
  return (
    <Screen top={<TopBar title="Connected apps" onBack={goBack} />}>
      <T size={0.75} color={c.inkFaint}>
        Link your Guxo apps to use one account and one Guxo Points balance everywhere. Points you earn in any linked app add up here.
      </T>
      {SIBLING_APPS.map((app) => {
        const on = !!linked[app.id];
        const body = !app.live
          ? `${app.name} is still being built. You'll be able to link it here when it launches.`
          : on
            ? `Linked ${fmtDate(new Date(linked[app.id].at))} as ${a.email || a.phone}. Trips on ${app.name} earn Guxo Points in this same balance.`
            : `Link ${app.name} to share your account and points. Get +${LINK_BONUS} points the first time you link.`;
        return (
          <View
            key={app.id}
            style={{
              borderWidth: 1,
              borderColor: c.line,
              borderRadius: 16,
              padding: 14,
              marginTop: 12,
              backgroundColor: app.live ? c.surface : c.surfaceAlt,
              boxShadow: app.live ? shadow : undefined,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <LinearGradient colors={[app.c1, app.c2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                <T size={1} weight={800} color="#fff">
                  {app.mark}
                </T>
              </LinearGradient>
              <View style={{ flex: 1, minWidth: 0 }}>
                <T size={0.9375} weight={800}>
                  {app.name}
                </T>
                <T size={0.7188} color={c.inkSoft} style={{ marginTop: 1 }}>
                  {app.what}
                </T>
              </View>
              {!app.live ? (
                <Pill label="Coming soon" color={c.inkFaint} bg={c.surface} />
              ) : on ? (
                <Pill label="Linked" color={c.good} bg={alpha(c.good, 0.14)} />
              ) : (
                <Pill label="Not linked" color={c.inkFaint} bg={c.surfaceAlt} />
              )}
            </View>
            <T size={0.75} color={c.inkSoft} lh={1.5} style={{ marginTop: 10 }}>
              {body}
            </T>
            {app.live ? (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                {on ? (
                  <>
                    {app.url ? <Button small kind="ghost" label={'Open ' + app.name} onPress={() => Linking.openURL(app.url!)} style={{ flex: 1 }} /> : null}
                    <Button
                      small
                      kind="danger"
                      label="Unlink"
                      style={{ flex: 1 }}
                      onPress={() =>
                        openConfirm({
                          title: `Unlink ${app.name}?`,
                          body: `${app.name} will stop sharing your account and points. Points you already have stay in your balance.`,
                          ok: 'Unlink',
                          danger: true,
                          onOk: () => {
                            updateAccount((acc) => {
                              const next = { ...(acc.linked ?? {}) };
                              delete next[app.id];
                              acc.linked = next;
                            });
                            showToast(app.name + ' unlinked');
                          },
                        })
                      }
                    />
                  </>
                ) : (
                  <Button
                    small
                    icon="link"
                    label={'Link ' + app.name}
                    style={{ flex: 1 }}
                    onPress={() =>
                      openConfirm({
                        title: `Link ${app.name}?`,
                        body: `Guxo Flights will share your name, email and Guxo Points balance with ${app.name} (${app.what.toLowerCase()}). You can unlink any time.`,
                        ok: 'Link ' + app.name,
                        onOk: () => {
                          updateAccount((acc) => {
                            acc.linked = { ...(acc.linked ?? {}), [app.id]: { at: new Date().toISOString() } };
                          });
                          const bonus = addPoints(LINK_BONUS, 'Linked ' + app.name, 'bonus', 'link-' + app.id);
                          showToast(app.name + ' linked' + (bonus ? ' · +' + LINK_BONUS + ' points' : ''));
                        },
                      })
                    }
                  />
                )}
              </View>
            ) : null}
          </View>
        );
      })}
      <InfoNote>In this prototype, linking is simulated on this device — nothing is sent anywhere.</InfoNote>
    </Screen>
  );
}
