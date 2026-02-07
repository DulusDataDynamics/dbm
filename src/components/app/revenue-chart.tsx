
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Invoice, Client } from '@/lib/types';
import { useMemo } from 'react';

type AppInvoice = Invoice & {
    client?: Client;
};

interface RevenueChartProps {
  invoices: AppInvoice[];
}

export function RevenueChart({ invoices }: RevenueChartProps) {
  const chartData = useMemo(() => {
    const monthlyRevenue: { [key: string]: number } = {};

    invoices.forEach(invoice => {
      if (invoice.status === 'Paid') {
        const date = new Date(invoice.createdAt);
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        const key = `${month} ${year}`;
        
        if (!monthlyRevenue[key]) {
          monthlyRevenue[key] = 0;
        }
        monthlyRevenue[key] += invoice.total;
      }
    });

    const sortedMonths = Object.keys(monthlyRevenue).sort((a, b) => {
        return new Date(a).getTime() - new Date(b).getTime();
    });

    return sortedMonths.map(key => ({
      month: key.split(' ')[0],
      total: monthlyRevenue[key],
    }));
  }, [invoices]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Revenue</CardTitle>
        <CardDescription>Total revenue from paid invoices per month.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
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
              formatter={(value: number) => [`R${value.toLocaleString()}`, 'Revenue']}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
