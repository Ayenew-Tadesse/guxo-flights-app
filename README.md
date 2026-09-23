# Guxo Flights — React Native app

The mobile app for **Guxo Flights**, an Ethiopian domestic flight booking app. Built with [Expo](https://expo.dev) (SDK 57) and Expo Router, it carries over the screens, flows and brand of the [web prototype](https://github.com/Ayenew-Tadesse/Guxo-Flights).

## Screens and navigation

- **Sign up / Log in** — with *Continue as guest*
- **Bottom tabs** — Home, Book, My Trips, Check-in
- **Booking flow** — Search → Choose a flight → Fare & seat → Payment → Booked
- **Notifications** and **Profile** from the Home top bar

Routes live in `src/app/` (Expo Router file-based routing):

```
src/app/
  _layout.tsx          root stack
  index.tsx            redirects to sign-up
  (auth)/              sign-up, log-in
  (tabs)/              home, book, trips, check-in (bottom tabs)
  results.tsx  fare.tsx  payment.tsx  confirmation.tsx
  notifications.tsx  profile.tsx
```

Flight data is mocked in `src/data/flights.ts` until the live API work lands.

## Design system

`src/design-system/` is the shared kit for the Guxo app family (Guxo Flights, Guxo, and later Gexi):

- **Tokens** (`tokens.ts`) — brand colours for each app, plus one shared scale for spacing, radius and type
- **Brand theming** (`theme.tsx`) — wrap an app in `<BrandProvider brand="guxoFlights">` (or `"guxo"`) and every component re-skins
- **Components** (`components.tsx`) — `Text`, `Button`, `IconButton`, `TextField`, `Choice`, `Card`, `Row`, `Badge`, `Divider`, `Screen`

Import from `@/design-system`. Open **Profile → Design system** in the app to see every token and component in each brand.

## Run it

```bash
npm install
npx expo start        # scan the QR code with Expo Go, or press w for web
```

Checks: `npx tsc --noEmit` and `npx expo lint`.

---

Part of Ayenew Tadesse Shiferaw's UI/UX portfolio, alongside [Guxo](https://github.com/Ayenew-Tadesse/Guxo).
