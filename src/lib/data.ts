
import { Client, Invoice, Task, Load } from './types';

// Omit 'id' as Firestore will generate it.
type SeedClient = Omit<Client, 'id'>;
type SeedTask = Omit<Task, 'id'>;
type SeedLoad = Omit<Load, 'id'>;

export const clients: SeedClient[] = [
  { name: 'Innovate Inc.', email: 'contact@innovate.com', phone: '123-456-7890' },
  { name: 'Quantum Solutions', email: 'support@quantum.com', phone: '987-654-3210' },
  { name: 'Apex Designs', email: 'hello@apex.design', phone: '555-123-4567' },
];

export const invoices: Omit<Invoice, 'id'|'total'|'subtotal'|'tax'>[] = [
    { clientId: "INNOVATE_INC_ID", status: 'Paid', dueDate: '2024-05-15', createdAt: '2024-04-15T10:00:00Z', items: [{ description: 'Web Development', quantity: 1, price: 1500 }] },
    { clientId: "INNOVATE_INC_ID", status: 'Unpaid', dueDate: '2024-07-25', createdAt: '2024-06-25T11:00:00Z', items: [{ description: 'Logo Design', quantity: 1, price: 500 }, { description: 'Brand Guide', quantity: 1, price: 1000 }] },
    { clientId: "QUANTUM_SOLUTIONS_ID", status: 'Unpaid', dueDate: '2024-06-20', createdAt: '2024-05-20T14:30:00Z', items: [{ description: 'Cloud Consulting', quantity: 10, price: 150 }] },
    { clientId: "APEX_DESIGNS_ID", status: 'Draft', dueDate: '2024-07-01', createdAt: '2024-06-15T09:00:00Z', items: [{ description: 'UI/UX Mockups', quantity: 5, price: 80 }] }
];

export const tasks: SeedTask[] = [
  { title: 'Follow up with Quantum Solutions', description: 'Discuss the new proposal.', status: 'Pending', priority: 'High', dueDate: '2024-06-10', assignedTo: 'John Doe' },
  { title: 'Prepare Q3 financial report', status: 'In Progress', priority: 'Medium', dueDate: '2024-06-25', assignedTo: 'Jane Smith' },
  { title: 'Onboard Apex Designs', description: 'Send welcome kit and initial questionnaire.', status: 'Completed', priority: 'High', dueDate: '2024-05-20', assignedTo: 'John Doe' },
];

export const loads: SeedLoad[] = [
  { name: '20L Diesel', sku: 'DIE-20L', category: 'Fuel', quantity: 150, price: 500, reorderLevel: 50 },
  { name: 'Standard Tyre', sku: 'TYR-ST-1', category: 'Parts', quantity: 20, price: 3500, reorderLevel: 8 },
  { name: '5L Engine Oil', sku: 'OIL-5L-SYN', category: 'Lubricants', quantity: 40, price: 850, reorderLevel: 20 },
];
