/**
 * Notifications, built from trips plus a few standing messages. Every one
 * has a stable id and a destination; opening it marks it read.
 */
import { type IconName } from '@/design-system';
import { AIRLINE, todayIso } from '@/data/flights';

import { goTo, showRoot } from './nav';
import { getState, setState, startSearch, tripRouteText, type AppState } from './store';

export type Notif = {
  id: string;
  icon: IconName;
  tone?: 'good' | 'bad';
  fresh: boolean;
  unread: boolean;
  at: Date;
  t: string;
  d: string;
  go: string;
  open: () => void;
};

const EPOCH = Date.now();

export function buildNotifications(s: AppState): Notif[] {
  const items: Omit<Notif, 'unread'>[] = [];
  s.trips.forEach((t) => {
    const routeTxt = tripRouteText(t);
    const flightTxt = t.legs.map((lg) => lg.flightNo).join(' / ');
    if (t.cancelled)
      items.push({
        id: 'cancel-' + t.id, icon: 'cancel', tone: 'bad', fresh: true, at: t.cancelledAt ?? t.bookedAt,
        t: 'Trip cancelled', d: 'Your booking ' + routeTxt + ' · PNR ' + t.pnr + ' has been cancelled.', go: 'View booking',
        open: () => goTo({ pathname: '/trip-detail', params: { id: t.id } }),
      });
    if (t.checkedIn)
      items.push({
        id: 'checkin-' + t.id, icon: 'check', tone: 'good', fresh: true, at: t.checkedInAt ?? t.bookedAt,
        t: 'Checked in', d: "You're checked in for " + routeTxt + '. Your boarding pass is ready.', go: 'Boarding pass',
        open: () => goTo({ pathname: '/boarding', params: { id: t.id } }),
      });
    items.push({
      id: 'booked-' + t.id, icon: 'plane', fresh: true, at: t.bookedAt,
      t: 'Booking confirmed', d: AIRLINE.name + ' ' + flightTxt + ' · ' + routeTxt + ' · PNR ' + t.pnr, go: 'View booking',
      open: () => goTo({ pathname: '/trip-detail', params: { id: t.id } }),
    });
  });
  items.sort((a, b) => b.at.getTime() - a.at.getTime());
  items.push({
    id: 'price-drop', icon: 'pin', fresh: true, at: new Date(EPOCH - 2 * 3600000),
    t: 'Price drop', d: 'Fares on ADD → Bahir Dar are down — now from ETB 1,240.', go: 'See flights',
    open: () => {
      startSearch('ADD', 'BJR', todayIso(), 1, 'one', null);
      goTo('/results');
    },
  });
  items.push({
    id: 'checkin-reminder', icon: 'bell', fresh: false, at: new Date(EPOCH - 86400000),
    t: 'Check-in reminder', d: 'Check-in opens 24 hours before departure for domestic flights.', go: 'Go to check-in',
    open: () => showRoot('/check-in'),
  });
  items.push({
    id: 'welcome', icon: 'plane', fresh: false, at: new Date(EPOCH - 3 * 86400000),
    t: 'Welcome to Guxo Flights', d: 'Book, manage, and check in to your flights — all in one place.', go: 'Book a flight',
    open: () => showRoot('/book'),
  });
  return items.map((it) => ({ ...it, unread: it.fresh && !s.readNotifs[it.id] }));
}

export const hasUnread = (s: AppState) => buildNotifications(s).some((n) => n.unread);

export function markRead(ids: string[]) {
  const read = { ...getState().readNotifs };
  ids.forEach((id) => (read[id] = true));
  setState({ readNotifs: read });
}
