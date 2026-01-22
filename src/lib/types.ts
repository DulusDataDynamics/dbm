

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  invoice?: Invoice;
};

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid';

export type InvoiceItem = {
  description: string;
  quantity: number;
  price: number;
};

export type Invoice = {
  items: InvoiceItem[];
  total: number;
  dueDate: string; // ISO Date
  status: InvoiceStatus;
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

export type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  category?: string;
  quantity: number;
  price: number;
  reorderLevel: number;
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
