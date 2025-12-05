'use client';

import { ReactNode } from 'react';
import { FirebaseProvider } from './provider';

// This component wraps the FirebaseProvider and is used in the root layout.
// It ensures that the Firebase services are only initialized on the client side.
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return <FirebaseProvider>{children}</FirebaseProvider>;
}
