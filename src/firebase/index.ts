'use client';
import type { FirebaseApp } from 'firebase/app';
import { getApp, getApps, initializeApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

import {
  useFirebase as useFirebase_INTERNAL,
  useFirebaseApp as useFirebaseApp_INTERNAL,
  useFirestore as useFirestore_INTERNAL,
  useAuth as useAuth_INTERNAL,
  FirebaseProvider,
} from './provider';
import { FirebaseClientProvider } from './client-provider';

function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} {
  const firebaseApp =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  return { firebaseApp, auth, firestore };
}

export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useUser } from './auth/use-user';

// We are renaming the provider hooks to avoid confusion with the service hooks
// that we are re-exporting from this file.
export {
  FirebaseProvider,
  FirebaseClientProvider,
  useFirebase_INTERNAL as useFirebase,
  useFirebaseApp_INTERNAL as useFirebaseApp,
  useFirestore_INTERNAL as useFirestore,
  useAuth_INTERNAL as useAuth,
  initializeFirebase,
};
