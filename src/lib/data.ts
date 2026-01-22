
import { Client, Invoice, Task, InventoryItem, InvoiceItem } from './types';

// Omit 'id' as Firestore will generate it.
type SeedClient = Omit<Client, 'id' | 'phone' | 'invoice'> & { phone?: string, invoice?: Invoice };
type SeedTask = Omit<Task, 'id'>;
type SeedInventoryItem = Omit<InventoryItem, 'id'>;

export const clients: SeedClient[] = [
  { name: 'Innovate Inc.', email: 'contact@innovate.com', phone: '123-456-7890', invoice: { status: 'Paid', dueDate: '2024-05-15', items: [{ description: 'Standard Website Package', quantity: 1, price: 1500 }], total: 1725 }},
  { name: 'Quantum Solutions', email: 'support@quantum.com', phone: '987-654-3210', invoice: { status: 'Sent', dueDate: '2024-06-20', items: [{ description: 'Pro Website Package', quantity: 1, price: 2500 }], total: 2875 } },
  { name: 'Apex Designs', email: 'hello@apex.design', phone: '555-123-4567', invoice: { status: 'Draft', dueDate: '2024-07-01', items: [], total: 0 } },
];

export const tasks: SeedTask[] = [
  { title: 'Follow up with Quantum Solutions', description: 'Discuss the new proposal.', status: 'Pending', priority: 'High', dueDate: '2024-06-10', assignedTo: 'John Doe' },
  { title: 'Prepare Q3 financial report', status: 'In Progress', priority: 'Medium', dueDate: '2024-06-25', assignedTo: 'Jane Smith' },
  { title: 'Onboard Apex Designs', description: 'Send welcome kit and initial questionnaire.', status: 'Completed', priority: 'High', dueDate: '2024-05-20', assignedTo: 'John Doe' },
];

export const inventory: SeedInventoryItem[] = [
  { sku: 'WEB-STD', name: 'Standard Website Package', quantity: 999, price: 1500 },
  { sku: 'WEB-PRO', name: 'Pro Website Package', quantity: 999, price: 2500 },
  { sku: 'CONSULT-HR', name: '1-Hour Consultation', quantity: 999, price: 250 },
];
