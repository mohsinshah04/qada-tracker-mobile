import { StyleSheet, ActivityIndicator, View, Pressable, FlatList, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { useQada } from '@/src/state/QadaProvider';
import { PRAYERS, Prayer } from '@/src/core/types';

// Format ISO date string to readable format
function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export default function ProgressScreen() {
  const { state, loading } = useQada();

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </SafeAreaView>
    );
  }

  if (!state) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.emptyContainer}>
          <ThemedText type="title" style={styles.title}>
            Progress
          </ThemedText>
          <ThemedText style={styles.emptyText}>
            No QADA data found. Please complete setup first.
          </ThemedText>
          <Pressable onPress={() => router.replace('/setup')} style={styles.setupButton}>
            <ThemedText style={styles.setupButtonText}>Go to Setup</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const renderPrayerCard = ({ item: prayer }: { item: Prayer }) => {
    return (
      <View style={styles.card}>
        <ThemedText style={styles.prayerName}>{prayer}</ThemedText>
        <Text
          style={styles.prayerRemaining}
          textAlignVertical="center"
          includeFontPadding={false}>
          {state.remaining[prayer]}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Progress
          </ThemedText>
          <ThemedText style={styles.lastUpdatedText}>
            Last updated: {formatDate(state.updatedAt)}
          </ThemedText>
        </View>

        <FlatList
          data={PRAYERS}
          renderItem={renderPrayerCard}
          keyExtractor={(item) => item}
          numColumns={1}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
          style={styles.list}
          removeClippedSubviews={false}
          key="progress-prayers-list"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  container: {
    flex: 1,
    padding: 8,
  },
  header: {
    marginBottom: 8,
    gap: 2,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
  },
  emptyText: {
    color: '#cccccc',
    textAlign: 'center',
    fontSize: 16,
  },
  setupButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    marginTop: 8,
  },
  setupButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  lastUpdatedText: {
    color: '#cccccc',
    fontSize: 11,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    gap: 6,
  },
  card: {
    width: '100%',
    flex: 1,
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  prayerName: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  prayerRemaining: {
    color: '#ffffff',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: 'bold',
  },
});
