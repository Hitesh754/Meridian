import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const INSTALLATION_ID_STORAGE_KEY = 'meridian_installation_id';

// In-memory fallback for environments without SecureStore (e.g. unit test runner)
let memoryFallbackId: string | null = null;

/**
 * Retrieves the persistent, anonymous local installation ID for this client instance,
 * or generates and securely stores a new random UUID if one does not already exist.
 *
 * Privacy Guarantees:
 * - Purely random UUIDv4.
 * - ZERO access to hardware identifiers, MAC addresses, IMEI, or Android ID.
 * - Stored locally in OS keychain / encrypted Keystore via Expo SecureStore.
 * - Used strictly for usage tracking against the Mapbox 100 Mobile MAU free tier cap.
 */
export async function getOrCreateInstallationId(): Promise<string> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (isAvailable) {
      const existingId = await SecureStore.getItemAsync(INSTALLATION_ID_STORAGE_KEY);
      if (existingId) {
        return existingId;
      }

      const newId = Crypto.randomUUID();
      await SecureStore.setItemAsync(INSTALLATION_ID_STORAGE_KEY, newId);
      return newId;
    }
  } catch (_err) {
    // Fall back to memory cache if SecureStore fails
  }

  if (!memoryFallbackId) {
    memoryFallbackId = Crypto.randomUUID();
  }
  return memoryFallbackId;
}

/**
 * Resets the installation ID (primarily for testing or explicit user data clearance).
 */
export async function resetInstallationId(): Promise<string> {
  const newId = Crypto.randomUUID();
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (isAvailable) {
      await SecureStore.setItemAsync(INSTALLATION_ID_STORAGE_KEY, newId);
    }
  } catch (_err) {
    // Continue with memory fallback
  }
  memoryFallbackId = newId;
  return newId;
}
