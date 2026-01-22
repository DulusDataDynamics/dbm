
'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Client, Invoice } from '@/lib/types';
import { saveClient } from '@/lib/firestore';
import type { Firestore } from 'firebase/firestore';
import { ScrollArea } from '../ui/scroll-area';
import { Plus, Trash2 } from 'lucide-react';
import { calculateInvoiceTotals } from '@/lib/utils';
import { useWatch } from 'react-hook-form';


const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required."),
  quantity: z.coerce.number().min(0.01, "Quantity must be positive."),
  price: z.coerce.number().min(0, "Price cannot be negative."),
});

const formSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  invoice: z.object({
    items: z.array(invoiceItemSchema).min(1, "At least one item is required."),
    total: z.number(),
    dueDate: z.string(),
    status: z.enum(['Draft', 'Sent', 'Paid']),
  })
});

type InvoiceFormValues = z.infer<typeof formSchema>;

interface InvoiceFormProps {
  db: Firestore;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export function InvoiceForm({ db, userId, isOpen, onClose, client }: InvoiceFormProps) {
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(formSchema),
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'invoice.items'
  });
  
  const watchedItems = useWatch({
    control: form.control,
    name: 'invoice.items',
  });

  useEffect(() => {
    if (!watchedItems) return;
    const { total } = calculateInvoiceTotals(watchedItems);
    form.setValue('invoice.total', total, { shouldValidate: true });
  }, [watchedItems, form]);


  useEffect(() => {
    if (client) {
      form.reset({
        ...client,
        invoice: client.invoice || { items: [], total: 0, dueDate: new Date().toISOString().split('T')[0], status: 'Draft' }
      });
    }
  }, [client, form, isOpen]);

  const onSubmit = async (data: InvoiceFormValues) => {
    await saveClient(db, userId, client?.id || null, data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>View / Edit Invoice</DialogTitle>
          <DialogDescription>
            Manage the invoice for <strong>{client?.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="max-h-[70vh] p-1">
              <div className="space-y-4 p-4">

                {/* Items Header */}
                <div className="grid grid-cols-12 gap-2 items-center mt-4">
                  <div className="col-span-6"><FormLabel>Description</FormLabel></div>
                  <div className="col-span-2"><FormLabel>Quantity</FormLabel></div>
                  <div className="col-span-2"><FormLabel>Price</FormLabel></div>
                  <div className="col-span-2"></div>
                </div>

                {/* Items Array */}
                {fields.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-start">
                    <FormField control={form.control} name={`invoice.items.${index}.description`} render={({ field }) => (
                      <FormItem className="col-span-6"><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`invoice.items.${index}.quantity`} render={({ field }) => (
                      <FormItem className="col-span-2"><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`invoice.items.${index}.price`} render={({ field }) => (
                      <FormItem className="col-span-2"><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="col-span-2">
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
                    <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2"><span>Total</span><span>R {form.getValues('invoice.total').toFixed(2)}</span></div>
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
