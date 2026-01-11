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
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Client, Invoice, Task, InventoryItem, BusinessProfile, InvoiceSettings, TaskStatus, TaskPriority } from './types';

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
  }, (error) => {
    console.error("Error subscribing to clients:", error);
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: `users/${userId}/clients`,
      operation: 'list',
    }));
  });
}

export function subscribeToInvoices(db: Firestore, userId: string, callback: (data: Invoice[]) => void) {
  const invoicesRef = getCollectionRef(db, userId, 'invoices');
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

    const clientsQuery = query(getCollectionRef(db, userId, 'clients'), where('__name__', 'in', clientIds));
    const clientSnaps = await getDocs(clientsQuery);
    const clientsMap = new Map(
      clientSnaps.docs.map((snap) => [snap.id, { id: snap.id, ...snap.data() } as Client])
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
  }, (error) => {
    console.error("Error subscribing to invoices:", error);
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: `users/${userId}/invoices`,
      operation: 'list',
    }));
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
  }, (error) => {
    console.error("Error subscribing to tasks:", error);
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: `users/${userId}/tasks`,
      operation: 'list',
    }));
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
  }, (error) => {
    console.error("Error subscribing to inventory:", error);
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: `users/${userId}/inventory`,
      operation: 'list',
    }));
  });
}

// ============================================================================
// Save / Create / Update Operations
// ============================================================================

export function saveClient(db: Firestore, userId: string, id: string | null, data: Omit<Client, 'id'>) {
  const operation = id ? 'update' : 'create';
  const docRef = id ? getDocRef(db, userId, 'clients', id) : doc(getCollectionRef(db, userId, 'clients'));
  
  setDoc(docRef, data, { merge: !!id })
    .catch((serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: operation,
        requestResourceData: data,
      }));
    });
}

export function saveInvoice(db: Firestore, userId: string, id: string | null, data: Omit<Invoice, 'id' | 'client'>) {
  const operation = id ? 'update' : 'create';
  const docRef = id ? getDocRef(db, userId, 'invoices', id) : doc(getCollectionRef(db, userId, 'invoices'));

  setDoc(docRef, data, { merge: !!id })
    .catch((serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: operation,
        requestResourceData: data,
      }));
    });
}

export function saveTask(db: Firestore, userId: string, id: string | null, data: Omit<Task, 'id'>) {
  const operation = id ? 'update' : 'create';
  const docRef = id ? getDocRef(db, userId, 'tasks', id) : doc(getCollectionRef(db, userId, 'tasks'));

  setDoc(docRef, data, { merge: !!id })
    .catch((serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: operation,
        requestResourceData: data,
      }));
    });
}

export function saveInventoryItem(db: Firestore, userId: string, id: string | null, data: Omit<InventoryItem, 'id'>) {
  const operation = id ? 'update' : 'create';
  const docRef = id ? getDocRef(db, userId, 'inventory', id) : doc(getCollectionRef(db, userId, 'inventory'));

  setDoc(docRef, data, { merge: !!id })
    .catch((serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: operation,
        requestResourceData: data,
      }));
    });
}


// ============================================================================
// Delete Operations
// ============================================================================

export function deleteClient(db: Firestore, userId: string, id: string) {
  const docRef = getDocRef(db, userId, 'clients', id);
  deleteDoc(docRef)
    .catch((serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      }));
    });
}

export function deleteInvoice(db: Firestore, userId: string, id: string) {
  const docRef = getDocRef(db, userId, 'invoices', id);
  deleteDoc(docRef)
    .catch((serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      }));
    });
}

export function deleteTask(db: Firestore, userId: string, id: string) {
  const docRef = getDocRef(db, userId, 'tasks', id);
  deleteDoc(docRef)
    .catch((serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      }));
    });
}

export function deleteInventoryItem(db: Firestore, userId: string, id: string) {
  const docRef = getDocRef(db, userId, 'inventory', id);
  deleteDoc(docRef)
    .catch((serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      }));
    });
}

// ============================================================================
// Quick Updates
// ============================================================================

export function updateTaskStatus(db: Firestore, userId: string, id: string, status: TaskStatus) {
    const docRef = getDocRef(db, userId, 'tasks', id);
    updateDoc(docRef, { status })
      .catch((serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: { status },
        }));
      });
}

export function updateTaskPriority(db: Firestore, userId: string, id: string, priority: TaskPriority) {
    const docRef = getDocRef(db, userId, 'tasks', id);
    updateDoc(docRef, { priority })
     .catch((serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: { priority },
        }));
      });
}

// ============================================================================
// Settings and Profile Management
// ============================================================================

export function saveBusinessProfile(db: Firestore, userId: string, data: BusinessProfile) {
  const docRef = doc(db, 'profiles', userId);
  setDoc(docRef, data, { merge: true })
    .catch((serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: data,
      }));
    });
}

export async function getBusinessProfile(db: Firestore, userId: string): Promise<BusinessProfile | null> {
  const docRef = doc(db, 'profiles', userId);
   try {
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as BusinessProfile) : null;
  } catch(error) {
     errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'get',
      }));
      return null;
  }
}

export function saveInvoiceSettings(db: Firestore, userId: string, data: InvoiceSettings) {
  const docRef = doc(db, 'profiles', userId, 'settings', 'invoice');
  setDoc(docRef, data, { merge: true })
    .catch((serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: data,
      }));
    });
}

export async function getInvoiceSettings(db: Firestore, userId: string): Promise<InvoiceSettings | null> {
  const docRef = doc(db, 'profiles', userId, 'settings', 'invoice');
   try {
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as InvoiceSettings) : null;
  } catch(error) {
     errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'get',
      }));
      return null;
  }
}
