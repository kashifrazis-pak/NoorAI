import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { askQuestion } from '../../lib/api';
import type { AskResponse } from '../../lib/api';
import { AnswerCard } from '../../components/qa/AnswerCard';
import { DailyCard } from '../../components/qa/DailyCard';

const SUGGESTIONS = [
  'What does Islam say about patience?',
  'How do I perform Wudu correctly?',
  'What is the ruling on fasting in Ramadan?',
  'What does the Quran say about parents?',
];

export default function AskScreen() {
  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<AskResponse | null>(null);

  const submit = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setAnswer(null);
    try {
      const res = await askQuestion(q.trim(), language);
      setAnswer(res);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      Alert.alert('Error', detail ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Input */}
        <View style={styles.card}>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="Ask an Islamic question..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
            maxLength={2000}
            style={styles.input}
          />
          <TouchableOpacity
            onPress={() => submit(question)}
            disabled={!question.trim() || loading}
            style={[styles.btn, (!question.trim() || loading) && styles.btnDisabled]}
          >
            <Text style={styles.btnText}>Ask NoorAI</Text>
          </TouchableOpacity>
        </View>

        {/* Suggested questions */}
        <View style={styles.suggestions}>
          <Text style={styles.suggestLabel}>Suggested</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {SUGGESTIONS.map(s => (
              <TouchableOpacity
                key={s}
                onPress={() => { setQuestion(s); submit(s); }}
                style={styles.chip}
              >
                <Text style={styles.chipText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#1A5C38" size="large" />
            <Text style={styles.loadingText}>Searching Quran & Hadith sources…</Text>
          </View>
        )}

        {/* Answer */}
        {answer && !loading && <AnswerCard answer={answer} />}

        {/* Daily content when no answer */}
        {!answer && !loading && <DailyCard />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { padding: 16, gap: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 16, shadowColor: '#000',
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  input: {
    fontSize: 16, color: '#111827',
    borderWidth: 1, borderColor: '#d1d5db',
    borderRadius: 12, padding: 12,
    minHeight: 90, textAlignVertical: 'top',
    marginBottom: 12,
  },
  btn: {
    backgroundColor: '#1A5C38', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  suggestions: { gap: 8 },
  suggestLabel: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  chip: {
    backgroundColor: '#D6EEDB', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    marginRight: 8, borderWidth: 1, borderColor: '#2E8648',
  },
  chipText: { fontSize: 12, color: '#1A5C38' },
  loadingBox: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  loadingText: { color: '#6b7280', fontSize: 14 },
});
