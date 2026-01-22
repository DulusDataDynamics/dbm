
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Invoice } from '@/lib/types';

interface RevenueChartProps {
  invoices: Invoice[];
}

export function RevenueChart({ invoices }: RevenueChartProps) {

  const revenueByClient = invoices.reduce((acc, invoice) => {
    if (invoice.status === 'Paid') {
      const clientName = invoice.client?.name || 'Unknown Client';
      if (!acc[clientName]) {
        acc[clientName] = { client: clientName, total: 0 };
      }
      acc[clientName].total += invoice.total;
    }
    return acc;
  }, {} as Record<string, { client: string, total: number }>);

  const chartData = Object.values(revenueByClient);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Client</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="client"
              stroke="hsl(var(--foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R${value}`}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{ 
                background: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))'
              }}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
