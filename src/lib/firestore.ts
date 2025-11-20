"use client";

import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  Firestore,
} from 'firebase/firestore';
import type { Client, Invoice, Task, InventoryItem, BusinessProfile, InvoiceSettings, TaskStatus, TaskPriority } from './types.client';

// ============================================================================
// Real-time Subscriptions
// ============================================================================

/**
 * Subscribes to the clients collection and provides real-time updates.
 * @param db The Firestore instance.
 * @param callback Function to call with the updated list of clients.
 * @returns Unsubscribe function.
 */
export function subscribeToClients(db: Firestore, callback: (data: Client[]) => void) {
  const q = query(collection(db, 'clients'), orderBy('name', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const clientsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Client[];
    callback(clientsData);
  });
}

/**
 * Subscribes to the invoices collection and enriches them with client data.
 * @param db The Firestore instance.
 * @param callback Function to call with the updated list of invoices.
 * @returns Unsubscribe function.
 */
export function subscribeToInvoices(db: Firestore, callback: (data: Invoice[]) => void) {
  const invoicesRef = collection(db, 'invoices');
  const q = query(invoicesRef, orderBy('dueDate', 'desc'));

  return onSnapshot(q, async (snapshot) => {
    const invoicesData = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Invoice, 'id'>),
    }));

    if (invoicesData.length === 0) {
      callback([]);
      return;
    }

    const clientIds = [...new Set(invoicesData.map(inv => inv.clientId).filter(Boolean))];
    
    if (clientIds.length === 0) {
        const enrichedInvoices = invoicesData.map(invoice => ({ ...invoice, client: undefined }));
        callback(enrichedInvoices);
        return;
    }

    const clientsQuery = query(collection(db, 'clients'), where('__name__', 'in', clientIds));
    const clientSnapshots = await getDocs(clientsQuery);
    const clientsMap = new Map(
      clientSnapshots.docs.map((snap) => [snap.id, { id: snap.id, ...snap.data() } as Client])
    );

    const enrichedInvoices = invoicesData.map((invoice) => ({
      ...invoice,
      client: clientsMap.get(invoice.clientId),
    }));

    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    enrichedInvoices.forEach(inv => {
      if (inv.status === 'Unpaid' && new Date(inv.dueDate) < today) {
        inv.status = 'Overdue';
      }
    });

    callback(enrichedInvoices);
  });
}

/**
 * Subscribes to the tasks collection.
 * @param db The Firestore instance.
 * @param callback Function to call with the updated list of tasks.
 * @returns Unsubscribe function.
 */
export function subscribeToTasks(db: Firestore, callback: (data: Task[]) => void) {
  const q = query(collection(db, 'tasks'), orderBy('dueDate', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const tasksData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Task[];
    callback(tasksData);
  });
}

/**
 * Subscribes to the inventory collection.
 * @param db The Firestore instance.
 * @param callback Function to call with the updated list of inventory items.
 * @returns Unsubscribe function.
 */
export function subscribeToInventory(db: Firestore, callback: (data: InventoryItem[]) => void) {
  const q = query(collection(db, 'inventory'), orderBy('name', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const inventoryData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InventoryItem[];
    callback(inventoryData);
  });
}


// ============================================================================
// Save / Create / Update Operations
// ============================================================================

export async function saveClient(db: Firestore, id: string | null, data: Omit<Client, 'id'>) {
  if (id) {
    await setDoc(doc(db, 'clients', id), data, { merge: true });
  } else {
    await addDoc(collection(db, 'clients'), data);
  }
}

export async function saveInvoice(db: Firestore, id: string | null, data: Omit<Invoice, 'id' | 'client'>) {
  if (id) {
    await setDoc(doc(db, 'invoices', id), data, { merge: true });
  } else {
    await addDoc(collection(db, 'invoices'), data);
  }
}

export async function saveTask(db: Firestore, id: string | null, data: Omit<Task, 'id'>) {
  if (id) {
    await setDoc(doc(db, 'tasks', id), data, { merge: true });
  } else {
    await addDoc(collection(db, 'tasks'), data);
  }
}

export async function saveInventoryItem(db: Firestore, id: string | null, data: Omit<InventoryItem, 'id'>) {
  if (id) {
    await setDoc(doc(db, 'inventory', id), data, { merge: true });
  } else {
    await addDoc(collection(db, 'inventory'), data);
  }
}


// ============================================================================
// Delete Operations
// ============================================================================

export async function deleteClient(db: Firestore, id: string) {
  await deleteDoc(doc(db, 'clients', id));
}

export async function deleteInvoice(db: Firestore, id: string) {
  await deleteDoc(doc(db, 'invoices', id));
}

export async function deleteTask(db: Firestore, id: string) {
  await deleteDoc(doc(db, 'tasks', id));
}

export async function deleteInventoryItem(db: Firestore, id: string) {
  await deleteDoc(doc(db, 'inventory', id));
}


// ============================================================================
// Quick Updates
// ============================================================================

export async function updateTaskStatus(db: Firestore, id: string, status: TaskStatus) {
    await updateDoc(doc(db, 'tasks', id), { status });
}

export async function updateTaskPriority(db: Firestore, id: string, priority: TaskPriority) {
    await updateDoc(doc(db, 'tasks', id), { priority });
}


// ============================================================================
// Settings and Profile Management
// ============================================================================

export async function saveBusinessProfile(db: Firestore, userId: string, data: BusinessProfile) {
  await setDoc(doc(db, 'profiles', userId), data, { merge: true });
}

export async function getBusinessProfile(db: Firestore, userId: string): Promise<BusinessProfile | null> {
  const docRef = doc(db, 'profiles', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as BusinessProfile) : null;
}

export async function saveInvoiceSettings(db: Firestore, userId: string, data: InvoiceSettings) {
  await setDoc(doc(db, 'profiles', userId, 'settings', 'invoice'), data, { merge: true });
}

export async function getInvoiceSettings(db: Firestore, userId: string): Promise<InvoiceSettings | null> {
  const docRef = doc(db, 'profiles', userId, 'settings', 'invoice');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as InvoiceSettings) : null;
}
