import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isWeb = Platform.OS === 'web';

export async function saveToken(key: string, value: string) {
    try {
        if (isWeb) {
            // Use AsyncStorage for web
            await AsyncStorage.setItem(key, value);
        } else {
            // Use SecureStore for mobile devices (iOS/Android)
            await SecureStore.setItemAsync(key, value, {
                keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            });
        }
    } catch (error) {
        console.error(`Error saving ${key}:`, error);
    }
}

export async function getToken(key: string): Promise<string | null> {
    try {
        if (isWeb) {
            // Use AsyncStorage for web
            return await AsyncStorage.getItem(key);
        } else {
            return await SecureStore.getItemAsync(key);
        }
    } catch (error) {
        console.error(`Error retrieving ${key}:`, error);
        return null;
    }
}

export async function deleteToken(key: string) {
    try {
        if (isWeb) {
            await AsyncStorage.removeItem(key);
        } else {
            await SecureStore.deleteItemAsync(key);
        }
    } catch (error) {
        console.error(`Error deleting ${key}:`, error);
    }
}

export async function clearAllTokens() {
    try {
        if (isWeb) {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
        } else {
            await deleteToken('accessToken');
            await deleteToken('refreshToken');
        }
    } catch (error) {
        console.error('Error clearing all tokens:', error);
    }
}