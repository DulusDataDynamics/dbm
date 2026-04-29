'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TransportInvoiceForm } from '@/components/app/transport-invoice-form';

export default function TransportInvoicesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transport Invoice</CardTitle>
        <CardDescription>
          Fill out the trips below to generate a new transport invoice.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TransportInvoiceForm />
      </CardContent>
    </Card>
  );
}
