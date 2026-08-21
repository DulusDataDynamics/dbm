'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { subscribeToClients, saveInvoice } from '@/lib/firestore';
import { Client, TripRow, Invoice } from '@/lib/types';

interface TransportInvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: Invoice | null;
}

export default function TransportInvoiceForm({ isOpen, onClose, invoice }: TransportInvoiceFormProps) {
  const db = useFirestore();
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [rows, setRows] = useState<TripRow[]>([
    { date: '', from: '', to: '', container: '', rate: 0 },
  ]);
  const { toast } = useToast();

  useEffect(() => {
    if (!db || !user?.uid) return;
    const unsubscribe = subscribeToClients(db, user.uid, setClients);
    return () => unsubscribe();
  }, [db, user?.uid]);

  useEffect(() => {
    if (isOpen) {
      if (invoice) {
        setSelectedClientId(invoice.clientId);
        setRows(invoice.trips || [{ date: '', from: '', to: '', container: '', rate: 0 }]);
      } else {
        setSelectedClientId('');
        setRows([{ date: '', from: '', to: '', container: '', rate: 0 }]);
      }
    }
  }, [isOpen, invoice]);

  const addRow = () => {
    setRows([
      ...rows,
      { date: '', from: '', to: '', container: '', rate: 0 },
    ]);
  };

  const removeRow = (index: number) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const updateRow = (index: number, field: keyof TripRow, value: string | number) => {
    const updated = [...rows];
    (updated[index] as any)[field] = field === 'rate' ? Number(value) : value;
    setRows(updated);
  };

  const total = rows.reduce((sum, row) => {
    return sum + (row.rate || 0);
  }, 0);

  const handleSave = async () => {
    if (!selectedClientId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a client.' });
      return;
    }

    if (!db || !user?.uid) return;

    const invoiceData = {
      clientId: selectedClientId,
      type: 'transport' as const,
      status: invoice?.status || 'Draft' as const,
      trips: rows,
      items: [],
      total: total,
      dueDate: invoice?.dueDate || new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      createdAt: invoice?.createdAt || new Date().toISOString(),
    };

    try {
      await saveInvoice(db, user.uid, invoice?.id || null, invoiceData);
      toast({
        title: invoice ? 'Invoice Updated' : 'Invoice Saved',
        description: `Your transport invoice has been ${invoice ? 'updated' : 'saved'} to your records.`,
      });
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Saving Invoice',
        description: 'There was a problem saving your invoice to Firestore.',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{invoice ? 'Edit Transport Invoice' : 'Create Transport Invoice'}</DialogTitle>
          <DialogDescription>
            Fill out the form to {invoice ? 'update' : 'create'} a transport invoice. Add, edit, or remove trips as needed.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] p-1">
          <div className="space-y-4 p-4">
            <div className="w-full sm:w-1/2 space-y-2">
              <Label>Select Client</Label>
              <Select onValueChange={setSelectedClientId} value={selectedClientId} disabled={!!invoice}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Container No.</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>
                      <span className="sr-only">Remove</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="min-w-[150px]">
                        <Input type="date" value={row.date} onChange={(e) => updateRow(i, 'date', e.target.value)} />
                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        <Input
                          value={row.from}
                          onChange={(e) => updateRow(i, 'from', e.target.value)}
                          placeholder="e.g. Durban Port"
                        />
                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        <Input
                          value={row.to}
                          onChange={(e) => updateRow(i, 'to', e.target.value)}
                          placeholder="e.g. Johannesburg"
                        />
                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        <Input
                          value={row.container}
                          onChange={(e) => updateRow(i, 'container', e.target.value)}
                          placeholder="e.g. CMAU1234567"
                        />
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <Input
                          type="number"
                          value={row.rate || ''}
                          onChange={(e) => updateRow(i, 'rate', e.target.value)}
                          placeholder="0.00"
                        />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeRow(i)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button onClick={addRow} variant="outline" size="sm" className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Trip
            </Button>

            <div className="mt-6 flex justify-end">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>R {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="pt-4 px-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Invoice</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
