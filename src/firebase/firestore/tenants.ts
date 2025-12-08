'use client';

import {
  Firestore,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { ApiServer, Tenant, EventStream, UpstreamApi } from '@/lib/types';

/**
 * Adds a new API server to a tenant's list of servers.
 * It starts in a 'deploying' state and transitions to 'running'.
 */
export async function addApiServer(
  firestore: Firestore,
  tenantId: string,
  serverData: Omit<ApiServer, 'id' | 'createdAt' | 'status'>
) {
  const tenantRef = doc(firestore, 'tenants', tenantId);

  const newServer: ApiServer = {
    ...serverData,
    id: `srv-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'deploying',
  };

  try {
    await updateDoc(tenantRef, {
      apiServers: arrayUnion(newServer),
    });

    // Simulate deployment time and then set the status to 'running'
    setTimeout(async () => {
      await updateApiServerStatus(firestore, tenantId, newServer.id, 'running');
    }, 3000);
  } catch (serverError) {
    const permissionError = new FirestorePermissionError({
      path: tenantRef.path,
      operation: 'update',
      requestResourceData: { apiServers: arrayUnion(newServer) },
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}

/**
 * Updates the status of a specific API server within a tenant document.
 */
export async function updateApiServerStatus(
  firestore: Firestore,
  tenantId: string,
  serverId: string,
  status: ApiServer['status']
) {
  const tenantRef = doc(firestore, 'tenants', tenantId);

  try {
    const tenantSnap = await getDoc(tenantRef);
    if (!tenantSnap.exists()) {
      throw new Error('Tenant not found');
    }
    const tenantData = tenantSnap.data() as Tenant;
    const servers = tenantData.apiServers || [];

    const updatedServers = servers.map(server =>
      server.id === serverId ? { ...server, status } : server
    );

    await updateDoc(tenantRef, { apiServers: updatedServers });
  } catch (serverError) {
    const permissionError = new FirestorePermissionError({
      path: tenantRef.path,
      operation: 'update',
      // We can't provide the exact update payload here easily,
      // but we can describe the intent.
      requestResourceData: {
        'apiServers[?(@.id==...)]': { status: status },
      },
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}

/**
 * Deletes a specific API server from a tenant's list of servers.
 * This function reads the current servers, filters out the one to be deleted,
 * and overwrites the array in Firestore. This is safer than arrayRemove
 * when dealing with complex objects that may have Date/Timestamp mismatches.
 */
export async function deleteApiServer(
  firestore: Firestore,
  tenantId: string,
  serverId: string
) {
  const tenantRef = doc(firestore, 'tenants', tenantId);

  try {
    const tenantSnap = await getDoc(tenantRef);
    if (!tenantSnap.exists()) {
      throw new Error('Tenant not found');
    }
    const tenantData = tenantSnap.data() as Tenant;
    const currentServers = tenantData.apiServers || [];

    // Filter out the server to be deleted
    const updatedServers = currentServers.filter(server => server.id !== serverId);

    // Overwrite the array with the new filtered array
    await updateDoc(tenantRef, {
      apiServers: updatedServers,
    });
  } catch (serverError) {
    const permissionError = new FirestorePermissionError({
      path: tenantRef.path,
      operation: 'update',
      requestResourceData: { apiServers: '[...]' }, // Representing an array overwrite
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}


/**
 * Adds a new event stream to a tenant's list.
 */
export async function addEventStream(
  firestore: Firestore,
  tenantId: string,
  streamData: Omit<EventStream, 'id'>
) {
  const tenantRef = doc(firestore, 'tenants', tenantId);
  const newStream: EventStream = {
    ...streamData,
    id: `evs-${Date.now()}`,
  };

  try {
    await updateDoc(tenantRef, {
      eventStreams: arrayUnion(newStream),
    });
  } catch (serverError) {
    const permissionError = new FirestorePermissionError({
      path: tenantRef.path,
      operation: 'update',
      requestResourceData: { eventStreams: arrayUnion(newStream) },
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}

/**
 * Adds a new upstream API to a tenant's list.
 */
export async function addUpstreamApi(
  firestore: Firestore,
  tenantId: string,
  apiData: Omit<UpstreamApi, 'id'>
) {
  const tenantRef = doc(firestore, 'tenants', tenantId);
  const newApi: UpstreamApi = {
    ...apiData,
    id: `upa-${Date.now()}`,
  };

  try {
    await updateDoc(tenantRef, {
      upstreamApis: arrayUnion(newApi),
    });
  } catch (serverError) {
    const permissionError = new FirestorePermissionError({
      path: tenantRef.path,
      operation: 'update',
      requestResourceData: { upstreamApis: arrayUnion(newApi) },
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}
