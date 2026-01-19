import { StyleSheet, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useQada } from '@/src/state/QadaProvider';

export default function SettingsScreen() {
  const { reset } = useQada();

  const handleRestartSetup = () => {
    Alert.alert(
      'Restart Setup',
      'This will erase your QADA data on this device. This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Restart',
          style: 'destructive',
          onPress: async () => {
            await reset();
            router.replace('/setup');
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Settings</ThemedText>
      
      <ThemedView style={styles.section}>
        <ThemedText style={styles.helperText}>
          This will erase your local data and restart setup.
        </ThemedText>
        <Pressable onPress={handleRestartSetup} style={styles.button}>
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>
            Restart Setup
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 32,
  },
  section: {
    gap: 12,
    alignItems: 'center',
  },
  helperText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#dc3545',
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
  },
});
