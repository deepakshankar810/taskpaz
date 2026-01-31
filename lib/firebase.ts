import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  CACHE_SIZE_UNLIMITED,
  type Firestore
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDBN6Y9zKdsv3zOMzGQPqnx10pVFBssEPY",
  authDomain: "taskpaz.firebaseapp.com",
  projectId: "taskpaz",
  storageBucket: "taskpaz.firebasestorage.app",
  messagingSenderId: "6280654645",
  appId: "1:6280654645:web:f35e4f730a0b665718e67c",
  measurementId: "G-X86EHNVELR"
};

// Initialize Firebase (Singleton)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Analytics (Safe for SSR)
if (typeof window !== 'undefined') {
  isSupported().then(yes => yes && getAnalytics(app));
}
const auth = getAuth(app);

// Use persistent cache with multi-tab support for offline capability
// ONLY on the client side. Server side uses standard getFirestore.
let db: Firestore;

if (typeof window !== 'undefined') {
  try {
    // Attempt to initialize with persistent options
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: CACHE_SIZE_UNLIMITED
      })
    });
  } catch (error: any) {
    // If it fails (e.g. already initialized, or some other error), fall back
    // We check if it's already initialized to avoid noise
    if (error?.code !== 'failed-precondition' && error?.message?.indexOf('already exists') === -1) {
      console.warn('Firebase persistence initialization failed, falling back to default:', error);
    }
    db = getFirestore(app);
  }
} else {
  // Server-side always uses default
  db = getFirestore(app);
}

const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google Provider
googleProvider.addScope('profile');
googleProvider.addScope('email');

export { app, auth, db, storage, googleProvider };
