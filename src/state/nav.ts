/**
 * Navigation with the prototype's brief page loader: the spinner shows,
 * then the route changes. Screens call these instead of the router directly.
 */
import { router, type Href } from 'expo-router';

import { setState } from './store';

const NAV_DELAY = 420;
let timer: ReturnType<typeof setTimeout> | null = null;

export function withLoader(fn: () => void) {
  if (timer) clearTimeout(timer);
  setState({ loading: true });
  timer = setTimeout(() => {
    fn();
    setState({ loading: false });
  }, NAV_DELAY);
}

export const goTo = (href: Href) => withLoader(() => router.push(href));

export const goBack = () =>
  withLoader(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  });

/** Clear the stack and open a tab (like tapping it in the tab bar). */
export const showRoot = (href: '/home' | '/book' | '/trips' | '/check-in') =>
  withLoader(() => {
    if (router.canDismiss()) router.dismissAll();
    router.navigate(href);
  });

/** Clear the stack and replace it with one screen (auth changes). */
export const resetTo = (href: Href) =>
  withLoader(() => {
    if (router.canDismiss()) router.dismissAll();
    router.replace(href);
  });
