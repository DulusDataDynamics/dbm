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
} from "firebase/firestore";
import { auth } from "@/firebase/client-provider";
import type {
  Client,
  Invoice,
  Task,
  InventoryItem,
  BusinessProfile,
  InvoiceSettings,
  TaskStatus,
  TaskPriority,
} from "./types.client";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function requireBusinessId(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not authenticated");
  return uid;
}

function pathError(path: string, operation: 'get' | 'list' | 'create' | 'update' | 'delete', data?: any) {
  errorEmitter.emit(
    "permission-error",
    new FirestorePermissionError({
      path,
      operation,
      requestResourceData: data,
    })
  );
}

/* -------------------------------------------------------------------------- */
/* Real-time Subscriptions                                                     */
/* -------------------------------------------------------------------------- */

export function subscribeToClients(
  db: Firestore,
  callback: (data: Client[]) => void
) {
  const businessId = requireBusinessId();
  const q = query(
    collection(db, "businesses", businessId, "clients"),
    orderBy("name", "asc")
  );

  return onSnapshot(
    q,
    (snap) =>
      callback(
        snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Client[]
      ),
    () => pathError(`businesses/${businessId}/clients`, "list")
  );
}

export function subscribeToInvoices(
  db: Firestore,
  callback: (data: Invoice[]) => void
) {
  const businessId = requireBusinessId();

  const invoicesRef = collection(
    db,
    "businesses",
    businessId,
    "invoices"
  );

  const q = query(invoicesRef, orderBy("dueDate", "desc"));

  return onSnapshot(
    q,
    async (snapshot) => {
      const invoices = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Invoice, "id">),
      }));

      if (!invoices.length) {
        callback([]);
        return;
      }

      const clientIds = [
        ...new Set(invoices.map((i) => i.clientId).filter(Boolean)),
      ];

      let clientsMap = new Map<string, Client>();

      if (clientIds.length) {
        const clientsQuery = query(
          collection(db, "businesses", businessId, "clients"),
          where("__name__", "in", clientIds)
        );

        const clientSnaps = await getDocs(clientsQuery);
        clientsMap = new Map(
          clientSnaps.docs.map((d) => [
            d.id,
            { id: d.id, ...d.data() } as Client,
          ])
        );
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      callback(
        invoices.map((inv) => ({
          ...inv,
          client: clientsMap.get(inv.clientId),
          status:
            inv.status === "Unpaid" && new Date(inv.dueDate) < today
              ? "Overdue"
              : inv.status,
        }))
      );
    },
    () => pathError(`businesses/${businessId}/invoices`, "list")
  );
}

export function subscribeToTasks(
  db: Firestore,
  callback: (data: Task[]) => void
) {
  const businessId = requireBusinessId();
  const q = query(
    collection(db, "businesses", businessId, "tasks"),
    orderBy("dueDate", "asc")
  );

  return onSnapshot(
    q,
    (snap) =>
      callback(
        snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Task[]
      ),
    () => pathError(`businesses/${businessId}/tasks`, "list")
  );
}

export function subscribeToInventory(
  db: Firestore,
  callback: (data: InventoryItem[]) => void
) {
  const businessId = requireBusinessId();
  const q = query(
    collection(db, "businesses", businessId, "inventory"),
    orderBy("name", "asc")
  );

  return onSnapshot(
    q,
    (snap) =>
      callback(
        snap.docs.map((d) => ({ id: d.id, ...d.data() })) as InventoryItem[]
      ),
    () => pathError(`businesses/${businessId}/inventory`, "list")
  );
}

/* -------------------------------------------------------------------------- */
/* Save / Create / Update                                                      */
/* -------------------------------------------------------------------------- */

export function saveClient(
  db: Firestore,
  id: string | null,
  data: Omit<Client, "id">
) {
  const businessId = requireBusinessId();
  const payload = { ...data, businessId };

  if (id) {
    setDoc(
      doc(db, "businesses", businessId, "clients", id),
      payload,
      { merge: true }
    ).catch(() => pathError(`businesses/${businessId}/clients/${id}`, "update", payload));
  } else {
    addDoc(
      collection(db, "businesses", businessId, "clients"),
      payload
    ).catch(() => pathError(`businesses/${businessId}/clients`, "create", payload));
  }
}

export function saveInvoice(
  db: Firestore,
  id: string | null,
  data: Omit<Invoice, "id" | "client">
) {
  const businessId = requireBusinessId();
  const payload = { ...data, businessId };

  if (id) {
    const ref = doc(db, "businesses", businessId, "invoices", id);
    setDoc(ref, payload, { merge: true }).catch(() =>
      pathError(ref.path, "update", payload)
    );
  } else {
    const ref = collection(db, "businesses", businessId, "invoices");
    addDoc(ref, payload).catch(() =>
      pathError(ref.path, "create", payload)
    );
  }
}

export function saveTask(
  db: Firestore,
  id: string | null,
  data: Omit<Task, "id">
) {
  const businessId = requireBusinessId();
  const payload = { ...data, businessId };

  if (id) {
    const ref = doc(db, "businesses", businessId, "tasks", id);
    setDoc(ref, payload, { merge: true }).catch(() =>
      pathError(ref.path, "update", payload)
    );
  } else {
    const ref = collection(db, "businesses", businessId, "tasks");
    addDoc(ref, payload).catch(() =>
      pathError(ref.path, "create", payload)
    );
  }
}

export function saveInventoryItem(
  db: Firestore,
  id: string | null,
  data: Omit<InventoryItem, "id">
) {
  const businessId = requireBusinessId();
  const payload = { ...data, businessId };

  if (id) {
    const ref = doc(db, "businesses", businessId, "inventory", id);
    setDoc(ref, payload, { merge: true }).catch(() =>
      pathError(ref.path, "update", payload)
    );
  } else {
    const ref = collection(db, "businesses", businessId, "inventory");
    addDoc(ref, payload).catch(() =>
      pathError(ref.path, "create", payload)
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Delete                                                                      */
/* -------------------------------------------------------------------------- */

function deleteByPath(
  db: Firestore,
  collectionName: string,
  id: string
) {
  const businessId = requireBusinessId();
  const docRef = doc(db, "businesses", businessId, collectionName, id);
  deleteDoc(docRef).catch(() => pathError(docRef.path, "delete"));
}

export const deleteClient = (db: Firestore, id: string) => deleteByPath(db, "clients", id);
export const deleteInvoice = (db: Firestore, id: string) => deleteByPath(db, "invoices", id);
export const deleteTask = (db: Firestore, id: string) => deleteByPath(db, "tasks", id);
export const deleteInventoryItem = (db: Firestore, id: string) => deleteByPath(db, "inventory", id);


/* -------------------------------------------------------------------------- */
/* Quick Updates                                                               */
/* -------------------------------------------------------------------------- */

export function updateTaskStatus(
  db: Firestore,
  id: string,
  status: TaskStatus
) {
  const businessId = requireBusinessId();
  const docRef = doc(db, "businesses", businessId, "tasks", id);
  updateDoc(docRef, { status }).catch(() =>
    pathError(docRef.path, "update", { status })
  );
}

export function updateTaskPriority(
  db: Firestore,
  id: string,
  priority: TaskPriority
) {
  const businessId = requireBusinessId();
  const docRef = doc(db, "businesses", businessId, "tasks", id);
  updateDoc(docRef, { priority }).catch(() =>
    pathError(docRef.path, "update", { priority })
  );
}

/* -------------------------------------------------------------------------- */
/* Business Profile & Settings                                                 */
/* -------------------------------------------------------------------------- */

export function saveBusinessProfile(
  db: Firestore,
  data: BusinessProfile
) {
  const businessId = requireBusinessId();
  const docRef = doc(db, "businesses", businessId);
  setDoc(docRef, data, { merge: true }).catch(() =>
    pathError(docRef.path, "update", data)
  );
}

export async function getBusinessProfile(
  db: Firestore
): Promise<BusinessProfile | null> {
  const businessId = requireBusinessId();
  const docRef = doc(db, "businesses", businessId);
  try {
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as BusinessProfile) : null;
  } catch {
    pathError(docRef.path, "get");
    return null;
  }
}

export function saveInvoiceSettings(
  db: Firestore,
  data: InvoiceSettings
) {
  const businessId = requireBusinessId();
  const docRef = doc(db, "businesses", businessId, "settings", "invoice");
  setDoc(docRef, data, { merge: true }).catch(() =>
    pathError(docRef.path, "update", data)
  );
}

export async function getInvoiceSettings(
  db: Firestore
): Promise<InvoiceSettings | null> {
  const businessId = requireBusinessId();
  const docRef = doc(db, "businesses", businessId, "settings", "invoice");
  try {
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as InvoiceSettings) : null;
  } catch {
    pathError(docRef.path, "get");
    return null;
  }
}
