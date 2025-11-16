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
} from 'firebase/firestore';
import { db } from './firebase';
import { Client, Invoice, Task, InventoryItem, BusinessProfile, InvoiceSettings, TaskStatus, TaskPriority } from './types';

// ============================================================================
// Real-time Subscriptions
// ============================================================================

/**
 * Subscribes to the clients collection and provides real-time updates.
 * @param callback Function to call with the updated list of clients.
 * @returns Unsubscribe function.
 */
export function subscribeToClients(callback: (data: Client[]) => void) {
  const q = query(collection(db, 'clients'));
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
    const clientSnapshots = await getDocs(clientsQuery);
    const clientsMap = new Map(
      clientSnapshots.docs.map((snap) => [snap.id, { id: snap.id, ...snap.data() } as Client])
    );

    const enrichedInvoices = invoicesData.map((invoice) => ({
      ...invoice,
      client: clientsMap.get(invoice.clientId),
    }));

    // Update invoice status if overdue
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    enrichedInvoices.forEach(inv => {
      if (inv.status === 'Unpaid' && new Date(inv.dueDate) < today) {
        inv.status = 'Overdue';
        // Optionally, you could write this change back to Firestore here
        // updateDoc(doc(db, 'invoices', inv.id), { status: 'Overdue' });
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
  const q = query(collection(db, 'tasks'));
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
  const q = query(collection(db, 'inventory'));
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

/**
 * Creates or updates a client document.
 * @param id Optional ID of the client to update. If null, a new client is created.
 * @param data The client data to save.
 */
export async function saveClient(id: string | null, data: Omit<Client, 'id'>) {
  if (id) {
    await setDoc(doc(db, 'clients', id), data, { merge: true });
  } else {
    await addDoc(collection(db, 'clients'), data);
  }
}

/**
 * Creates or updates an invoice document.
 * @param id Optional ID of the invoice to update. If null, a new invoice is created.
 * @param data The invoice data to save.
 */
export async function saveInvoice(id: string | null, data: Omit<Invoice, 'id' | 'client'>) {
  if (id) {
    await setDoc(doc(db, 'invoices', id), data, { merge: true });
  } else {
    await addDoc(collection(db, 'invoices'), data);
  }
}

/**
 * Creates or updates a task document.
 * @param id Optional ID of the task to update. If null, a new task is created.
 * @param data The task data to save.
 */
export async function saveTask(id: string | null, data: Omit<Task, 'id'>) {
  if (id) {
    await setDoc(doc(db, 'tasks', id), data, { merge: true });
  } else {
    await addDoc(collection(db, 'tasks'), data);
  }
}

/**
 * Creates or updates an inventory item document.
 * @param id Optional ID of the item to update. If null, a new item is created.
 * @param data The inventory item data to save.
 */
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

/**
 * Saves the business profile for a given user.
 * @param userId The UID of the user.
 * @param data The business profile data.
 */
export async function saveBusinessProfile(userId: string, data: BusinessProfile) {
  await setDoc(doc(db, 'profiles', userId), data, { merge: true });
}

/**
 * Retrieves the business profile for a given user.
 * @param userId The UID of the user.
 * @returns The business profile data or null if not found.
 */
export async function getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
  const docRef = doc(db, 'profiles', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as BusinessProfile) : null;
}

/**
 * Saves the invoice settings for a given user.
 * @param userId The UID of the user.
 * @param data The invoice settings data.
 */
export async function saveInvoiceSettings(userId: string, data: InvoiceSettings) {
  await setDoc(doc(db, 'profiles', userId, 'settings', 'invoice'), data, { merge: true });
}

/**
 * Retrieves the invoice settings for a given user.
 * @param userId The UID of the user.
 * @returns The invoice settings data or null if not found.
 */
export async function getInvoiceSettings(userId: string): Promise<InvoiceSettings | null> {
  const docRef = doc(db, 'profiles', userId, 'settings', 'invoice');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as InvoiceSettings) : null;
}
