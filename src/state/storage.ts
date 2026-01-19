import AsyncStorage from '@react-native-async-storage/async-storage';
import { QadaState } from '@/src/core/types';

const STORAGE_KEY = 'qada_state_v1';

/**
 * Load state from AsyncStorage
 * @returns Promise resolving to QadaState or null if not found or on error
 */
export async function loadState(): Promise<QadaState | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) {
      return null;
    }
    const state = JSON.parse(data) as QadaState;
    return state;
  } catch (error) {
    // Catch JSON parse errors and any other errors
    // Never throw - return null on failure
    return null;
  }
}

/**
 * Save state to AsyncStorage
 * @param state - The QadaState to save
 */
export async function saveState(state: QadaState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // Silently fail - could log in production
    console.error('Failed to save state:', error);
  }
}

/**
 * Clear state from AsyncStorage
 */
export async function clearState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Silently fail - could log in production
    console.error('Failed to clear state:', error);
  }
}
