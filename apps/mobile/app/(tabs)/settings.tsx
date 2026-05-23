import React, { useState } from 'react';
import {
  View, Text, Switch, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'ur', label: 'اردو' },
  { code: 'fr', label: 'Français' },
  { code: 'tr', label: 'Türkçe' },
];

export default function SettingsScreen() {
  const [language, setLanguage] = useState('en');
  const [dailyNotif, setDailyNotif] = useState(false);
  const [hadithNotif, setHadithNotif] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          {LANGUAGES.map(l => (
            <TouchableOpacity
              key={l.code}
              onPress={() => setLanguage(l.code)}
              style={styles.row}
            >
              <Text style={styles.rowLabel}>{l.label}</Text>
              {language === l.code && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Daily Verse</Text>
            <Switch
              value={dailyNotif}
              onValueChange={setDailyNotif}
              trackColor={{ true: '#1A5C38' }}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Hadith of the Day</Text>
            <Switch
              value={hadithNotif}
              onValueChange={setHadithNotif}
              trackColor={{ true: '#1A5C38' }}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              NoorAI provides Islamic Q&A for educational purposes only. All answers are
              sourced from the Quran and authentic (sahih/hasan) Hadith collections.
              Responses are not fatwas. Always consult a qualified scholar.
            </Text>
          </View>
          <Text style={styles.version}>NoorAI v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { padding: 16, gap: 20 },
  section: {
    backgroundColor: '#fff', borderRadius: 16,
    overflow: 'hidden', shadowColor: '#000',
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: '#6b7280',
    textTransform: 'uppercase', letterSpacing: 0.5,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 13,
    borderTopWidth: 1, borderTopColor: '#f3f4f6',
  },
  rowLabel: { fontSize: 15, color: '#1f2937' },
  check: { fontSize: 16, color: '#1A5C38', fontWeight: '700' },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#f3f4f6',
  },
  switchLabel: { fontSize: 15, color: '#1f2937' },
  infoCard: { margin: 12, backgroundColor: '#fef9c3', borderRadius: 12, padding: 12 },
  infoText: { fontSize: 13, color: '#713f12', lineHeight: 20 },
  version: { fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: 12 },
});
