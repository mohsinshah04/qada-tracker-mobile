import {
  StyleSheet,
  ActivityIndicator,
  View,
  Pressable,
  FlatList,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { useQada } from '@/src/state/QadaProvider';
import { PRAYERS, Prayer } from '@/src/core/types';

export default function HomeScreen() {
  const { state, setState, loading } = useQada();

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
            Home
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

  // Handle delta update for a specific prayer
  const handleDelta = (prayer: Prayer, delta: number) => {
    setState((prev) => {
      if (!prev) return prev;

      const currentRemaining = prev.remaining[prayer];
      // Clamp: min = 0, no max cap (can exceed totals for future missed prayers)
      const nextRemaining = Math.max(0, currentRemaining + delta);

      return {
        ...prev,
        remaining: {
          ...prev.remaining,
          [prayer]: nextRemaining,
        },
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const renderPrayerCard = ({ item: prayer }: { item: Prayer }) => {
    const remaining = state.remaining[prayer];
    const canDecrease = remaining > 0;

    return (
      <View style={styles.card}>
        <ThemedText style={styles.prayerName}>{prayer}</ThemedText>
        <Text
          style={styles.remainingBig}
          textAlignVertical="center"
          includeFontPadding={false}>
          {remaining}
        </Text>
        <View style={styles.deltaButtons}>
          <Pressable
            onPress={() => handleDelta(prayer, -5)}
            style={[
              styles.deltaButton,
              !canDecrease && styles.deltaButtonDisabled,
            ]}
            disabled={!canDecrease}>
            <ThemedText
              style={[
                styles.deltaButtonText,
                !canDecrease && styles.deltaButtonTextDisabled,
              ]}>
              -5
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => handleDelta(prayer, -1)}
            style={[
              styles.deltaButton,
              !canDecrease && styles.deltaButtonDisabled,
            ]}
            disabled={!canDecrease}>
            <ThemedText
              style={[
                styles.deltaButtonText,
                !canDecrease && styles.deltaButtonTextDisabled,
              ]}>
              -1
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => handleDelta(prayer, 1)}
            style={styles.deltaButton}>
            <ThemedText style={styles.deltaButtonText}>+1</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => handleDelta(prayer, 5)}
            style={styles.deltaButton}>
            <ThemedText style={styles.deltaButtonText}>+5</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Home
        </ThemedText>

        <FlatList
          data={PRAYERS}
          renderItem={renderPrayerCard}
          keyExtractor={(item) => item}
          numColumns={1}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
          style={styles.list}
          removeClippedSubviews={false}
          key="home-prayers-list"
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
  title: {
    color: '#ffffff',
    fontSize: 18,
    marginBottom: 8,
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
    paddingVertical: 8,
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
  remainingBig: {
    color: '#ffffff',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: 'bold',
  },
  deltaButtons: {
    flexDirection: 'row',
    gap: 4,
    width: '100%',
    marginTop: 2,
  },
  deltaButton: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deltaButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  deltaButtonDisabled: {
    backgroundColor: '#333333',
    opacity: 0.6,
  },
  deltaButtonTextDisabled: {
    color: '#999999',
  },
});
