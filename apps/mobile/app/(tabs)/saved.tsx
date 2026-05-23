import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SavedScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.center}>
        <Text style={styles.icon}>♡</Text>
        <Text style={styles.title}>No saved items yet</Text>
        <Text style={styles.subtitle}>
          Sign in and tap ♡ Save on any answer to save it here for offline access.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  icon: { fontSize: 48, color: '#d1d5db' },
  title: { fontSize: 18, fontWeight: '700', color: '#6b7280' },
  subtitle: { fontSize: 14, color: '#9ca3af', textAlign: 'center', lineHeight: 22 },
});
