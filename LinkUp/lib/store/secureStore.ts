import * as SecureStore from 'expo-secure-store';

export async function saveToken(key: string, value: string) {
    await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
}

export async function getToken(key: string): Promise<string | null> {
    try {
        return await SecureStore.getItemAsync(key);
    } catch (error) {
        console.error(`Erreur lors de la récupération de ${key}:`, error);
        return null;
    }
}


export async function deleteToken(key: string) {
    try {
        await SecureStore.deleteItemAsync(key);
    } catch (error) {
        console.error(`Erreur lors de la suppression de ${key}:`, error);
    }
}

export async function clearAllTokens() {
    try {
        await deleteToken('accessToken');
        await deleteToken('refreshToken');
    } catch (error) {
        console.error('Erreur lors de la suppression des tokens:', error);
    }
}
