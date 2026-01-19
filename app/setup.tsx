import { StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useQadaState } from '@/src/state/useQadaState';
import { QadaState } from '@/src/core/types';

export default function SetupScreen() {
  const { setState } = useQadaState();

  const handleContinue = () => {
    // Create minimal valid QadaState with placeholder values
    const now = new Date().toISOString();
    const initialState: QadaState = {
      version: '0.1-mobile',
      birthDate: '2000-01-01',
      startAge: 12,
      remaining: {
        FAJR: 0,
        DHUHR: 0,
        ASR: 0,
        MAGHRIB: 0,
        ISHA: 0,
        WITR: 0,
      },
      createdAt: now,
      updatedAt: now,
    };

    // Save state and redirect
    setState(() => initialState);
    router.replace('/(tabs)/home');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Setup</ThemedText>
      <Pressable onPress={handleContinue} style={styles.button}>
        <ThemedText type="defaultSemiBold" style={styles.buttonText}>Continue</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
  },
});
