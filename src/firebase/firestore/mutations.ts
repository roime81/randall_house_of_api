'use client';

import {
  Firestore,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';
import { Tenant } from '@/lib/types';

export async function addTenant(
  firestore: Firestore,
  tenant: Omit<Tenant, 'id'>
) {
  const tenantsRef = collection(firestore, 'tenants');
  try {
    const docRef = await addDoc(tenantsRef, {
      ...tenant,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (serverError) {
    const permissionError = new FirestorePermissionError({
      path: tenantsRef.path,
      operation: 'create',
      requestResourceData: tenant,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError; // Re-throw to be caught by the calling function
  }
}
