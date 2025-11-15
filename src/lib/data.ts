// This file contains the initial seed data for the application.
// It is only used by the /api/seed route to populate the database.
// The application itself fetches data from Firestore in real-time.

import { Client, Invoice, Task, InventoryItem, TaskStatus, TaskPriority } from './types';

export const clients: Omit<Client, 'id'>[] = [
  { name: 'Innovate LLC', email: 'contact@innovate.com', phone: '555-0101' },
  { name: 'Quantum Solutions', email: 'support@quantum.dev', phone: '555-0102' },
  { name: 'Apex Designs', email: 'hello@apexdesigns.io', phone: '555-0103' },
  { name: 'Starlight Media', email: 'team@starlight.co', phone: '555-0104' },
  { name: 'Momentum Inc.', email: 'admin@momentum.inc', phone: '555-0105' },
];

export const invoices: Omit<Invoice, 'id' | 'client'>[] = [
  { clientId: '1', amount: 2500, status: 'Paid', dueDate: '2024-06-01' },
  { clientId: '2', amount: 1800, status: 'Paid', dueDate: '2024-06-05' },
  { clientId: '3', amount: 3200, status: 'Unpaid', dueDate: '2024-07-15' },
  { clientId: '4', amount: 500, status: 'Overdue', dueDate: '2024-05-20' },
  { clientId: '1', amount: 4500, status: 'Unpaid', dueDate: '2024-07-30' },
  { clientId: '5', amount: 2200, status: 'Paid', dueDate: '2024-06-12' },
];

export const tasks: Omit<Task, 'id'>[] = [
  { title: 'Finalize project proposal for Quantum Solutions', description: 'Review and send the final proposal document.', status: 'In Progress' as TaskStatus, priority: 'High' as TaskPriority, dueDate: '2024-07-10' },
  { title: 'Follow up with Apex Designs on invoice INV-003', description: 'Client has an outstanding balance.', status: 'Pending' as TaskStatus, priority: 'Medium' as TaskPriority, dueDate: '2024-07-12' },
  { title: 'Onboard new client Momentum Inc.', description: 'Initial setup and welcome meeting.', status: 'Completed' as TaskStatus, priority: 'High' as TaskPriority, dueDate: '2024-07-08' },
  { title: 'Prepare monthly financial report', description: 'Summarize income and expenses for June.', status: 'Pending' as TaskStatus, priority: 'Low' as TaskPriority, dueDate: '2024-07-25' },
  { title: 'Update inventory for new stock shipment', description: 'Add new items received today.', status: 'In Progress' as TaskStatus, priority: 'Medium' as TaskPriority, dueDate: '2024-07-09' },
];

export const inventory: Omit<InventoryItem, 'id'>[] = [
  { sku: 'DBM-PRO-001', name: 'Pro Website Package', category: 'Digital Services', quantity: 15, price: 2500, reorderLevel: 5 },
  { sku: 'DBM-STD-001', name: 'Standard Logo Design', category: 'Design', quantity: 30, price: 800, reorderLevel: 10 },
  { sku: 'DBM-HR-CON', name: 'Hourly Consulting', category: 'Services', quantity: 100, price: 150, reorderLevel: 20 },
  { sku: 'DBM-SOC-MGT', name: 'Social Media Mgmt (Month)', category: 'Marketing', quantity: 8, price: 1200, reorderLevel: 3 },
  { sku: 'DBM-SEO-AUD', name: 'SEO Audit', category: 'Marketing', quantity: 22, price: 600, reorderLevel: 10 },
];
