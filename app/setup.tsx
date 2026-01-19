import { StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SetupScreen() {
  const handleContinue = () => {
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
