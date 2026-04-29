'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

type TripRow = {
  date: Date | undefined;
  from: string;
  to: string;
  container: string;
  rate: string;
};

export function TransportInvoiceForm() {
  const [rows, setRows] = useState<TripRow[]>([
    { date: new Date(), from: '', to: '', container: '', rate: '' },
  ]);

  const addRow = () => {
    setRows([
      ...rows,
      { date: new Date(), from: '', to: '', container: '', rate: '' },
    ]);
  };

  const removeRow = (index: number) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const updateRow = (index: number, field: keyof TripRow, value: any) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const total = rows.reduce((sum, row) => {
    return sum + Number(row.rate || 0);
  }, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Date</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Container</TableHead>
              <TableHead className="w-[150px] text-right">Rate</TableHead>
              <TableHead className="w-[50px]">
                <span className="sr-only">Remove</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !row.date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {row.date ? format(row.date, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={row.date}
                        onSelect={(date) => updateRow(i, 'date', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Origin"
                    value={row.from}
                    onChange={(e) => updateRow(i, 'from', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Destination"
                    value={row.to}
                    onChange={(e) => updateRow(i, 'to', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="ABC-12345"
                    value={row.container}
                    onChange={(e) => updateRow(i, 'container', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="text-right"
                    value={row.rate}
                    onChange={(e) => updateRow(i, 'rate', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(i)}
                    disabled={rows.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Button onClick={addRow} variant="outline" size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Add Trip
      </Button>

      <div className="flex justify-end pt-4">
        <div className="w-full max-w-sm space-y-2">
          <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
            <span>Total</span>
            <span>R {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
