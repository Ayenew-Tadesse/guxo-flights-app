import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { Colors } from '@/constants/theme';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

function tabIcon(name: IconName) {
  return function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <MaterialIcons name={name} size={size} color={color} />;
  };
}

// The four bottom tabs from the web prototype: Home, Book, My Trips, Check-in.
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.inkFaint,
        tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.line },
        tabBarLabelStyle: { fontWeight: '600' },
      }}>
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="book" options={{ title: 'Book', tabBarIcon: tabIcon('flight') }} />
      <Tabs.Screen name="trips" options={{ title: 'My Trips', tabBarIcon: tabIcon('luggage') }} />
      <Tabs.Screen name="check-in" options={{ title: 'Check-in', tabBarIcon: tabIcon('airplane-ticket') }} />
    </Tabs>
  );
}
