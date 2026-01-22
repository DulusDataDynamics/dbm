
import { Client, Invoice, Task, InventoryItem, InvoiceItem } from './types';

// Omit 'id' as Firestore will generate it.
type SeedClient = Omit<Client, 'id' | 'phone'> & { phone?: string };
type SeedTask = Omit<Task, 'id'>;
type SeedInventoryItem = Omit<InventoryItem, 'id'>;

// For invoices, we need to create items and calculate totals.
// We are omitting id, client, and clientId. The seeder will add clientId.
type SeedInvoice = Omit<Invoice, 'id' | 'client' | 'clientId'>;

export const clients: SeedClient[] = [
  { name: 'Innovate Inc.', email: 'contact@innovate.com', phone: '123-456-7890' },
  { name: 'Quantum Solutions', email: 'support@quantum.com', phone: '987-654-3210' },
  { name: 'Apex Designs', email: 'hello@apex.design', phone: '555-123-4567' },
];

const invoiceItems1: InvoiceItem[] = [
    { description: 'Standard Website Package', quantity: 1, price: 1500, total: 1500 },
];
const invoiceItems2: InvoiceItem[] = [
    { description: 'Pro Website Package', quantity: 1, price: 2500, total: 2500 },
    { description: '1-Hour Consultation', quantity: 2, price: 250, total: 500 },
];
const invoiceItems3: InvoiceItem[] = [
    { description: 'Logo Design', quantity: 1, price: 750, total: 750 },
];

function calculateTotals(items: InvoiceItem[]) {
    const subtotal = items.reduce((acc, item) => acc + item.total, 0);
    const tax = subtotal * 0.15; // Assuming 15% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
}

export const invoices: SeedInvoice[] = [
  { 
    status: 'Paid', 
    dueDate: '2024-05-15', 
    createdAt: new Date('2024-04-15').toISOString(),
    items: invoiceItems1,
    ...calculateTotals(invoiceItems1)
  },
  { 
    status: 'Unpaid', 
    dueDate: '2024-06-20', 
    createdAt: new Date('2024-05-20').toISOString(),
    items: invoiceItems2,
    ...calculateTotals(invoiceItems2)
  },
  { 
    status: 'Overdue', 
    dueDate: '2024-04-01', 
    createdAt: new Date('2024-03-01').toISOString(),
    items: invoiceItems3,
    ...calculateTotals(invoiceItems3)
  },
];


export const tasks: SeedTask[] = [
  { title: 'Follow up with Quantum Solutions', description: 'Discuss the new proposal.', status: 'Pending', priority: 'High', dueDate: '2024-06-10', assignedTo: 'John Doe' },
  { title: 'Prepare Q3 financial report', status: 'In Progress', priority: 'Medium', dueDate: '2024-06-25', assignedTo: 'Jane Smith' },
  { title: 'Onboard Apex Designs', description: 'Send welcome kit and initial questionnaire.', status: 'Completed', priority: 'High', dueDate: '2024-05-20', assignedTo: 'John Doe' },
];

export const inventory: SeedInventoryItem[] = [
  { sku: 'WEB-STD', name: 'Standard Website Package', category: 'Digital Services', quantity: 999, price: 1500, reorderLevel: 0 },
  { sku: 'WEB-PRO', name: 'Pro Website Package', category: 'Digital Services', quantity: 999, price: 2500, reorderLevel: 0 },
  { sku: 'CONSULT-HR', name: '1-Hour Consultation', category: 'Consulting', quantity: 999, price: 250, reorderLevel: 0 },
  { sku: 'LOGO-DESIGN', name: 'Logo Design', category: 'Design', quantity: 999, price: 750, reorderLevel: 0 },
];
