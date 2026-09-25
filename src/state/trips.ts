/** Trip actions shared by My Trips, Check-in and the notifications. */
import { addDaysIso, pick, randInt, todayIso } from '@/data/flights';

import { goTo, showRoot } from './nav';
import { addPoints, getState, openConfirm, startSearch, updateTrip, type Trip } from './store';

export function rebook(t: Trip) {
  const out = t.legs[0];
  if (t.tripType === 'round' && t.legs[1]) {
    const days = Math.max(1, Math.round((t.legs[1].dep.getTime() - out.dep.getTime()) / 86400000));
    const depart = addDaysIso(todayIso(), 7);
    startSearch(out.origin, out.destination, depart, t.names.length, 'round', addDaysIso(depart, days));
  } else {
    startSearch(out.origin, out.destination, todayIso(), t.names.length, 'one', null);
  }
  goTo('/results');
}

export function askCancel(t: Trip) {
  const out = t.legs[0];
  openConfirm({
    title: 'Cancel this trip?',
    body: `Your ${out.origin} → ${out.destination} booking (PNR ${t.pnr}) will be cancelled and removed from check-in. This can't be undone.`,
    ok: 'Yes, cancel trip',
    cancel: 'Keep trip',
    danger: true,
    onOk: () => {
      updateTrip(t.id, { cancelled: true, cancelledAt: new Date() });
      // Points earned on the trip come back off; points spent on it are returned.
      if (t.pointsEarned) addPoints(-t.pointsEarned, 'Reversed · cancelled PNR ' + t.pnr, 'reverse', 'rev-' + t.id);
      if (t.pointsUsed) addPoints(t.pointsUsed, 'Returned · cancelled PNR ' + t.pnr, 'refund', 'ref-' + t.id);
    },
  });
}

export function checkIn(t: Trip) {
  const legs = t.legs.map((lg) => ({
    ...lg,
    gate: lg.gate ?? pick(['A', 'B', 'C', 'D']) + randInt(1, 24),
    boardingTime: lg.boardingTime ?? new Date(lg.dep.getTime() - 40 * 60000),
  }));
  updateTrip(t.id, { legs, checkedIn: true, checkedInAt: t.checkedInAt ?? new Date() });
  goTo({ pathname: '/boarding', params: { id: t.id } });
}

export const findTrip = (id?: string) => getState().trips.find((t) => t.id === id);
export const toHome = () => showRoot('/home');
