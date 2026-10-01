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
| Search form (`src/components/search-form.tsx`, on Home and Book) | `form`, `recent` | `setForm()` / `swapForm()` as you edit; `runSearch()` starts the booking (clears earlier picks, loads results through the API client) and adds it to recent searches; `rerun()` repeats a recent one |
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
| `guxo_booking` | The booking in progress (below) |

## The booking draft

`src/state/booking.ts` is the booking store (Zustand + `persist`): search,
chosen flights, results, fare, seats, names, email and the step you're on
(`results`, `fare` or `payment`, set when each screen comes into focus). It's
saved on every change, so closing the app mid-booking and coming back shows
**Continue your booking** on Home and Book, which reopens the same step with
the earlier steps underneath (Back still works). **Start over** clears it, and
so does paying. A draft for a day that has passed is dropped.

Before payment every field is checked (`bookingErrors`): a fare, a first and
last name for each traveller, a valid email, and one seat per traveller on
each leg. Errors show under a field once you leave it, and all of them after
pressing Continue. Payment opened from an unfinished draft goes back to Fare
& Seats.

Trips live for the session, as in the prototype.

## The search form

The form's fields (`form`: From and To as typed, dates, trip type,
travellers) are in the booking store too, so Home and Book show the same
search and it's remembered next time. Editing the form doesn't touch a
booking in progress; pressing Search does. The last three different searches
(`recent`) are listed under the form to run again; dates that have passed
move to today, keeping a round trip's length. **Clear** empties the list.

## The API client

Network calls go through one module, `src/api/client.ts`: `request(path,
options)` adds the base URL and headers, gives up after 10 seconds
(AbortController), parses JSON and throws an `ApiError` whose `kind` is
`network`, `timeout`, `http` or `parse`; `friendlyMessage(e)` is what the
screen shows. Before each call it checks the connection (expo-network), so
with Wi-Fi off you get "You're offline" straight away.

`src/api/flights.ts` has `searchFlights(search)`, which returns a leg's
flights and the date strip's prices. There's no backend yet: without
`EXPO_PUBLIC_API_URL` the client answers from mock routes (`mockRoute()`),
built on the sample flight generator and passed through JSON like a real
response. Set `EXPO_PUBLIC_API_URL` to use a server with the same response
shape; `EXPO_PUBLIC_API_MOCK_DELAY_MS` makes the mock slow (e.g. 12000 to see
the timeout).

The booking store loads results with `loadLegResults()` (search, date strip,
the return leg) and keeps `loadStatus` (`loading`, `ready`, `error`) and
`loadError` for this session only. Results shows a spinner while loading
and a friendly message with **Try again** (`retryResults()`) when it fails.

## Next

1. A live flight API behind a Supabase Edge Function (so no key is in the
   app), answering `GET /flights/search` in the shape above.
