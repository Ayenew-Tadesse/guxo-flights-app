# Booking flow and state

How a booking moves through the app, what each screen reads and writes, and
where that state lives.

## The flow

```
Home / Book (Search form)
   │  Search flights
   ▼
Results ── round trip: pick outbound, then the same screen shows the return leg
   │  Select a flight
   ▼
Fare & Seats ── fare tier, passenger names, contact email, seats per leg
   │  Continue to payment
   ▼
Payment ── payment method, points; Pay & confirm creates the Trip
   │
   ▼
Confirmation ── (stack: My Trips underneath, so Back lands there)
```

Back on any step returns to the previous screen (`goBack` in `src/state/nav.ts`);
with nothing to go back to it opens Home.

## What each screen reads and writes

| Screen | Reads | Writes |
| --- | --- | --- |
| Search form (`src/components/search-form.tsx`, on Home and Book) | origin, destination | `startSearch()`: origin, destination, dates, trip type, passengers; clears earlier selections; loads results |
| Results (`src/app/results.tsx`) | flights, date strip, booking leg, trip type, passengers | outbound / return flight, booking leg, depart / return date (date strip); resets fare, seats, names and email when a new flight is chosen |
| Fare & Seats (`src/app/fare.tsx`) | chosen flights, passengers, fare, seats, names, email | fare tier, seats (outbound and return), names, email; the first traveller's name and email are also saved for next time |
| Payment (`src/app/payment.tsx`) | everything above, the account (cards, points) | a new Trip, points, a saved card |
| Confirmation (`src/app/confirmation.tsx`) | the new Trip | — |

Local UI choices (results filters and sort, the payment form fields) stay in
the screens: they don't need to outlive the screen.

## Where state lives

- **Zustand** (`zustand`) holds app state. It's small, needs no provider,
  works the same on phones and the web, and screens can subscribe to just the
  fields they use. `src/state/store.ts` keeps the existing `useApp()`,
  `getState()` and `setState()` helpers on top of it, so screens didn't have to
  change.
- **Storage** (`src/state/storage.ts`): the web keeps using `localStorage`
  (same keys as the web prototype); phones now use **AsyncStorage**, read
  once at startup (`hydrateStorage`) and written on every save. Before this,
  phones kept everything in memory only, so the account was lost when the app
  closed.

| Key | What |
| --- | --- |
| `hidgo_account` | The account, points, saved cards, linked apps |
| `hidgo_traveler` | The first traveller's name and email, to prefill Fare & Seats |

Trips live for the session, as in the prototype.

## Next

1. A persisted **booking draft**: search, chosen flights, fare, seats,
   passengers, email and the step you're on, with "Continue your booking" on
   Home and Book, cleared after booking or on "Start over".
2. The Search form reading and writing the booking store, with the last
   search remembered and recent searches to run again.
3. An API client layer so Results can swap the sample flights for a live
   flight API (behind a Supabase Edge Function, so no key is in the app).
