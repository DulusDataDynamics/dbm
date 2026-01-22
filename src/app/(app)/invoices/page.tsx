
'use client';
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
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { subscribeToClients } from '@/lib/firestore';
import { Client, InvoiceStatus } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { InvoiceForm } from '@/components/app/invoice-form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth, useFirestore } from '@/firebase';

export default function InvoicesPage() {
  const db = useFirestore();
  const { user, isUserLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    if (isUserLoading || !db || !user?.uid) {
      setLoading(true);
      return;
    }

    const unsubscribe = subscribeToClients(db, user.uid, (clientsData) => {
      setClients(clientsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, user?.uid, isUserLoading]);

  const handleEditInvoice = (client: Client) => {
    setSelectedClient(client);
    setIsFormOpen(true);
  };
  
  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedClient(null);
  };
  
  const getStatusBadgeVariant = (status: InvoiceStatus) => {
    switch (status) {
        case 'Paid': return 'default';
        case 'Sent': return 'secondary';
        case 'Draft': return 'outline';
        default: return 'outline';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Manage your client invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
          <ScrollArea className="h-[calc(100vh-22rem)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Due Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => client.invoice && (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(client.invoice.status)}>{client.invoice.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{new Date(client.invoice.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">R{client.invoice.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditInvoice(client)}>View / Edit</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          )}
        </CardContent>
      </Card>
      
      {db && user?.uid && (
        <InvoiceForm 
          db={db}
          userId={user.uid}
          isOpen={isFormOpen}
          onClose={handleFormClose}
          client={selectedClient}
        />
      )}
    </>
  );
}
