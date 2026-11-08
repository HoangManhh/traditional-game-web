// Talks to the Cloudflare Worker API (worker/index.js).
// Reads are public; writes need the PIN configured as the APP_PIN secret.

const PIN_STORAGE_KEY = 'app_pin';

function getStoredPin() {
  try {
    return localStorage.getItem(PIN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function storePin(pin) {
  try {
    if (pin) localStorage.setItem(PIN_STORAGE_KEY, pin);
    else localStorage.removeItem(PIN_STORAGE_KEY);
  } catch {
    // Storage unavailable (private mode etc.): the PIN is asked again next time.
  }
}

// Throws on network/server errors so callers never mistake a failed load for empty data.
async function loadData(key) {
  const res = await fetch(`/api/${key}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Load ${key} failed: HTTP ${res.status}`);
  return res.json();
}

// Returns true when saved. Prompts for the PIN when none is stored or it was rejected.
async function saveData(key, value) {
  let pin = getStoredPin();
  let promptText = 'Nhập mã PIN để lưu dữ liệu:';

  while (true) {
    if (!pin) {
      pin = prompt(promptText);
      if (!pin) return false;
    }

    let res;
    try {
      res = await fetch(`/api/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-App-Pin': encodeURIComponent(pin) },
        body: JSON.stringify(value),
      });
    } catch (error) {
      console.error(`Save ${key} error: `, error);
      return false;
    }

    if (res.status === 401) {
      storePin('');
      pin = '';
      promptText = 'Mã PIN không đúng, nhập lại:';
      continue;
    }
    if (!res.ok) {
      console.error(`Save ${key} failed: HTTP ${res.status}`, await res.text());
      return false;
    }

    storePin(pin);
    return true;
  }
}

export const loadSettingsRemote = () => loadData('settings');
export const saveSettingsRemote = (settings) => saveData('settings', settings);
export const loadHistoryRemote = () => loadData('history');
export const saveHistoryRemote = (history) => saveData('history', history);
