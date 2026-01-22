
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
  writeBatch,
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
    const clientsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Client[];
    callback(clientsData);
  });
}

export function subscribeToInvoices(db: Firestore, userId: string, callback: (data: Invoice[]) => void) {
  const q = query(getCollectionRef(db, userId, 'invoices'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const invoicesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Invoice[];
    callback(invoicesData);
  });
}

export function subscribeToTasks(db: Firestore, userId: string, callback: (data: Task[]) => void) {
  const q = query(getCollectionRef(db, userId, 'tasks'), orderBy('dueDate', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const tasksData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Task[];
    callback(tasksData);
  });
}

export function subscribeToInventory(db: Firestore, userId: string, callback: (data: InventoryItem[]) => void) {
  const q = query(getCollectionRef(db, userId, 'inventory'), orderBy('name', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const inventoryData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as InventoryItem[];
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

export async function saveInvoice(db: Firestore, userId: string, id: string | null, data: Omit<Invoice, 'id' | 'createdAt'> & { createdAt?: string }) {
  if (id) {
    // Merge true to prevent overwriting createdAt field on updates
    await setDoc(getDocRef(db, userId, 'invoices', id), data, { merge: true });
  } else {
    // Add createdAt timestamp for new documents
    const newData = { ...data, createdAt: new Date().toISOString() };
    await addDoc(getCollectionRef(db, userId, 'invoices'), newData);
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
  const batch = writeBatch(db);
  
  // Delete the client
  const clientDocRef = getDocRef(db, userId, 'clients', id);
  batch.delete(clientDocRef);
  
  // Find and delete all associated invoices
  const invoicesQuery = query(getCollectionRef(db, userId, 'invoices'), where('clientId', '==', id));
  const invoicesSnapshot = await getDocs(invoicesQuery);
  invoicesSnapshot.forEach(doc => batch.delete(doc.ref));

  await batch.commit();
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

export async function updateInvoiceStatus(db: Firestore, userId: string, id: string, status: InvoiceStatus) {
    await updateDoc(getDocRef(db, userId, 'invoices', id), { status });
}

export async function updateTaskStatus(db: Firestore, userId: string, id: string, status: TaskStatus) {
    await updateDoc(getDocRef(db, userId, 'tasks', id), { status });
}

export async function updateTaskPriority(db: Firestore, userId: string, id: string, priority: TaskPriority) {
    await updateDoc(getDocRef(db, userId, 'tasks', id), { priority });
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
