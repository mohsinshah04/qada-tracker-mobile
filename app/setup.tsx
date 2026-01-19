import { useState } from 'react';
import {
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  View,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { useQadaState } from '@/src/state/useQadaState';
import { PRAYERS, Prayer, PrayerMap } from '@/src/core/types';
import { createInitialState, computeEligibleDays } from '@/src/core/calc';
import { parseYmdToLocalMidnight, formatLocalDateToYmd, startOfTodayLocal } from '@/src/core/date';

type Gender = 'male' | 'female' | null;

// Calculate current age in years from birthdate
function calculateCurrentAge(birthDateYmd: string): number | null {
  const birthDate = parseYmdToLocalMidnight(birthDateYmd);
  if (!birthDate) {
    return null;
  }

  const today = startOfTodayLocal();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Adjust if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export default function SetupScreen() {
  const { setState } = useQadaState();

  const [birthDate, setBirthDate] = useState('');
  const [startAgeText, setStartAgeText] = useState('');
  const [gender, setGender] = useState<Gender>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDatePickerDate, setTempDatePickerDate] = useState(new Date());

  // Store editable values as STRINGS, starting empty
  const [percentText, setPercentText] = useState<Record<Prayer, string>>({
    FAJR: '',
    DHUHR: '',
    ASR: '',
    MAGHRIB: '',
    ISHA: '',
    WITR: '',
  });
  const [countText, setCountText] = useState<Record<Prayer, string>>({
    FAJR: '',
    DHUHR: '',
    ASR: '',
    MAGHRIB: '',
    ISHA: '',
    WITR: '',
  });

  // Compute current age
  const currentAgeYears = birthDate ? calculateCurrentAge(birthDate) : null;

  // Get default start age based on gender
  const getDefaultStartAge = (): number => {
    if (gender === 'male') return 12;
    if (gender === 'female') return 11;
    return 12; // fallback
  };

  // Parse start age (use gender default if blank, clamp >= 0)
  const parsedStartAge = startAgeText === ''
    ? (gender ? getDefaultStartAge() : 12)
    : Math.max(0, parseInt(startAgeText, 10) || 12);

  // Compute eligible days
  const birthDateValid = parseYmdToLocalMidnight(birthDate) !== null;
  const eligibleDays = birthDateValid
    ? computeEligibleDays(birthDate, parsedStartAge)
    : 0;

  // Validate start age <= current age
  const startAgeValid = currentAgeYears !== null && parsedStartAge <= currentAgeYears;

  // Handle percent change: accept string, compute count, update countText
  const handlePercentChange = (prayer: Prayer, value: string) => {
    // If empty, set count to empty (both blank)
    if (value === '') {
      setPercentText((prev) => ({
        ...prev,
        [prayer]: '',
      }));
      setCountText((prev) => ({
        ...prev,
        [prayer]: '',
      }));
      return;
    }

    // Strip non-digits and parse int
    const digitsOnly = value.replace(/\D/g, '');
    const parsed = parseInt(digitsOnly, 10);

    // Hard-clamp: if parsed > 100, set to "100" immediately
    // If parsed < 0 or NaN, set to "" or "0" depending on input
    let clampedValue: string;
    if (isNaN(parsed)) {
      clampedValue = '';
    } else if (parsed > 100) {
      clampedValue = '100';
    } else if (parsed < 0) {
      clampedValue = '';
    } else {
      // Keep the typed string if it's valid (1, 10, etc.)
      clampedValue = digitsOnly;
    }

    // Set percentText to clamped value
    setPercentText((prev) => ({
      ...prev,
      [prayer]: clampedValue,
    }));

    // Compute count from clamped percent
    const percent = Math.max(0, Math.min(100, parsed || 0));
    const computedCount = Math.round(eligibleDays * (percent / 100));
    const clampedCount = Math.max(0, Math.min(eligibleDays, computedCount));
    setCountText((prev) => ({
      ...prev,
      [prayer]: String(clampedCount),
    }));
  };

  // Handle count change: accept string, compute percent, update percentText
  const handleCountChange = (prayer: Prayer, value: string) => {
    // If empty, set percent to empty (both blank)
    if (value === '') {
      setCountText((prev) => ({
        ...prev,
        [prayer]: '',
      }));
      setPercentText((prev) => ({
        ...prev,
        [prayer]: '',
      }));
      return;
    }

    // Strip non-digits and parse count
    const digitsOnly = value.replace(/\D/g, '');
    const parsedCount = parseInt(digitsOnly, 10) || 0;
    
    // Clamp count to 0..eligibleDays (or 0 if eligibleDays==0)
    const clampedCount = Math.max(0, Math.min(eligibleDays, parsedCount));
    
    // Set countText to clamped value (normalize if exceeds eligibleDays)
    setCountText((prev) => ({
      ...prev,
      [prayer]: String(clampedCount),
    }));
    
    // Compute percent and hard-clamp percentText to 0..100
    const percent = eligibleDays > 0 ? Math.round((clampedCount / eligibleDays) * 100) : 0;
    const clampedPercent = Math.max(0, Math.min(100, percent));
    setPercentText((prev) => ({
      ...prev,
      [prayer]: String(clampedPercent),
    }));
  };

  // Date picker handlers
  const handleDatePickerChange = (event: any, selectedDate?: Date) => {
    // On iOS, onChange fires continuously - only update temp date, don't commit
    if (Platform.OS === 'ios' && selectedDate) {
      setTempDatePickerDate(selectedDate);
      return;
    }

    // On Android, handle modal behavior
    if (Platform.OS === 'android') {
      if (event.type === 'set' && selectedDate) {
        setTempDatePickerDate(selectedDate);
        // For Android, we'll show inline picker with Done/Cancel
        // So don't close here
      } else if (event.type === 'dismissed') {
        setShowDatePicker(false);
      }
    }
  };

  const handleDateSelectPress = () => {
    if (birthDate) {
      const parsed = parseYmdToLocalMidnight(birthDate);
      if (parsed) {
        setTempDatePickerDate(parsed);
      }
    } else {
      setTempDatePickerDate(new Date());
    }
    setShowDatePicker(!showDatePicker);
  };

  const handleDateDone = () => {
    const ymd = formatLocalDateToYmd(tempDatePickerDate);
    setBirthDate(ymd);
    setShowDatePicker(false);
  };

  const handleDateCancel = () => {
    // Reset temp date to current birthDate if it exists
    if (birthDate) {
      const parsed = parseYmdToLocalMidnight(birthDate);
      if (parsed) {
        setTempDatePickerDate(parsed);
      }
    }
    setShowDatePicker(false);
  };

  const handleCalculate = () => {
    try {
      // Build percentMissed: blanks become 0, otherwise parse/clamp 0..100
      const percentMissed: PrayerMap = {} as PrayerMap;
      for (const prayer of PRAYERS) {
        const text = percentText[prayer];
        if (text === '') {
          percentMissed[prayer] = 0;
        } else {
          const parsed = parseInt(text, 10) || 0;
          percentMissed[prayer] = Math.max(0, Math.min(100, parsed));
        }
      }

      // Parse startAge: if blank -> use gender default, else use typed value clamped >=0
      const startAge = startAgeText === ''
        ? (gender ? getDefaultStartAge() : 12)
        : Math.max(0, parseInt(startAgeText, 10) || 12);

      const newState = createInitialState({
        birthDate,
        startAge,
        percentMissed,
      });

      setState(() => newState);
      router.replace('/(tabs)/home');
    } catch (error) {
      // Error handling - could show alert in future
      console.error('Failed to create initial state:', error);
    }
  };

  // DEV ONLY: remove before production
  const handleUseDummyData = () => {
    try {
      const dummyBirthDate = '2000-01-18';
      const dummyStartAge = 12;
      const dummyPercentMissed: PrayerMap = {
        FAJR: 40,
        DHUHR: 30,
        ASR: 20,
        MAGHRIB: 10,
        ISHA: 25,
        WITR: 15,
      };

      const newState = createInitialState({
        birthDate: dummyBirthDate,
        startAge: dummyStartAge,
        percentMissed: dummyPercentMissed,
      });

      setState(() => newState);
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Failed to create dummy state:', error);
    }
  };

  const canCalculate =
    birthDateValid &&
    gender !== null &&
    eligibleDays > 0 &&
    startAgeValid;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            <ThemedText type="title" style={styles.title}>
              Setup
            </ThemedText>

            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.label}>
                Birth date
              </ThemedText>
              <View style={styles.dateRow}>
                <ThemedText style={styles.dateValue}>
                  {birthDate || 'Not set'}
                </ThemedText>
                <Pressable onPress={handleDateSelectPress} style={styles.dateButton}>
                  <ThemedText style={styles.dateButtonText}>Select</ThemedText>
                </Pressable>
              </View>
              {showDatePicker && (
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={tempDatePickerDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDatePickerChange}
                    maximumDate={new Date()}
                  />
                  <View style={styles.pickerButtons}>
                    <Pressable onPress={handleDateCancel} style={styles.cancelButton}>
                      <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                    </Pressable>
                    <Pressable onPress={handleDateDone} style={styles.doneButton}>
                      <ThemedText style={styles.doneButtonText}>Done</ThemedText>
                    </Pressable>
                  </View>
                </View>
              )}
              <ThemedText style={[styles.warningText, styles.errorSlot]}>
                {!birthDateValid ? 'Please select your birth date' : ''}
              </ThemedText>
            </View>

            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.label}>
                Gender
              </ThemedText>
              <View style={styles.genderRow}>
                <Pressable
                  onPress={() => setGender('male')}
                  style={[
                    styles.genderButton,
                    gender === 'male' && styles.genderButtonSelected,
                  ]}>
                  <ThemedText
                    style={[
                      styles.genderButtonText,
                      gender === 'male' && styles.genderButtonTextSelected,
                    ]}>
                    Male
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => setGender('female')}
                  style={[
                    styles.genderButton,
                    gender === 'female' && styles.genderButtonSelected,
                  ]}>
                  <ThemedText
                    style={[
                      styles.genderButtonText,
                      gender === 'female' && styles.genderButtonTextSelected,
                    ]}>
                    Female
                  </ThemedText>
                </Pressable>
              </View>
              <ThemedText style={[styles.warningText, styles.errorSlot]}>
                {gender === null ? 'Please select your gender' : ''}
              </ThemedText>
            </View>

            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.label}>
                Start Age
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder={gender ? String(getDefaultStartAge()) : '12'}
                value={startAgeText}
                onChangeText={setStartAgeText}
                keyboardType="number-pad"
                placeholderTextColor="#999"
              />
              <ThemedText style={styles.helperText}>
                Start counting from the age puberty began. Common defaults: 12 (boys),
                11 (girls). Adjust if needed.
              </ThemedText>
              <ThemedText style={[styles.warningText, styles.errorSlot]}>
                {!startAgeValid && currentAgeYears !== null
                  ? "Start age can't be greater than your current age."
                  : ''}
              </ThemedText>
            </View>

            <View style={styles.section}>
              {birthDateValid ? (
                <ThemedText style={styles.totalDaysText}>
                  Total days counted: {eligibleDays}
                </ThemedText>
              ) : null}
              <ThemedText style={[styles.warningText, styles.errorSlot]}>
                {eligibleDays === 0 && birthDateValid
                  ? 'Start date is in the future'
                  : ''}
              </ThemedText>
            </View>

            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.label}>
                Prayers Missed
              </ThemedText>
              {PRAYERS.map((prayer) => (
                <View key={prayer} style={styles.prayerRow}>
                  <ThemedText style={styles.prayerLabel}>{prayer}:</ThemedText>
                  <View style={styles.prayerInputs}>
                    <View style={styles.inputGroup}>
                      <TextInput
                        style={styles.percentInput}
                        placeholder="0"
                        value={percentText[prayer]}
                        onChangeText={(value) => handlePercentChange(prayer, value)}
                        keyboardType="number-pad"
                        placeholderTextColor="#999"
                      />
                      <ThemedText style={styles.unitLabel}>%</ThemedText>
                    </View>
                    <View style={styles.inputGroup}>
                      <TextInput
                        style={styles.countInput}
                        placeholder="0"
                        value={countText[prayer]}
                        onChangeText={(value) => handleCountChange(prayer, value)}
                        keyboardType="number-pad"
                        placeholderTextColor="#999"
                      />
                      <ThemedText style={styles.unitLabel}>count</ThemedText>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <Pressable
              onPress={handleCalculate}
              style={[styles.button, !canCalculate && styles.buttonDisabled]}
              disabled={!canCalculate}>
              <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                Calculate & Continue
              </ThemedText>
            </Pressable>

            {/* DEV ONLY: remove before production */}
            <Pressable onPress={handleUseDummyData} style={styles.devButton}>
              <ThemedText style={styles.devButtonText}>
                Use Dummy Data (DEV)
              </ThemedText>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 24,
  },
  title: {
    color: '#ffffff',
  },
  section: {
    gap: 8,
  },
  label: {
    color: '#ffffff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 44,
    color: '#ffffff',
    backgroundColor: '#1a1a1a',
  },
  helperText: {
    fontSize: 14,
    color: '#cccccc',
    marginTop: 4,
  },
  totalDaysText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  warningText: {
    fontSize: 14,
    color: '#ff6b6b',
    marginTop: 4,
  },
  errorSlot: {
    minHeight: 20,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#1a1a1a',
    minHeight: 44,
  },
  dateValue: {
    color: '#ffffff',
    fontSize: 16,
    flex: 1,
  },
  dateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0a7ea4',
    borderRadius: 6,
  },
  dateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  pickerContainer: {
    marginTop: 12,
    gap: 12,
  },
  pickerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#cccccc',
    fontSize: 16,
  },
  doneButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0a7ea4',
    borderRadius: 6,
  },
  doneButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    minHeight: 44,
    justifyContent: 'center',
  },
  genderButtonSelected: {
    borderColor: '#0a7ea4',
    backgroundColor: '#0a7ea420',
  },
  genderButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  genderButtonTextSelected: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  prayerLabel: {
    minWidth: 80,
    fontSize: 14,
    color: '#ffffff',
  },
  prayerInputs: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  percentInput: {
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
    color: '#ffffff',
    backgroundColor: '#1a1a1a',
    minWidth: 60,
  },
  countInput: {
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
    color: '#ffffff',
    backgroundColor: '#1a1a1a',
    minWidth: 60,
  },
  unitLabel: {
    fontSize: 14,
    color: '#cccccc',
    minWidth: 50,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#333333',
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
  },
  devButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  devButtonText: {
    color: '#999999',
    fontSize: 12,
  },
});
