'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ManualInvoicesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Manual Invoices</h1>
      <Card>
        <CardHeader>
          <CardTitle>Create and Manage Manual Invoices</CardTitle>
          <CardDescription>
            This is the space for creating invoices manually.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-6 text-center">
            <p className="text-muted-foreground">
              Manual invoice content will go here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
