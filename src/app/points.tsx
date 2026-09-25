import { View } from 'react-native';

import { EarnRow, InfoNote, PointsCard } from '@/components/ui';
import { EmptyState, Screen, SecTitle, T, TopBar, useColors } from '@/design-system';
import { fmtDate, fmtTime } from '@/data/flights';
import { goBack, goTo, showRoot } from '@/state/nav';
import { LINK_BONUS, MIN_REDEEM, PROFILE_BONUS, SIBLING_APPS, TIERS, fmtPts, ledger, profileCompletion, tierInfo, useApp } from '@/state/store';

/** Guxo Points: balance and tier, ways to earn, how to spend, and history. */
export default function Points() {
  const c = useColors();
  const s = useApp();
  const a = s.currentUser;
  if (!a) {
    return (
      <Screen top={<TopBar title="Guxo Points" onBack={goBack} />}>
        <EmptyState message="Sign up to start earning Guxo Points." />
      </Screen>
    );
  }
  const t = tierInfo(a);
  const items = ledger(a);
  const profileDone = items.some((e) => e.key === 'profile-bonus');
  return (
    <Screen top={<TopBar title="Guxo Points" onBack={goBack} />}>
      <PointsCard />
      <SecTitle>Ways to earn</SecTitle>
      <EarnRow icon="plane" title="Book flights" detail="1 point for every ETB 10 you pay" pts="Book ›" onPress={() => showRoot('/book')} />
      <EarnRow
        icon="user"
        title="Complete your profile"
        detail={profileDone ? 'Done — thanks!' : profileCompletion(a).pct + '% complete'}
        pts={(profileDone ? '✓ ' : '') + '+' + PROFILE_BONUS}
        done={profileDone}
        onPress={profileDone ? undefined : () => goTo('/personal-details')}
      />
      {SIBLING_APPS.map((app) => {
        if (!app.live) return <EarnRow key={app.id} icon="link" title={'Link ' + app.name} detail={app.what + ' · coming soon'} pts={'+' + LINK_BONUS} soon />;
        const got = items.some((e) => e.key === 'link-' + app.id);
        return (
          <EarnRow
            key={app.id}
            icon="link"
            title={'Link ' + app.name}
            detail={got ? (a.linked?.[app.id] ? 'Linked' : 'Bonus earned') : app.what + ' — shares this balance'}
            pts={(got ? '✓ ' : '') + '+' + LINK_BONUS}
            done={got}
            onPress={got ? undefined : () => goTo('/connected-apps')}
          />
        );
      })}
      <SecTitle>Use your points</SecTitle>
      <InfoNote style={{ marginTop: 0 }}>{`Every 10 points = ETB 1 off. Turn on “Use Guxo Points” at checkout once you have ${MIN_REDEEM} or more.`}</InfoNote>
      <SecTitle>Tiers</SecTitle>
      {TIERS.map((x) => {
        const here = x.name === t.tier;
        return (
          <EarnRow
            key={x.name}
            icon="star"
            title={x.name + (here ? ' · your tier' : '')}
            detail={x.min ? fmtPts(x.min) + ' lifetime points' : 'Where everyone starts'}
            pts={here ? '✓' : ''}
            done={here}
          />
        );
      })}
      <SecTitle>History</SecTitle>
      {items.length ? (
        items.map((e) => (
          <View key={e.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 2, borderBottomWidth: 1, borderBottomColor: c.line }}>
            <View style={{ flexShrink: 1 }}>
              <T size={0.8125} weight={600}>
                {e.text}
              </T>
              <T size={0.6875} color={c.inkFaint} style={{ marginTop: 1 }}>
                {fmtDate(new Date(e.at)) + ' · ' + fmtTime(new Date(e.at))}
              </T>
            </View>
            <T size={0.875} weight={800} color={e.pts < 0 ? c.bad : c.good}>
              {(e.pts > 0 ? '+' : '−') + fmtPts(Math.abs(e.pts))}
            </T>
          </View>
        ))
      ) : (
        <T size={0.8125} color={c.inkFaint} style={{ paddingVertical: 12, paddingHorizontal: 2 }}>
          No points yet — book a flight or finish your profile to get started.
        </T>
      )}
    </Screen>
  );
}
