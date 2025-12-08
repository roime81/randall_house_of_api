'use client';

import {
  Firestore,
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Tenant } from '@/lib/types';

export async function addTenant(
  firestore: Firestore,
  tenant: Omit<Tenant, 'id' | 'createdAt'>
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

export async function deleteTenant(firestore: Firestore, tenantId: string) {
  const tenantRef = doc(firestore, 'tenants', tenantId);
  try {
    await deleteDoc(tenantRef);
  } catch (serverError) {
    const permissionError = new FirestorePermissionError({
      path: tenantRef.path,
      operation: 'delete',
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}
