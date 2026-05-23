import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getDaily, type DailyContent } from '../../lib/api';

export function DailyCard() {
  const [daily, setDaily] = useState<DailyContent | null>(null);
  const [tab, setTab] = useState<'verse' | 'hadith'>('verse');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDaily().then(setDaily).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color="#1A5C38" />
      </View>
    );
  }
  if (!daily) return null;

  const item = tab === 'verse' ? daily.verse : daily.hadith;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Reminder</Text>
        <Text style={styles.date}>{daily.date}</Text>
      </View>

      <View style={styles.tabs}>
        {(['verse', 'hadith'] as const).map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'verse' ? 'Quran' : 'Hadith'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {item ? (
        <View style={styles.content}>
          <Text style={styles.arabic}>{item.arabic_text}</Text>
          <Text style={styles.translation}>{item.translation}</Text>
          <Text style={styles.reference}>{item.reference}</Text>
          {'grade' in item && item.grade && (
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeText}>{item.grade}</Text>
            </View>
          )}
        </View>
      ) : (
        <Text style={styles.empty}>No content scheduled for today.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    gap: 12,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '700', color: '#1A5C38' },
  date: { fontSize: 12, color: '#9ca3af' },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: {
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: '#d1d5db',
  },
  tabActive: { backgroundColor: '#1A5C38', borderColor: '#1A5C38' },
  tabText: { fontSize: 13, color: '#6b7280' },
  tabTextActive: { color: '#fff', fontWeight: '600' },
  content: { gap: 8 },
  arabic: { fontSize: 20, color: '#1A5C38', textAlign: 'right', lineHeight: 38 },
  translation: { fontSize: 14, color: '#374151', lineHeight: 22 },
  reference: { fontSize: 12, fontWeight: '600', color: '#1A5C38' },
  gradeBadge: {
    alignSelf: 'flex-start', backgroundColor: '#fef3c7',
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2,
  },
  gradeText: { fontSize: 11, color: '#92400e' },
  empty: { fontSize: 13, color: '#9ca3af' },
});
