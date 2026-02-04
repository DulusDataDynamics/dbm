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
  writeBatch,
} from 'firebase/firestore';
import type { Client, Invoice, Task, InventoryItem, BusinessProfile, InvoiceSettings, TaskStatus, TaskPriority, InvoiceStatus, InvoiceItem } from './types';
import { calculateInvoiceTotals } from './utils';

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
// Invoice Specific Logic (Auto-Merge)
// ============================================================================

export async function addItemToClientInvoice(db: Firestore, userId: string, clientId: string, newItem: InvoiceItem) {
  const invoicesRef = getCollectionRef(db, userId, 'invoices');
  const q = query(invoicesRef, where('clientId', '==', clientId));
  
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    // No invoice for this client, create a new one
    const { subtotal, tax, total } = calculateInvoiceTotals([newItem], 0); // No tax
    const newInvoiceData = {
      clientId,
      items: [newItem],
      subtotal,
      tax,
      total,
      status: 'Draft' as InvoiceStatus,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(), // Default due date 30 days from now
      createdAt: new Date().toISOString(),
    };
    await addDoc(invoicesRef, newInvoiceData);
  } else {
    // Existing invoice found, update it
    const invoiceDoc = querySnapshot.docs[0];
    const invoiceData = invoiceDoc.data() as Invoice;

    const updatedItems = [...invoiceData.items, newItem];
    const { subtotal, tax, total } = calculateInvoiceTotals(updatedItems, 0); // No tax

    await updateDoc(invoiceDoc.ref, {
      items: updatedItems,
      subtotal,
      tax,
      total,
      createdAt: new Date().toISOString(), // Update timestamp to reflect recent activity
    });
  }
}


// ============================================================================
// Delete Operations
// ============================================================================

export async function deleteClient(db: Firestore, userId: string, id: string) {
  const batch = writeBatch(db);
  
  const clientDocRef = getDocRef(db, userId, 'clients', id);
  batch.delete(clientDocRef);
  
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
  await setDoc(doc(db, 'profiles', userId, 'settings', 'invoice'), data, { merge: true });
}

export async function getInvoiceSettings(db: Firestore, userId: string): Promise<InvoiceSettings | null> {
  const docRef = doc(db, 'profiles', userId, 'settings', 'invoice');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as InvoiceSettings) : null;
}
