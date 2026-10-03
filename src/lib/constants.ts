import {
  LayoutDashboard,
  Users,
  FileText,
  CheckCircle2,
  BarChart3,
  Settings,
  LifeBuoy,
  Truck,
  Boxes,
} from 'lucide-react';

export const MAIN_NAV = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    href: '/clients',
    icon: Users,
    label: 'Clients',
  },
  {
    href: '/invoices',
    icon: FileText,
    label: 'Invoices',
  },
  {
    href: '/tasks',
    icon: CheckCircle2,
    label: 'Tasks',
  },
  {
    href: '/reports',
    icon: BarChart3,
    label: 'Reports',
  },
];

export const TRANSPORT_NAV = [
  {
    href: '/transport-invoices',
    icon: FileText,
    label: 'Transport Invoices',
  },
  {
    href: '/loads',
    icon: Boxes,
    label: 'Loads',
  },
];

export const SUPPORT_LINKS = [
  {
    href: '/settings',
    icon: Settings,
    label: 'Settings',
  },
  {
    href: '/support',
    icon: LifeBuoy,
    label: 'Support',
  },
];
