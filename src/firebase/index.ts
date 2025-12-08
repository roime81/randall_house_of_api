'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length) {
    // If already initialized, return the SDKs with the already initialized App
    return getSdks(getApp());
  }

  // Firebase App Hosting integrates with initializeApp() to provide the
  // environment variables needed to populate FirebaseOptions in production.
  let firebaseApp;
  try {
    // Attempt to initialize via Firebase App Hosting environment variables
    firebaseApp = initializeApp();
  } catch (e) {
    // Fallback for local development
    if (process.env.NODE_ENV !== "production") {
       firebaseApp = initializeApp(firebaseConfig);
    } else {
      console.error('Firebase automatic initialization failed in production.', e);
       // In production, if auto-init fails, we might not want to fall back
       // to a hardcoded config, as it might be the wrong environment.
       // Throwing an error or handling it gracefully is an option.
       throw new Error("Firebase initialization failed in production.");
    }
  }
  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';
