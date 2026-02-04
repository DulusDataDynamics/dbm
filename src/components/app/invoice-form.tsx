
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
import { cn, calculateInvoiceTotals } from '@/lib/utils';
import { format } from 'date-fns';
import { Client, Invoice, InvoiceItem } from '@/lib/types';
import { saveInvoice, subscribeToClients, getBusinessProfile } from '@/lib/firestore';
import type { Firestore } from 'firebase/firestore';
import { ScrollArea } from '../ui/scroll-area';

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required."),
  quantity: z.coerce.number().min(0.01, "Quantity must be positive."),
  price: z.coerce.number().min(0, "Price cannot be negative."),
});

const formSchema = z.object({
  clientId: z.string().min(1, 'Please select a client.'),
  status: z.enum(['Draft', 'Unpaid', 'Paid', 'Overdue']),
  dueDate: z.date({ required_error: 'A due date is required.' }),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required."),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  createdAt: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof formSchema>;

interface InvoiceFormProps {
  db: Firestore;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export function InvoiceForm({ db, userId, isOpen, onClose, invoice }: InvoiceFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [taxRate, setTaxRate] = useState(0.15); // Default 15%

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: '',
      status: 'Draft',
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items'
  });

  const { setValue } = form;

  const watchedItems = useWatch({
    control: form.control,
    name: 'items',
  });

  useEffect(() => {
    if (!watchedItems) return;
    const { subtotal, tax, total } = calculateInvoiceTotals(watchedItems, taxRate);
    setValue('subtotal', subtotal, { shouldValidate: false });
    setValue('tax', tax, { shouldValidate: false });
    setValue('total', total, { shouldValidate: false });
  }, [watchedItems, taxRate, setValue]);

  useEffect(() => {
    if (!db || !userId) return;
    const unsubscribe = subscribeToClients(db, userId, setClients);
    getBusinessProfile(db, userId).then(profile => {
      if (profile?.defaultTaxRate) {
        setTaxRate(profile.defaultTaxRate / 100);
      }
    });
    return () => unsubscribe();
  }, [db, userId]);

  useEffect(() => {
    if (isOpen) {
      if (invoice) {
        form.reset({
          ...invoice,
          dueDate: new Date(invoice.dueDate),
        });
      } else {
        form.reset({
          clientId: '',
          status: 'Draft',
          dueDate: new Date(),
          items: [{ description: '', quantity: 1, price: 0 }],
          subtotal: 0,
          tax: 0,
          total: 0,
        });
      }
    }
  }, [invoice, form, isOpen]);

  const onSubmit = async (data: InvoiceFormValues) => {
    if (!db || !userId) return;
    // Recalculate totals one last time before saving to ensure consistency
    const { subtotal, tax, total } = calculateInvoiceTotals(data.items, taxRate);
    const invoiceData = {
      ...data,
      dueDate: format(data.dueDate, 'yyyy-MM-dd'),
      subtotal,
      tax,
      total,
    };
    await saveInvoice(db, userId, invoice?.id || null, invoiceData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{invoice ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
          <DialogDescription>
            {invoice ? 'Update the details for this invoice.' : 'Fill out the form to create a new invoice.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="max-h-[70vh] p-1">
              <div className="space-y-4 p-4">
                {/* Client and Due Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!invoice}>
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

                {/* Items Header */}
                <div className="grid grid-cols-12 gap-2 items-center mt-4">
                  <div className="col-span-5"><FormLabel>Description</FormLabel></div>
                  <div className="col-span-2"><FormLabel>Quantity</FormLabel></div>
                  <div className="col-span-2"><FormLabel>Price</FormLabel></div>
                  <div className="col-span-2"><FormLabel>Total</FormLabel></div>
                  <div className="col-span-1"></div>
                </div>

                {/* Items Array */}
                {fields.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-start">
                    <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => (
                      <FormItem className="col-span-5"><FormControl><Input {...field} placeholder="Item or service" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (
                      <FormItem className="col-span-2"><FormControl><Input type="number" {...field} placeholder="1" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`items.${index}.price`} render={({ field }) => (
                      <FormItem className="col-span-2"><FormControl><Input type="number" {...field} placeholder="100.00" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="col-span-2 flex h-10 items-center justify-end rounded-md border border-input bg-muted px-3 py-2 text-sm">
                      R {((form.watch(`items.${index}.quantity`) || 0) * (form.watch(`items.${index}.price`) || 0)).toFixed(2)}
                    </div>
                    <div className="col-span-1">
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
                
                <Button type="button" variant="outline" size="sm" onClick={() => append({ description: '', quantity: 1, price: 0 })}>
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>

                {/* Totals Section */}
                <div className="flex justify-end pt-4">
                  <div className="w-full max-w-sm space-y-2">
                    <div className="flex justify-between"><span>Subtotal</span><span>R {(form.watch('subtotal') || 0).toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Tax ({(taxRate * 100).toFixed(0)}%)</span><span>R {(form.watch('tax') || 0).toFixed(2)}</span></div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2"><span>Total</span><span>R {(form.watch('total') || 0).toFixed(2)}</span></div>
                  </div>
                </div>

              </div>
            </ScrollArea>
            <DialogFooter className="pt-4 px-4">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Invoice</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
