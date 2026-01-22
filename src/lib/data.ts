
import { Client, Invoice, Task, InventoryItem } from './types';

// Omit 'id' as Firestore will generate it.
type SeedClient = Omit<Client, 'id'>;
type SeedInvoice = Omit<Invoice, 'id' | 'clientId'>;
type SeedTask = Omit<Task, 'id'>;
type SeedInventoryItem = Omit<InventoryItem, 'id'>;

export const clients: SeedClient[] = [
  { name: 'Innovate Inc.', email: 'contact@innovate.com', phone: '123-456-7890' },
  { name: 'Quantum Solutions', email: 'support@quantum.com', phone: '987-654-3210' },
  { name: 'Apex Designs', email: 'hello@apex.design', phone: '555-123-4567' },
];

export const invoices: Omit<Invoice, 'id'>[] = [
    { clientId: "INNOVATE_INC_ID", status: 'Paid', dueDate: '2024-05-15', createdAt: '2024-04-15T10:00:00Z', items: [{ description: 'Standard Website Package', quantity: 1, price: 15000 }], subtotal: 15000, tax: 2250, total: 17250 },
    { clientId: "INNOVATE_INC_ID", status: 'Unpaid', dueDate: '2024-07-25', createdAt: '2024-06-25T11:00:00Z', items: [{ description: 'Monthly Retainer - SEO', quantity: 1, price: 5000 }], subtotal: 5000, tax: 750, total: 5750 },
    { clientId: "QUANTUM_SOLUTIONS_ID", status: 'Unpaid', dueDate: '2024-06-20', createdAt: '2024-05-20T14:30:00Z', items: [{ description: 'Pro Website Package', quantity: 1, price: 25000 }], subtotal: 25000, tax: 3750, total: 28750 },
    { clientId: "APEX_DESIGNS_ID", status: 'Draft', dueDate: '2024-07-01', createdAt: '2024-06-15T09:00:00Z', items: [{ description: "Logo Design", quantity: 1, price: 7500}], subtotal: 7500, tax: 1125, total: 8625 }
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
