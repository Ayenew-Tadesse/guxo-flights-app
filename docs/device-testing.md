# Testing on a real phone (10 minutes, Expo Go)

A browser can't show the keyboard, the notch or a real network drop. Run
`npx expo start`, open the app in **Expo Go** on your phone, and go through
this list. Note anything odd with a screenshot.

## 1. Keyboard (Fare & Seats, Payment)
- Tap **Passenger 1 full name**, then **Email**: the field you're typing in
  stays visible above the keyboard.
- On Payment → Card, tap **CVC** (the last field): you can still see it and
  scroll to **Pay & confirm** without closing the keyboard.
- The email keyboard shows "@"; the card number and CVC keyboards are numbers.

## 2. Safe areas
- Top: the back button and screen titles aren't under the notch / camera.
- Bottom: the tab bar and **Pay & confirm** aren't under the home indicator.
- Turn the phone sideways on Results: nothing hides behind the notch.

## 3. Network
- Search with Wi-Fi and mobile data **off**: "You're offline…" with **Try
  again**. Turn Wi-Fi back on and tap **Try again**: results load.
- Turn Wi-Fi off **on the Results screen**, tap a different date: the same
  friendly message, no crash.
- Slow network (iPhone: Settings → Developer → Network Link Conditioner →
  3G; Android: a weak signal spot): a spinner shows while searching.

## 4. Taps
- Passenger **−** / **+**, seats and **Flight details** are easy to hit with a
  thumb.

## 5. Inspecting state while testing
- Shake the phone (or press `m` in the terminal) for the **Expo dev menu**.
- Press `j` in the terminal to open **React Native DevTools**: Components
  shows each screen's props and state; the Console shows API errors
  (`ApiError` has a `kind`: network, timeout, http, parse).
- To try the timeout: `EXPO_PUBLIC_API_MOCK_DELAY_MS=12000 npx expo start`
  → after 10 s, "This is taking longer than usual."
