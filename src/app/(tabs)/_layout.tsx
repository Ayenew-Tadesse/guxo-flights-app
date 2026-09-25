import { Tabs } from 'expo-router';

import { TabBar } from '@/components/ui';
import { withLoader } from '@/state/nav';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => (
        <TabBar
          active={state.routes[state.index].name}
          onSelect={(route) => withLoader(() => navigation.navigate(route))}
        />
      )}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="book" options={{ title: 'Book' }} />
      <Tabs.Screen name="trips" options={{ title: 'My Trips' }} />
      <Tabs.Screen name="check-in" options={{ title: 'Check-in' }} />
    </Tabs>
  );
}
