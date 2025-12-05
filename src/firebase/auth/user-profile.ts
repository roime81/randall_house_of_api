'use client';

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Creates or updates a user's profile in Firestore.
 * If the user document doesn't exist, it creates one.
 * If it exists, it can be used to update fields (though not implemented here).
 * Assigns 'admin' role to a specific user, and 'user' to all others.
 * @param firestore - The Firestore instance.
 * @param user - The Firebase Auth user object.
 */
export async function storeUserProfile(firestore: Firestore, user: User) {
  if (!user) return;

  const userRef = doc(firestore, 'users', user.uid);

  try {
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Determine role based on email
      const role =
        user.email === 'roimepuniran@gmail.com' ? 'admin' : 'user';

      const newUserProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL || undefined,
        role: role,
        createdAt: serverTimestamp(),
      };

      // Use setDoc to create the user profile
      await setDoc(userRef, newUserProfile);
    }
    // If userDoc exists, we could handle updates here if needed.
    // For now, we only care about creation on first login.
  } catch (serverError) {
    const isWriteOperation = true; // Assuming this logic is for creation
    const permissionError = new FirestorePermissionError({
      path: userRef.path,
      operation: isWriteOperation ? 'create' : 'update',
      // requestResourceData could be added here if we had the profile data
    });
    errorEmitter.emit('permission-error', permissionError);
    // Re-throw the error to be caught by the calling UI component
    throw permissionError;
  }
}
