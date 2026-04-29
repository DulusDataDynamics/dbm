'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransportInvoiceForm } from '@/components/app/transport-invoice-form';

export default function TransportInvoicesPage() {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Create Transport Invoice</CardTitle>
              <CardDescription>
                Fill out the trips below to generate a new transport invoice.
              </CardDescription>
            </div>
            <Button size="sm">Save Invoice</Button>
          </div>
        </CardHeader>
        <CardContent>
          <TransportInvoiceForm isStandalonePage />
        </CardContent>
      </Card>
    </>
  );
}
