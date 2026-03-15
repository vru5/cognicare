import { useCallback, useMemo } from 'react';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

export function useSecureStorage() {
    const setItem = useCallback(async (key: string, value: string) => {
        await SecureStoragePlugin.set({ key, value });
    }, []);

    const getItem = useCallback(async (key: string): Promise<string | null> => {
        try {
            const result = await SecureStoragePlugin.get({ key });
            return result.value;
        } catch (error) {
            // Plugin throws if key not found
            return null;
        }
    }, []);

    const removeItem = useCallback(async (key: string) => {
        await SecureStoragePlugin.remove({ key });
    }, []);

    const clear = useCallback(async () => {
        await SecureStoragePlugin.clear();
    }, []);

    return useMemo(() => ({ setItem, getItem, removeItem, clear }), [setItem, getItem, removeItem, clear]);
}
