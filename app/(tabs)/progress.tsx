import { StyleSheet, ActivityIndicator, ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { useQadaState } from '@/src/state/useQadaState';
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
  const { state, loading } = useQadaState();

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

  // Calculate total remaining across all prayers
  const totalRemaining = PRAYERS.reduce((sum, prayer) => sum + state.remaining[prayer], 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>
          Progress
        </ThemedText>

        <View style={styles.summarySection}>
          <ThemedText style={styles.summaryText}>
            Total days counted: {state.eligibleDays}
          </ThemedText>
          <ThemedText style={styles.summaryText}>
            Last updated: {formatDate(state.updatedAt)}
          </ThemedText>
          <ThemedText style={styles.summaryText}>
            Total remaining (all prayers): {totalRemaining}
          </ThemedText>
        </View>

        <View style={styles.prayersSection}>
          {PRAYERS.map((prayer) => (
            <View key={prayer} style={styles.prayerCard}>
              <ThemedText type="subtitle" style={styles.prayerName}>
                {prayer}
              </ThemedText>
              <View style={styles.prayerDetails}>
                <ThemedText style={styles.prayerDetail}>
                  Remaining: {state.remaining[prayer]}
                </ThemedText>
                <ThemedText style={styles.prayerDetail}>
                  Total: {state.totals[prayer]}
                </ThemedText>
                <ThemedText style={styles.prayerDetail}>
                  Percent missed: {state.percentMissed[prayer]}%
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        <ThemedText style={styles.noteText}>
          Progress updates automatically as you log prayers on Home.
        </ThemedText>
      </ScrollView>
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
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  title: {
    color: '#ffffff',
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
  summarySection: {
    gap: 8,
  },
  summaryText: {
    color: '#ffffff',
    fontSize: 16,
  },
  prayersSection: {
    gap: 12,
  },
  prayerCard: {
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#1a1a1a',
    gap: 8,
  },
  prayerName: {
    color: '#ffffff',
  },
  prayerDetails: {
    gap: 4,
  },
  prayerDetail: {
    color: '#cccccc',
    fontSize: 14,
  },
  noteText: {
    color: '#999999',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
