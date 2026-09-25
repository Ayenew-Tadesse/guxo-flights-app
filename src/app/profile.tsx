import { View } from 'react-native';

import { CompleteCard, PointsCard, ProfileRow } from '@/components/ui';
import { Button, Gradient, Heading, Screen, T, TopBar, useColors } from '@/design-system';
import { initialsFor } from '@/data/flights';
import { goBack, goTo, resetTo } from '@/state/nav';
import { SIBLING_APPS, fmtPts, loadAccount, pointsBalance, profileCompletion, savedCards, setState, showToast, useApp } from '@/state/store';

const soon = (what: string) => () => showToast(what + ' is coming soon');

export default function Profile() {
  const c = useColors();
  const s = useApp();
  const a = s.currentUser;
  const signUp = () => resetTo(loadAccount() ? '/log-in' : '/sign-up');

  const head = (name: string, sub: string, initials: string) => (
    <View style={{ alignItems: 'center', paddingTop: 20, paddingBottom: 6 }}>
      <Gradient style={{ width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' }}>
        <T size={1.5} weight={800} color="#fff">
          {initials}
        </T>
      </Gradient>
      <Heading size={1.1875} style={{ marginTop: 12 }}>
        {name}
      </Heading>
      <T size={0.8125} color={c.inkFaint} style={{ marginTop: 2 }}>
        {sub}
      </T>
    </View>
  );
  const soonRows = (
    <>
      <ProfileRow icon="users" label="Saved passengers" onPress={soon('Saved passengers')} />
      <ProfileRow icon="bell" label="Notification preferences" onPress={soon('Notification preferences')} />
      <ProfileRow icon="help" label="Help & support" onPress={soon('Help & support')} />
    </>
  );

  if (!a) {
    return (
      <Screen top={<TopBar title="Profile" onBack={goBack} />}>
        {head('Guest', 'Browsing without an account', '?')}
        <View style={{ backgroundColor: c.surfaceAlt, borderWidth: 1, borderStyle: 'dashed', borderColor: c.lineStrong, borderRadius: 16, padding: 16, marginTop: 14, marginBottom: 6, alignItems: 'center' }}>
          <T size={0.9375} weight={700}>
            Earn Guxo Points on every trip
          </T>
          <T size={0.75} color={c.inkSoft} align="center" style={{ marginTop: 4, marginBottom: 12 }}>
            Create a free account to save cards, link Guxo and Gexi, and spend points at checkout.
          </T>
          <Button label="Sign up or log in" onPress={signUp} style={{ alignSelf: 'center' }} />
        </View>
        {soonRows}
        <ProfileRow icon="user" label="Sign up or log in" tone="accent" onPress={signUp} />
      </Screen>
    );
  }

  const comp = profileCompletion(a);
  const cards = savedCards(a);
  const linkedCount = SIBLING_APPS.filter((x) => a.linked?.[x.id]).length;
  return (
    <Screen top={<TopBar title="Profile" onBack={goBack} />}>
      {head(a.name, a.email, initialsFor(a.name))}
      <Button small kind="tint" label="Edit profile" onPress={() => goTo('/personal-details')} style={{ alignSelf: 'center', marginTop: 12 }} />
      {comp.pct < 100 ? <CompleteCard account={a} onPress={() => goTo('/personal-details')} /> : null}
      <PointsCard onPress={() => goTo('/points')} />
      <ProfileRow icon="user" label="Personal details" meta={comp.pct < 100 ? comp.pct + '%' : ''} onPress={() => goTo('/personal-details')} />
      <ProfileRow icon="card" label="Payment methods" meta={cards.length ? cards.length + ' card' + (cards.length > 1 ? 's' : '') : 'Add a card'} onPress={() => goTo('/cards')} />
      <ProfileRow icon="link" label="Connected apps" meta={linkedCount ? linkedCount + ' linked' : 'Not linked'} onPress={() => goTo('/connected-apps')} />
      <ProfileRow icon="star" label="Guxo Points" meta={fmtPts(pointsBalance(a)) + ' pts'} onPress={() => goTo('/points')} />
      {soonRows}
      <ProfileRow
        icon="logout"
        label="Log out"
        tone="danger"
        onPress={() => {
          setState({ currentUser: null });
          resetTo('/log-in');
        }}
      />
    </Screen>
  );
}
