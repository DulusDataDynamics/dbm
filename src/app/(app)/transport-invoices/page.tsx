'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function TransportInvoicesPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Transport Invoices</CardTitle>
            <CardDescription>
              Manage your transport and logistics invoices.
            </CardDescription>
          </div>
          <Button size="sm" disabled>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Transport Invoice
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-6 text-center">
          <p className="text-muted-foreground">
            Transport invoice management coming soon.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
