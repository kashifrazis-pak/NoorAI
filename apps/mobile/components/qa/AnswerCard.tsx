import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, Clipboard,
} from 'react-native';
import type { AskResponse, Citation } from '../../lib/api';
import { flagAnswer } from '../../lib/api';

function CitationRow({ citation }: { citation: Citation }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.citCard}>
      <TouchableOpacity
        onPress={() => setExpanded(v => !v)}
        style={styles.citHeader}
      >
        <Text style={styles.citLabel}>{citation.label}</Text>
        <Text style={styles.citChevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.citBody}>
          {!!citation.arabic_text && (
            <Text style={styles.arabic}>{citation.arabic_text}</Text>
          )}
          <Text style={styles.citTranslation}>{citation.translation}</Text>
          {citation.grade && (
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeText}>Grade: {citation.grade}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export function AnswerCard({ answer }: { answer: AskResponse }) {
  const confidenceColor = {
    high: '#15803d',
    medium: '#b45309',
    low: '#dc2626',
  }[answer.confidence] ?? '#b45309';

  const handleFlag = () => {
    Alert.prompt(
      'Flag this answer',
      'Describe the issue briefly:',
      async (reason) => {
        if (!reason?.trim()) return;
        await flagAnswer(answer.answer_id, reason);
        Alert.alert('Thank you', 'This answer has been flagged for scholar review.');
      }
    );
  };

  return (
    <View style={styles.card}>
      {/* Confidence */}
      <View style={[styles.confBadge, { borderColor: confidenceColor }]}>
        <Text style={[styles.confText, { color: confidenceColor }]}>
          Confidence: {answer.confidence}
        </Text>
      </View>

      {/* Answer text */}
      <Text style={styles.answerText}>{answer.answer_text}</Text>

      {/* Citations */}
      {answer.citations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Sources ({answer.citations.length})</Text>
          {answer.citations.map((c, i) => <CitationRow key={i} citation={c} />)}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => Clipboard.setString(answer.answer_text)}
          style={styles.actionBtn}
        >
          <Text style={styles.actionText}>Copy</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleFlag} style={styles.flagBtn}>
          <Text style={styles.flagText}>Flag issue</Text>
        </TouchableOpacity>
      </View>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        Educational use only. Not a fatwa. Consult a qualified scholar for religious rulings.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    gap: 12,
  },
  confBadge: {
    alignSelf: 'flex-start', borderWidth: 1,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3,
  },
  confText: { fontSize: 12, fontWeight: '600' },
  answerText: { fontSize: 15, color: '#1f2937', lineHeight: 24 },
  section: { gap: 8 },
  sectionLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' },
  citCard: {
    backgroundColor: '#f0faf3', borderRadius: 12,
    borderWidth: 1, borderColor: '#d6eedb', padding: 12,
  },
  citHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  citLabel: { fontSize: 13, fontWeight: '700', color: '#1A5C38', flex: 1 },
  citChevron: { color: '#1A5C38', fontSize: 12 },
  citBody: { marginTop: 10, gap: 8 },
  arabic: {
    fontFamily: 'System', fontSize: 18, color: '#1A5C38',
    textAlign: 'right', lineHeight: 34,
  },
  citTranslation: { fontSize: 13, color: '#374151', lineHeight: 20 },
  gradeBadge: {
    alignSelf: 'flex-start', backgroundColor: '#fef3c7',
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2,
  },
  gradeText: { fontSize: 11, color: '#92400e' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8 },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  actionText: { fontSize: 14, color: '#1A5C38', fontWeight: '500' },
  flagBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  flagText: { fontSize: 14, color: '#ef4444' },
  disclaimer: {
    fontSize: 11, color: '#9ca3af',
    fontStyle: 'italic', lineHeight: 16,
    borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 8,
  },
});
