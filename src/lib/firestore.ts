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
import { db } from './firebase-client';

// ============================================================================
// Real-time Subscriptions
// ============================================================================

/**
 * Subscribes to the clients collection and provides real-time updates.
 * @param callback Function to call with the updated list of clients.
 * @returns Unsubscribe function.
 */
export function subscribeToClients(callback: (data: Client[]) => void) {
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
 * @param callback Function to call with the updated list of invoices.
 * @returns Unsubscribe function.
 */
export function subscribeToInvoices(callback: (data: Invoice[]) => void) {
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
    const clientSnaps = await getDocs(clientsQuery);
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
 * @param callback Function to call with the updated list of tasks.
 * @returns Unsubscribe function.
 */
export function subscribeToTasks(callback: (data: Task[]) => void) {
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
 * @param callback Function to call with the updated list of inventory items.
 * @returns Unsubscribe function.
 */
export function subscribeToInventory(callback: (data: InventoryItem[]) => void) {
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

export async function saveClient(id: string | null, data: Omit<Client, 'id'>) {
  if (id) {
    await setDoc(doc(db, 'clients', id), data, { merge: true });
  } else {
    await addDoc(collection(db, 'clients'), data);
  }
}

export async function saveInvoice(id: string | null, data: Omit<Invoice, 'id' | 'client'>) {
  if (id) {
    await setDoc(doc(db, 'invoices', id), data, { merge: true });
  } else {
    await addDoc(collection(db, 'invoices'), data);
  }
}

export async function saveTask(id: string | null, data: Omit<Task, 'id'>) {
  if (id) {
    await setDoc(doc(db, 'tasks', id), data, { merge: true });
  } else {
    await addDoc(collection(db, 'tasks'), data);
  }
}

export async function saveInventoryItem(id: string | null, data: Omit<InventoryItem, 'id'>) {
  if (id) {
    await setDoc(doc(db, 'inventory', id), data, { merge: true });
  } else {
    await addDoc(collection(db, 'inventory'), data);
  }
}


// ============================================================================
// Delete Operations
// ============================================================================

export async function deleteClient(id: string) {
  await deleteDoc(doc(db, 'clients', id));
}

export async function deleteInvoice(id: string) {
  await deleteDoc(doc(db, 'invoices', id));
}

export async function deleteTask(id: string) {
  await deleteDoc(doc(db, 'tasks', id));
}

export async function deleteInventoryItem(id: string) {
  await deleteDoc(doc(db, 'inventory', id));
}


// ============================================================================
// Quick Updates
// ============================================================================

export async function updateTaskStatus(id: string, status: TaskStatus) {
    await updateDoc(doc(db, 'tasks', id), { status });
}

export async function updateTaskPriority(id: string, priority: TaskPriority) {
    await updateDoc(doc(db, 'tasks', id), { priority });
}


// ============================================================================
// Settings and Profile Management
// ============================================================================

export async function saveBusinessProfile(userId: string, data: BusinessProfile) {
  await setDoc(doc(db, 'profiles', userId), data, { merge: true });
}

export async function getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
  const docRef = doc(db, 'profiles', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as BusinessProfile) : null;
}

export async function saveInvoiceSettings(userId: string, data: InvoiceSettings) {
  await setDoc(doc(db, 'profiles', userId, 'settings', 'invoice'), data, { merge: true });
}

export async function getInvoiceSettings(userId: string): Promise<InvoiceSettings | null> {
  const docRef = doc(db, 'profiles', userId, 'settings', 'invoice');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as InvoiceSettings) : null;
}
