
'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Lightbulb, Sparkles, AlertTriangle, TrendingUp, Target, DollarSign, Package } from 'lucide-react';
import { getRevenueInsights } from '@/lib/actions';
import { Skeleton } from '../ui/skeleton';
import { Invoice } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

interface RevenueInsightsGeneratorProps {
    invoices: Invoice[];
}

interface Insights {
    totalRevenue: number;
    topProducts: string[];
    bestMonth: string;
    revenueTrend: string;
    predictions: string;
    actions: string;
}

const InsightDisplay = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
        <div className="rounded-full bg-primary/10 p-2 text-primary">
            <Icon className="h-5 w-5" />
        </div>
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="text-base font-semibold text-foreground">{value}</div>
        </div>
    </div>
);


export function RevenueInsightsGenerator({ invoices }: RevenueInsightsGeneratorProps) {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    setError(null);
    setInsights(null);
    startTransition(async () => {
      const result = await getRevenueInsights(invoices);
      if (result.success) {
        setInsights(result.insights);
      } else {
        setError(result.error || 'An unknown error occurred.');
      }
    });
  };

  const hasPaidInvoices = invoices.some(i => i.status === 'Paid');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>AI-Powered Financial Analyst</CardTitle>
            <CardDescription>
              Generate a detailed analysis of your sales performance.
            </CardDescription>
          </div>
          <Button onClick={handleGenerate} disabled={isPending || !hasPaidInvoices} size="sm">
            <Sparkles className="mr-2 h-4 w-4" />
            {isPending ? 'Analyzing...' : 'Generate Analysis'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="min-h-[200px] rounded-lg border-2 border-dashed bg-muted/20 p-4">
          {isPending ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
                <p className="font-semibold">Analysis Failed</p>
                <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : insights ? (
             <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InsightDisplay icon={DollarSign} label="Total Revenue" value={`R ${insights.totalRevenue.toLocaleString()}`} />
                    <InsightDisplay icon={TrendingUp} label="Best Month" value={insights.bestMonth} />
                    <InsightDisplay icon={Package} label="Top Products" value={
                        insights.topProducts.length > 0 
                        ? <div className="flex flex-wrap gap-1">{insights.topProducts.map(p => <Badge key={p} variant="secondary">{p}</Badge>)}</div>
                        : 'N/A'
                    } />
                </div>
                <Separator />
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-sm mb-1">Revenue Trend</h4>
                        <p className="text-sm text-muted-foreground">{insights.revenueTrend}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-sm mb-1">Prediction</h4>
                        <p className="text-sm text-muted-foreground">{insights.predictions}</p>
                    </div>
                </div>
                 <Separator />
                <div className="mt-4">
                   <InsightDisplay icon={Target} label="Suggested Action" value={insights.actions} />
                </div>
             </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <Lightbulb className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="font-semibold">Ready for Analysis</p>
                <p className="text-sm text-muted-foreground">
                    {!hasPaidInvoices
                    ? 'You need at least one paid invoice to generate an analysis.'
                    : 'Click "Generate Analysis" to get AI-powered insights.'
                    }
                </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
