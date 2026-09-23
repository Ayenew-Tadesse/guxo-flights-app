import { Redirect } from 'expo-router';

// App entry: start on sign-up, as the web prototype does for new visitors.
export default function Index() {
  return <Redirect href="/sign-up" />;
}
