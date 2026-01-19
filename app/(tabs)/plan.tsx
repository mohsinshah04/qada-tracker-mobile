import { useState, useEffect } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  View,
  Pressable,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { useQada } from '@/src/state/QadaProvider';
import { PRAYERS, Prayer } from '@/src/core/types';
import { startOfTodayLocal, formatLocalDateToYmd } from '@/src/core/date';

export default function PlanScreen() {
  const { state, loading } = useQada();
  const [paceText, setPaceText] = useState<Record<Prayer, string>>({
    FAJR: '',
    DHUHR: '',
    ASR: '',
    MAGHRIB: '',
    ISHA: '',
    WITR: '',
  });
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Track keyboard visibility (iOS only for Done button)
  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

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
            Plan
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

  // Parse pace values (blank -> 0, clamp >= 0)
  const pace: Record<Prayer, number> = {} as Record<Prayer, number>;
  PRAYERS.forEach((prayer) => {
    const text = paceText[prayer];
    const parsed = text === '' ? 0 : Math.max(0, parseInt(text, 10) || 0);
    pace[prayer] = parsed;
  });

  // Calculate days for each prayer
  const daysForPrayer: Record<Prayer, number> = {} as Record<Prayer, number>;
  let hasImpossible = false;
  let maxDays = 0;
  let limitingPrayer: Prayer | null = null;

  PRAYERS.forEach((prayer) => {
    const remaining = state.remaining[prayer];
    const p = pace[prayer];

    if (remaining === 0) {
      daysForPrayer[prayer] = 0;
    } else if (p <= 0) {
      daysForPrayer[prayer] = Infinity; // Mark as impossible
      hasImpossible = true;
    } else {
      const days = Math.ceil(remaining / p);
      daysForPrayer[prayer] = days;
      if (days > maxDays) {
        maxDays = days;
        limitingPrayer = prayer;
      }
    }
  });

  const daysNeeded = hasImpossible ? 0 : maxDays;

  // Calculate finish date
  const today = startOfTodayLocal();
  const finishDate = daysNeeded > 0 ? new Date(today) : null;
  if (finishDate) {
    finishDate.setDate(finishDate.getDate() + daysNeeded);
  }
  const finishYmd = finishDate ? formatLocalDateToYmd(finishDate) : '';

  const totalRemaining = PRAYERS.reduce((sum, prayer) => sum + state.remaining[prayer], 0);

  // Handle pace input change
  const handlePaceChange = (prayer: Prayer, value: string) => {
    // Strip non-digits
    const digitsOnly = value.replace(/\D/g, '');
    setPaceText((prev) => ({
      ...prev,
      [prayer]: digitsOnly,
    }));
  };

  // Preset handlers
  const handlePresetOneEach = () => {
    const newPace: Record<Prayer, string> = {} as Record<Prayer, string>;
    PRAYERS.forEach((prayer) => {
      newPace[prayer] = '1';
    });
    setPaceText(newPace);
  };

  const handlePresetZeroAll = () => {
    const newPace: Record<Prayer, string> = {} as Record<Prayer, string>;
    PRAYERS.forEach((prayer) => {
      newPace[prayer] = '';
    });
    setPaceText(newPace);
  };

  const renderContent = () => (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Plan
      </ThemedText>

      {/* Daily make-up pace section */}
      <View style={styles.card}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Daily make-up pace
        </ThemedText>
        <ThemedText style={styles.helperText}>
          Enter how many of each prayer you can make up per day. Whole numbers only.
        </ThemedText>

        {/* Preset buttons */}
        <View style={styles.presetButtons}>
          <Pressable onPress={handlePresetOneEach} style={styles.presetButton}>
            <ThemedText style={styles.presetButtonText}>Preset: 1 each</ThemedText>
          </Pressable>
          <Pressable onPress={handlePresetZeroAll} style={styles.presetButton}>
            <ThemedText style={styles.presetButtonText}>Preset: 0 all</ThemedText>
          </Pressable>
        </View>

        {/* Pace inputs */}
        {PRAYERS.map((prayer) => (
          <View key={prayer} style={styles.paceRow}>
            <ThemedText style={styles.prayerName}>{prayer}:</ThemedText>
            <TextInput
              style={styles.paceInput}
              placeholder="0"
              value={paceText[prayer]}
              onChangeText={(value) => handlePaceChange(prayer, value)}
              keyboardType="number-pad"
              placeholderTextColor="#999"
            />
            <ThemedText style={styles.perDayLabel}>per day</ThemedText>
          </View>
        ))}
      </View>

      {/* Results */}
      {totalRemaining === 0 ? (
        <View style={styles.card}>
          <ThemedText style={styles.resultText}>You're all caught up.</ThemedText>
        </View>
      ) : hasImpossible ? (
        <View style={styles.card}>
          <ThemedText style={styles.errorText}>
            You have remaining prayers with 0/day pace. Increase the pace to calculate a finish estimate.
          </ThemedText>
        </View>
      ) : (
        <View style={styles.card}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Result
          </ThemedText>
          <View style={styles.resultRow}>
            <ThemedText style={styles.resultLabel}>At this pace, you'll finish in:</ThemedText>
            <ThemedText style={styles.resultValue}>{daysNeeded} days</ThemedText>
          </View>
          <View style={styles.resultRow}>
            <ThemedText style={styles.resultLabel}>Estimated finish date:</ThemedText>
            <ThemedText style={styles.resultValue}>{finishYmd}</ThemedText>
          </View>
          {limitingPrayer && (
            <View style={styles.resultRow}>
              <ThemedText style={styles.resultLabel}>Limiting prayer:</ThemedText>
              <ThemedText style={styles.resultValue}>{limitingPrayer}</ThemedText>
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.wrapper}>
          {renderContent()}
          {/* iOS Done button */}
          {Platform.OS === 'ios' && isKeyboardVisible && (
            <View style={styles.doneButtonContainer}>
              <Pressable onPress={() => Keyboard.dismiss()} style={styles.doneButton}>
                <ThemedText style={styles.doneButtonText}>Done</ThemedText>
              </Pressable>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
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
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 12,
    gap: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
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
  card: {
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#1a1a1a',
    gap: 8,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  helperText: {
    color: '#999999',
    fontSize: 11,
    fontStyle: 'italic',
  },
  presetButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#0a7ea4',
    borderRadius: 4,
  },
  presetButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  paceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  prayerName: {
    color: '#ffffff',
    fontSize: 12,
    minWidth: 60,
    fontWeight: '600',
  },
  paceInput: {
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 4,
    padding: 6,
    fontSize: 12,
    color: '#ffffff',
    backgroundColor: '#0a0a0a',
    minWidth: 50,
    textAlign: 'center',
  },
  perDayLabel: {
    color: '#cccccc',
    fontSize: 11,
  },
  resultText: {
    color: '#ffffff',
    fontSize: 13,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  resultLabel: {
    color: '#cccccc',
    fontSize: 12,
    flex: 1,
  },
  resultValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  doneButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#666666',
    paddingVertical: 8,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  doneButtonText: {
    color: '#0a7ea4',
    fontSize: 16,
    fontWeight: '600',
  },
});
