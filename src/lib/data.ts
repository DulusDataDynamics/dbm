// This file contains the initial seed data for the application.
// It is only used by the /api/seed route to populate the database.
// The application itself fetches data from Firestore in real-time.

import { Client, Invoice, Task, InventoryItem, TaskStatus, TaskPriority } from './types';

export const clients: Omit<Client, 'id'>[] = [];

export const invoices: Omit<Invoice, 'id' | 'client'>[] = [];

export const tasks: Omit<Task, 'id'>[] = [];

export const inventory: Omit<InventoryItem, 'id'>[] = [];
