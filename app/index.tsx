import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { useQada } from '@/src/state/QadaProvider';

export default function IndexScreen() {
  const { state, loading } = useQada();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (state === null) {
      // No state exists, redirect to setup
      router.replace('/setup');
    } else {
      // State exists, redirect to home
      router.replace('/(tabs)/home');
    }
  }, [state, loading, router]);

  // Show loading indicator while checking state
  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size="large" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
