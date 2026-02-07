

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type InvoiceStatus = 'Draft' | 'Unpaid' | 'Paid' | 'Overdue';

export type InvoiceItem = {
  description: string;
  quantity: number;
  price: number;
};

export type Invoice = {
  id: string;
  clientId: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  dueDate: string; // ISO Date
  createdAt: string; // ISO Date
};

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignedTo?: string;
};

export type BusinessProfile = {
  companyName?: string;
  ownerName?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
  website?: string;
  taxNumber?: string;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  branchCode?: string;
  defaultCurrency?: string;
  defaultTaxRate?: number;
};

export type InvoiceSettings = {
  companyLogoUrl?: string;
  signatureImageUrl?: string;
  brandColor?: string;
  invoiceContactName?: string;
  invoiceContactEmail?: string;
  invoiceContactPhone?: string;
  invoicePrefix?: string;
  defaultDueDays?: number;
  paymentTerms?: string;
  footerMessage?: string;
  showWatermark?: boolean;
};
