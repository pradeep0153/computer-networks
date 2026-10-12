/**
 * LocalStorage Persistence for Network Diagnosis History
 * Handles quota limits, max 20 history cap, and corrupted data gracefully.
 */

const STORAGE_KEY = 'netpulse_diagnosis_history';
const SETTINGS_KEY = 'netpulse_user_settings';
const MAX_HISTORY_RECORDS = 20;

/**
 * Retrieves diagnosis history from browser localStorage.
 * Robust against corrupted JSON or restricted storage environments.
 * @returns {Array<object>}
 */
export function getDiagnosisHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('Diagnosis history in localStorage was not an array. Resetting.');
      return [];
    }
    return parsed;
  } catch (error) {
    console.error('Failed to read or parse diagnosis history from localStorage:', error);
    return [];
  }
}

/**
 * Saves a new diagnosis record to localStorage.
 * Prepends the record and caps the list to MAX_HISTORY_RECORDS.
 * @param {object} diagnosis
 * @returns {boolean} Success status
 */
export function saveDiagnosis(diagnosis) {
  if (!diagnosis || !diagnosis.id) return false;

  try {
    const history = getDiagnosisHistory();
    // Prevent duplicate entries
    const filtered = history.filter((item) => item.id !== diagnosis.id);
    const updated = [diagnosis, ...filtered].slice(0, MAX_HISTORY_RECORDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Failed to save diagnosis to localStorage:', error);
    return false;
  }
}

/**
 * Retrieves an individual diagnosis record by ID.
 * @param {string} id
 * @returns {object|null}
 */
export function getDiagnosisById(id) {
  const history = getDiagnosisHistory();
  return history.find((item) => item.id === id) || null;
}

/**
 * Deletes a diagnosis record by ID.
 * @param {string} id
 * @returns {boolean}
 */
export function deleteDiagnosis(id) {
  try {
    const history = getDiagnosisHistory();
    const updated = history.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Failed to delete diagnosis from localStorage:', error);
    return false;
  }
}

/**
 * Clears all diagnosis records from localStorage.
 * @returns {boolean}
 */
export function clearDiagnosisHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear diagnosis history:', error);
    return false;
  }
}

/**
 * Retrieves app settings.
 */
export function getAppSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { theme: 'light', showAdvancedDetails: true };
  } catch {
    return { theme: 'light', showAdvancedDetails: true };
  }
}

/**
 * Saves app settings.
 */
export function saveAppSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}
