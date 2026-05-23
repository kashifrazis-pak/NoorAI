import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { search, type SearchResult } from '../../lib/api';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await search(query, 'en', type);
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search Quran or Hadith..."
            placeholderTextColor="#9ca3af"
            style={styles.input}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filters}>
          {(['all', 'verse', 'hadith'] as const).map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setType(t)}
              style={[styles.filter, type === t && styles.filterActive]}
            >
              <Text style={[styles.filterText, type === t && styles.filterTextActive]}>
                {t === 'all' ? 'All' : t === 'verse' ? 'Quran' : 'Hadith'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#1A5C38" size="large" />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.result}>
                <View style={styles.resultHeader}>
                  <View style={[
                    styles.typeBadge,
                    { backgroundColor: item.type === 'verse' ? '#D6EEDB' : '#fef3c7' },
                  ]}>
                    <Text style={[
                      styles.typeText,
                      { color: item.type === 'verse' ? '#1A5C38' : '#92400e' },
                    ]}>
                      {item.type === 'verse' ? 'Quran' : 'Hadith'}
                    </Text>
                  </View>
                  <Text style={styles.resultLabel} numberOfLines={1}>{item.label}</Text>
                </View>
                {!!item.arabic_text && (
                  <Text style={styles.arabic}>{item.arabic_text}</Text>
                )}
                <Text style={styles.translation} numberOfLines={3}>
                  {item.translation}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              query && !loading ? (
                <Text style={styles.empty}>No results for &ldquo;{query}&rdquo;</Text>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  container: { flex: 1, padding: 16 },
  searchBar: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#d1d5db',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, backgroundColor: '#fff', color: '#111',
  },
  searchBtn: {
    backgroundColor: '#1A5C38', borderRadius: 12,
    paddingHorizontal: 16, justifyContent: 'center',
  },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filter: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff',
  },
  filterActive: { backgroundColor: '#1A5C38', borderColor: '#1A5C38' },
  filterText: { fontSize: 13, color: '#6b7280' },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  list: { gap: 12 },
  result: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    gap: 8,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  typeText: { fontSize: 11, fontWeight: '700' },
  resultLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: '#374151' },
  arabic: { fontSize: 17, color: '#1A5C38', textAlign: 'right', lineHeight: 32 },
  translation: { fontSize: 13, color: '#4b5563', lineHeight: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40, fontSize: 14 },
});
