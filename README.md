# Guxo Flights — React Native app

The mobile app for **Guxo Flights**, an Ethiopian domestic flight booking app. Built with [Expo](https://expo.dev) (SDK 57) and Expo Router, it is a screen-by-screen port of the [web prototype](https://github.com/Ayenew-Tadesse/Guxo-Flights): same Poppins type, gradients, hero photo, flows and responsive layout.

## Screens and navigation

- **Splash → Sign up / Log in** — typed mm/dd/yyyy date of birth, password strength meter, *Continue as guest*
- **Bottom tabs** — Home, Book, My Trips, Check-in
- **Booking flow** — Search (one way or round trip, From/To swap) → Results (date strip, stops / time / price filters, flight details) → Fare & seats → Payment (card, phone, bank counter; saved cards; spend Guxo Points) → Booked
- **Trips** — booking details, rebook, cancel; check-in and boarding pass with QR code
- **Notifications** — read / unread, each opens the page it's about
- **Profile** — personal details, payment methods, connected apps (Guxo, Gexi), Guxo Points

Routes live in `src/app/` (Expo Router file-based routing):

```
src/app/
  _layout.tsx          fonts, app column, page loader, toast, confirm dialog
  index.tsx            splash
  (auth)/              sign-up, log-in
  (tabs)/              home, book, trips, check-in
  results  fare  payment  confirmation  trip-detail  boarding
  notifications  profile  personal-details  cards  add-card
  connected-apps  points  design-system
```

App state lives in `src/state/` (a small store, navigation helpers, notifications, trip actions). Flight data is generated in `src/data/flights.ts` until the live API work lands. The account, its points, cards and linked apps are saved on the device with the same keys as the web prototype.

## Design system

`src/design-system/` is the shared kit for the Guxo app family (Guxo Flights, Guxo, and later Gexi):

- **Tokens** (`tokens.ts`) — brand colours for each app, Poppins weights, radii and the responsive tiers (column width, type scale, padding)
- **Brand theming** (`theme.tsx`) — `<BrandProvider brand="guxoFlights">` (or `"guxo"`) re-skins every component; `useLayout()` gives the current tier
- **Components** (`components.tsx`) — `T`, `Heading`, `Button`, `IconButton`, `Input`, `Field`, `Card`, `Badge`, `Gradient`, `RouteDots`, `Screen`, `TopBar` and more
- **Controls** (`controls.tsx` / `controls.web.tsx`) — date, select, range and suggestion inputs; the web versions use the browser's own controls, like the prototype
- **Icons** (`icons.tsx`) — the prototype's line icons as SVG

Import from `@/design-system`. The `/design-system` route shows every token and component in each brand.

## Run it

```bash
npm install
npx expo start        # scan the QR code with Expo Go, or press w for web
```

Checks: `npx tsc --noEmit` and `npx expo lint`.

---

Part of Ayenew Tadesse Shiferaw's UI/UX portfolio, alongside [Guxo](https://github.com/Ayenew-Tadesse/Guxo).
