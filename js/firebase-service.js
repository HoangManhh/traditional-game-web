import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Use a static room ID for simplicity. Could be dynamic later!
const ROOM_ID = "main_room";

export async function saveSettingsToFB(settings) {
  try {
    await set(ref(database, `rooms/${ROOM_ID}/settings`), settings);
    return true;
  } catch (error) {
    console.error("Firebase save settings error: ", error);
    return false;
  }
}

export async function loadSettingsFromFB() {
  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `rooms/${ROOM_ID}/settings`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
  } catch (error) {
    console.error("Firebase get settings error: ", error);
  }
  return null;
}

export async function saveHistoryToFB(history) {
  try {
     // Save the entire array
    await set(ref(database, `rooms/${ROOM_ID}/history`), history);
    return true;
  } catch (error) {
    console.error("Firebase save history error: ", error);
    return false;
  }
}

export async function loadHistoryFromFB() {
  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `rooms/${ROOM_ID}/history`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
  } catch (error) {
    console.error("Firebase get history error: ", error);
  }
  return null;
}
