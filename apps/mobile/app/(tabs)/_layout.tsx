import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1A5C38',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { borderTopColor: '#e5e7eb', paddingBottom: 4 },
        headerStyle: { backgroundColor: '#1A5C38' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ask',
          tabBarLabel: 'Ask',
          headerTitle: 'نور NoorAI',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarLabel: 'Search',
          headerTitle: 'Search Sources',
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarLabel: 'Saved',
          headerTitle: 'Saved Items',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          headerTitle: 'Settings',
        }}
      />
    </Tabs>
  );
}
