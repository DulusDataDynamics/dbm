'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import type { Invoice, Client } from '@/lib/types';

interface RevenueInsightsGeneratorProps {
    invoices: Invoice[];
    clients: Client[];
}

export function RevenueInsightsGenerator({ invoices, clients }: RevenueInsightsGeneratorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Powered Financial Analyst</CardTitle>
        <CardDescription>
          Generate a detailed analysis of your sales performance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed bg-muted/20 p-4 text-center">
            <div>
              <Lightbulb className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="font-semibold">Coming Soon</p>
              <p className="text-sm text-muted-foreground">
                Advanced AI insights will be available here shortly.
              </p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
