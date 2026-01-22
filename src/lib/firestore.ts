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
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type { Client, Invoice, Task, InventoryItem, BusinessProfile, InvoiceSettings, TaskStatus, TaskPriority, InvoiceStatus } from './types';

function getCollectionRef(db: Firestore, userId: string, collectionName: string) {
    return collection(db, 'users', userId, collectionName);
}

function getDocRef(db: Firestore, userId: string, collectionName: string, docId: string) {
    return doc(db, 'users', userId, collectionName, docId);
}

// ============================================================================
// Real-time Subscriptions
// ============================================================================

export function subscribeToClients(db: Firestore, userId: string, callback: (data: Client[]) => void) {
  const q = query(getCollectionRef(db, userId, 'clients'), orderBy('name', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const clientsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Client[];
    callback(clientsData);
  });
}

export function subscribeToInvoices(db: Firestore, userId: string, callback: (data: Invoice[]) => void) {
  const q = query(getCollectionRef(db, userId, 'invoices'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const invoices = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Invoice[];

    // Handle overdue status logic here, as it's pure data transformation
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    invoices.forEach(inv => {
      if (inv.status === 'Unpaid' && new Date(inv.dueDate) < today) {
        inv.status = 'Overdue';
      }
    });

    callback(invoices);
  });
}


export function subscribeToTasks(db: Firestore, userId: string, callback: (data: Task[]) => void) {
  const q = query(getCollectionRef(db, userId, 'tasks'), orderBy('dueDate', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const tasksData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Task[];
    callback(tasksData);
  });
}

export function subscribeToInventory(db: Firestore, userId: string, callback: (data: InventoryItem[]) => void) {
  const q = query(getCollectionRef(db, userId, 'inventory'), orderBy('name', 'asc'));
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

export async function saveClient(db: Firestore, userId: string, id: string | null, data: Omit<Client, 'id'>) {
  if (id) {
    await setDoc(getDocRef(db, userId, 'clients', id), data, { merge: true });
  } else {
    await addDoc(getCollectionRef(db, userId, 'clients'), data);
  }
}

export async function saveInvoice(db: Firestore, userId: string, id: string | null, data: Omit<Invoice, 'id' | 'client'>) {
  const invoiceData = {
    ...data,
    createdAt: data.createdAt || new Date().toISOString()
  };
  
  if (id) {
    await setDoc(getDocRef(db, userId, 'invoices', id), invoiceData, { merge: true });
  } else {
    await addDoc(getCollectionRef(db, userId, 'invoices'), invoiceData);
  }
}

export async function saveTask(db: Firestore, userId: string, id: string | null, data: Omit<Task, 'id'>) {
  if (id) {
    await setDoc(getDocRef(db, userId, 'tasks', id), data, { merge: true });
  } else {
    await addDoc(getCollectionRef(db, userId, 'tasks'), data);
  }
}

export async function saveInventoryItem(db: Firestore, userId: string, id: string | null, data: Omit<InventoryItem, 'id'>) {
  if (id) {
    await setDoc(getDocRef(db, userId, 'inventory', id), data, { merge: true });
  } else {
    await addDoc(getCollectionRef(db, userId, 'inventory'), data);
  }
}

// ============================================================================
// Delete Operations
// ============================================================================

export async function deleteClient(db: Firestore, userId: string, id: string) {
  await deleteDoc(getDocRef(db, userId, 'clients', id));
}

export async function deleteInvoice(db: Firestore, userId: string, id: string) {
  await deleteDoc(getDocRef(db, userId, 'invoices', id));
}

export async function deleteTask(db: Firestore, userId: string, id: string) {
  await deleteDoc(getDocRef(db, userId, 'tasks', id));
}

export async function deleteInventoryItem(db: Firestore, userId: string, id: string) {
  await deleteDoc(getDocRef(db, userId, 'inventory', id));
}

// ============================================================================
// Quick Updates & Actions
// ============================================================================

export async function updateTaskStatus(db: Firestore, userId: string, id: string, status: TaskStatus) {
    await updateDoc(getDocRef(db, userId, 'tasks', id), { status });
}

export async function updateTaskPriority(db: Firestore, userId: string, id: string, priority: TaskPriority) {
    await updateDoc(getDocRef(db, userId, 'tasks', id), { priority });
}

export async function updateInvoiceStatus(db: Firestore, userId: string, id: string, status: InvoiceStatus) {
    await updateDoc(getDocRef(db, userId, 'invoices', id), { status });
}

export async function duplicateInvoice(db: Firestore, userId: string, invoice: Invoice) {
    const { id, client, status, ...newInvoiceData } = invoice;
    const duplicatedInvoice = {
        ...newInvoiceData,
        status: 'Draft' as InvoiceStatus,
        createdAt: new Date().toISOString(),
        dueDate: new Date().toISOString().split('T')[0], // Set due date to today for the new draft
    };
    await addDoc(getCollectionRef(db, userId, 'invoices'), duplicatedInvoice);
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
  // Settings are stored in a subcollection of the user's profile
  await setDoc(doc(db, 'profiles', userId, 'settings', 'invoice'), data, { merge: true });
}

export async function getInvoiceSettings(db: Firestore, userId: string): Promise<InvoiceSettings | null> {
  const docRef = doc(db, 'profiles', userId, 'settings', 'invoice');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as InvoiceSettings) : null;
}
