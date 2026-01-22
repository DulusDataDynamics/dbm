
import { Client, Invoice, Task, InventoryItem } from './types';

// Omit 'id' as Firestore will generate it.
type SeedClient = Omit<Client, 'id' | 'phone'> & { phone?: string };
type SeedInvoice = Omit<Invoice, 'id' | 'client' | 'clientId'> & { clientId?: string };
type SeedTask = Omit<Task, 'id'>;
type SeedInventoryItem = Omit<InventoryItem, 'id'>;

export const clients: SeedClient[] = [
  { name: 'Innovate Inc.', email: 'contact@innovate.com', phone: '123-456-7890' },
  { name: 'Quantum Solutions', email: 'support@quantum.com', phone: '987-654-3210' },
  { name: 'Apex Designs', email: 'hello@apex.design', phone: '555-123-4567' },
];

export const invoices: SeedInvoice[] = [
  { amount: 1500, status: 'Paid', dueDate: '2024-05-15' },
  { amount: 3000, status: 'Unpaid', dueDate: '2024-06-20' },
  { amount: 750, status: 'Overdue', dueDate: '2024-04-01' },
  { amount: 2500, status: 'Paid', dueDate: '2024-05-25' },
];

export const tasks: SeedTask[] = [
  { title: 'Follow up with Quantum Solutions', description: 'Discuss the new proposal.', status: 'Pending', priority: 'High', dueDate: '2024-06-10', assignedTo: 'John Doe' },
  { title: 'Prepare Q3 financial report', status: 'In Progress', priority: 'Medium', dueDate: '2024-06-25', assignedTo: 'Jane Smith' },
  { title: 'Onboard Apex Designs', description: 'Send welcome kit and initial questionnaire.', status: 'Completed', priority: 'High', dueDate: '2024-05-20', assignedTo: 'John Doe' },
];

export const inventory: SeedInventoryItem[] = [
  { sku: 'WEB-STD', name: 'Standard Website Package', category: 'Digital Services', quantity: 999, price: 1500, reorderLevel: 0 },
  { sku: 'WEB-PRO', name: 'Pro Website Package', category: 'Digital Services', quantity: 999, price: 3000, reorderLevel: 0 },
  { sku: 'CONSULT-HR', name: '1-Hour Consultation', category: 'Consulting', quantity: 999, price: 750, reorderLevel: 0 },
  { sku: 'LOGO-DESIGN', name: 'Logo Design', category: 'Design', quantity: 999, price: 2500, reorderLevel: 0 },
];
