import {
  LayoutDashboard,
  Users,
  FileText,
  CheckCircle2,
  BarChart3,
  Settings,
  LifeBuoy,
  Truck,
} from 'lucide-react';

export const NAV_LINKS = [
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
    href: '/transport-invoices',
    icon: Truck,
    label: 'Transport Invoices',
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
