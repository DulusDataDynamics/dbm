'use client';

import { useEffect, useState } from 'react';
import {
  subscribeToClients,
  subscribeToInvoices,
  subscribeToTasks,
  subscribeToInventory,
} from '@/lib/firestore';
import { Client, Invoice, Task, InventoryItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/app/stat-card';
import { Users, FileText, CheckCircle2, Boxes } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RevenueChart } from '@/components/app/revenue-chart';
import { RevenueInsightsGenerator } from '@/components/app/revenue-insights-generator';

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubClients = subscribeToClients((data) => {
      setClients(data);
      if (loading) setLoading(false);
    });
    const unsubInvoices = subscribeToInvoices(setInvoices);
    const unsubTasks = subscribeToTasks(setTasks);
    const unsubInventory = subscribeToInventory(setInventory);

    return () => {
      unsubClients();
      unsubInvoices();
      unsubTasks();
      unsubInventory();
    };
  }, [loading]);

  const activeInvoices = invoices.filter(
    (inv) => inv.status === 'Unpaid' || inv.status === 'Overdue'
  ).length;
  const pendingTasks = tasks.filter(
    (task) => task.status === 'Pending' || task.status === 'In Progress'
  ).length;
  const recentInvoices = invoices.slice(0, 5);
  const recentTasks = tasks
    .filter((t) => t.status !== 'Completed')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard
              title="Total Clients"
              value={clients.length.toString()}
              icon={Users}
            />
            <StatCard
              title="Active Invoices"
              value={activeInvoices.toString()}
              icon={FileText}
            />
            <StatCard
              title="Pending Tasks"
              value={pendingTasks.toString()}
              icon={CheckCircle2}
            />
            <StatCard
              title="Inventory Items"
              value={inventory.length.toString()}
              icon={Boxes}
            />
          </>
        )}
      </div>

      <div className="space-y-6">
        <RevenueInsightsGenerator invoices={invoices} inventory={inventory} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>
                  Your most recently created invoices.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/invoices">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : recentInvoices.length > 0 ? (
              <ScrollArea className="h-64">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.client?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invoice.status === 'Paid'
                                ? 'default'
                                : invoice.status === 'Overdue'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          R{invoice.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="flex h-48 items-center justify-center text-center text-muted-foreground">
                <p>
                  No invoices found. <br /> Create your first one to get
                  started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pending Tasks</CardTitle>
                <CardDescription>Your most urgent upcoming tasks.</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/tasks">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : recentTasks.length > 0 ? (
              <ScrollArea className="h-64">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">
                          {task.title}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              task.priority === 'High'
                                ? 'destructive'
                                : task.priority === 'Medium'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="flex h-48 items-center justify-center text-center text-muted-foreground">
                <p>
                  No pending tasks. <br /> Enjoy your day!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div>
        <RevenueChart invoices={invoices} />
      </div>
    </div>
  );
}
