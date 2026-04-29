'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Client, TransportInvoice } from '@/lib/types';
import { saveTransportInvoice, subscribeToClients } from '@/lib/firestore';
import type { Firestore } from 'firebase/firestore';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const transportInvoiceItemSchema = z.object({
  date: z.date({ required_error: 'A date is required.' }),
  from: z.string().min(1, 'Origin is required.'),
  to: z.string().min(1, 'Destination is required.'),
  containerNo: z.string().optional(),
  rate: z.coerce.number().min(0, 'Rate must be a positive number.'),
});

const formSchema = z.object({
  clientId: z.string().min(1, 'Please select a client.'),
  status: z.enum(['Draft', 'Unpaid', 'Paid', 'Overdue']),
  dueDate: z.date({ required_error: 'A due date is required.' }),
  items: z.array(transportInvoiceItemSchema).min(1, 'At least one trip is required.'),
  total: z.number(),
  createdAt: z.string().optional(),
});

type TransportInvoiceFormValues = z.infer<typeof formSchema>;

interface TransportInvoiceFormProps {
  db: Firestore;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  invoice: TransportInvoice | null;
}

export function TransportInvoiceForm({ db, userId, isOpen, onClose, invoice }: TransportInvoiceFormProps) {
  const [clients, setClients] = useState<Client[]>([]);

  const form = useForm<TransportInvoiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: '',
      status: 'Draft',
      items: [{ date: new Date(), from: '', to: '', rate: 0 }],
      total: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchedItems = useWatch({
    control: form.control,
    name: 'items',
  });

  useEffect(() => {
    const total = (watchedItems || []).reduce((sum, item) => sum + (item.rate || 0), 0);
    form.setValue('total', total, { shouldValidate: false });
  }, [watchedItems, form]);

  useEffect(() => {
    if (!db || !userId) return;
    const unsubscribe = subscribeToClients(db, userId, setClients);
    return () => unsubscribe();
  }, [db, userId]);

  useEffect(() => {
    if (isOpen) {
      if (invoice) {
        form.reset({
          ...invoice,
          dueDate: new Date(invoice.dueDate),
          items: invoice.items.map(item => ({ ...item, date: new Date(item.date) })),
        });
      } else {
        form.reset({
          clientId: '',
          status: 'Draft',
          dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Due in 30 days
          items: [{ date: new Date(), from: '', to: '', rate: 0 }],
        });
      }
    }
  }, [invoice, form, isOpen]);

  const onSubmit = async (data: TransportInvoiceFormValues) => {
    if (!db || !userId) return;
    
    const invoiceData = {
      ...data,
      dueDate: format(data.dueDate, 'yyyy-MM-dd'),
      items: data.items.map(item => ({
        ...item,
        date: format(item.date, 'yyyy-MM-dd'),
      })),
      total: data.items.reduce((sum, item) => sum + item.rate, 0),
    };
    await saveTransportInvoice(db, userId, invoice?.id || null, invoiceData as Omit<TransportInvoice, 'id'>);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{invoice ? 'Edit Transport Invoice' : 'Create Transport Invoice'}</DialogTitle>
          <DialogDescription>
            {invoice ? 'Update the details for this transport invoice.' : 'Fill out the form to create a new transport invoice.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="max-h-[70vh] p-1">
              <div className="space-y-4 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!!invoice}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Unpaid">Unpaid</SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Date</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Container No.</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead><span className="sr-only">Remove</span></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <FormField control={form.control} name={`items.${index}.date`} render={({ field }) => (
                                <FormItem>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button variant="outline" className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                                  </Popover>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )} />
                          </TableCell>
                          <TableCell>
                            <FormField control={form.control} name={`items.${index}.from`} render={({ field }) => (
                              <FormItem><FormControl><Input {...field} placeholder="e.g., Durban Port" /></FormControl><FormMessage className="text-xs" /></FormItem>
                            )} />
                          </TableCell>
                          <TableCell>
                            <FormField control={form.control} name={`items.${index}.to`} render={({ field }) => (
                              <FormItem><FormControl><Input {...field} placeholder="e.g., JHB Warehouse" /></FormControl><FormMessage className="text-xs" /></FormItem>
                            )} />
                          </TableCell>
                           <TableCell>
                            <FormField control={form.control} name={`items.${index}.containerNo`} render={({ field }) => (
                              <FormItem><FormControl><Input {...field} placeholder="e.g., TCKU1234567" /></FormControl><FormMessage className="text-xs" /></FormItem>
                            )} />
                           </TableCell>
                           <TableCell>
                             <FormField control={form.control} name={`items.${index}.rate`} render={({ field }) => (
                               <FormItem><FormControl><Input type="number" {...field} placeholder="0.00" className="text-right" /></FormControl><FormMessage className="text-xs" /></FormItem>
                             )} />
                           </TableCell>
                          <TableCell className="text-right">
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <Button type="button" variant="outline" size="sm" onClick={() => append({ date: new Date(), from: '', to: '', containerNo: '', rate: 0 })}>
                  <Plus className="mr-2 h-4 w-4" /> Add Trip
                </Button>

                <div className="flex justify-end pt-4">
                  <div className="w-full max-w-sm space-y-2">
                    <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                        <span>Total</span>
                        <span>R {(form.getValues('total') || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

              </div>
            </ScrollArea>
            <DialogFooter className="pt-4 px-4">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Transport Invoice</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
