import type { AppData } from '@/types';

const DB_NAME = 'coffeeAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'appState';
const KEY = 'state';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error("IndexedDB can only be used in the browser."));
  }
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.onversionchange = () => {
        db.close();
        alert('Database version changed. Please reload the page.');
        window.location.reload();
      };
      resolve(db);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
      dbPromise = null; // Reset promise on error
    };
  });
  return dbPromise;
}

export async function loadDataFromDB(): Promise<AppData | null> {
  if (typeof window === 'undefined') return null;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(KEY);

      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        if (result) {
          resolve(result.value as AppData);
        } else {
          // Initialize with default structure if no data found
          const initialData: AppData = {
            nextLotId: 1,
            nextHarvestId: 1,
            nextWorkerId: 1,
            lots: [],
          };
          resolve(initialData);
        }
      };

      request.onerror = (event) => {
        console.error('Error loading data from IndexedDB:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  } catch (error) {
    console.error('Failed to open DB for loading:', error);
    return null;
  }
}

export async function saveDataToDB(data: AppData): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ key: KEY, value: data });

      request.onsuccess = () => {
        console.log('Data saved to IndexedDB');
        resolve();
      };

      request.onerror = (event) => {
        console.error('Error saving data to IndexedDB:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  } catch (error) {
    console.error('Failed to open DB for saving:', error);
  }
}
