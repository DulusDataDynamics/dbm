'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { ScrollArea } from '../ui/scroll-area';

type TripRow = {
  date: string;
  from: string;
  to: string;
  container: string;
  rate: string;
};

interface TransportInvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  // TODO: Add invoice prop for editing
}


export default function TransportInvoiceForm({ isOpen, onClose }: TransportInvoiceFormProps) {
  const [rows, setRows] = useState<TripRow[]>([
    { date: '', from: '', to: '', container: '', rate: '' },
  ]);

  const addRow = () => {
    setRows([
      ...rows,
      { date: '', from: '', to: '', container: '', rate: '' },
    ]);
  };

  const removeRow = (index: number) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  }

  const updateRow = (index: number, field: keyof TripRow, value: string) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const total = rows.reduce((sum, row) => {
    return sum + Number(row.rate || 0);
  }, 0);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
        setRows([{ date: '', from: '', to: '', container: '', rate: '' }]);
    }
  }, [isOpen]);

  const handleSave = async () => {
    const invoice = {
      type: "transport",
      trips: rows,
      total,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice),
      });

      if (res.ok) {
        alert("Invoice saved!");
        onClose();
      } else {
        throw new Error("Failed to save invoice");
      }
    } catch (error) {
      console.error(error);
      alert("Error saving invoice.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Create Transport Invoice</DialogTitle>
                <DialogDescription>
                    Fill out the form to create a new transport invoice. Add, edit, or remove trips as needed.
                </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] p-1">
                <div className="space-y-4 p-4">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>From</TableHead>
                            <TableHead>To</TableHead>
                            <TableHead>Container No.</TableHead>
                            <TableHead>Rate</TableHead>
                            <TableHead><span className="sr-only">Remove</span></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rows.map((row, i) => (
                            <TableRow key={i}>
                              <TableCell className="min-w-[150px]">
                                <Input
                                  type="date"
                                  value={row.date}
                                  onChange={(e) => updateRow(i, 'date', e.target.value)}
                                />
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
                                  onChange={(e) =>
                                    updateRow(i, 'container', e.target.value)
                                  }
                                  placeholder="e.g. CMAU1234567"
                                />
                              </TableCell>
                              <TableCell className="min-w-[120px]">
                                <Input
                                  type="number"
                                  value={row.rate}
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
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save Invoice</Button>
           </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
