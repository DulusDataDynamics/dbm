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
import { MoreHorizontal, PlusCircle, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteInventoryItem, subscribeToInventory, getBusinessProfile } from '@/lib/firestore';
import { InventoryItem, BusinessProfile } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { InventoryForm } from '@/components/app/inventory-form';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = subscribeToInventory((inventoryData) => {
      setInventory(inventoryData);
      setLoading(false);
    });
    
    if (user?.uid) {
        getBusinessProfile(user.uid).then(setBusinessProfile);
    }

    return () => unsubscribe();
  }, [user]);

  const handleAddItem = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteItem = (item: InventoryItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };
  
  const handleSendLowStockAlert = (item: InventoryItem) => {
    const ownerPhone = businessProfile?.businessPhone;
    if (!ownerPhone) {
      toast({
        variant: 'destructive',
        title: 'Phone Number Missing',
        description: 'Please set a business phone number in your profile settings to receive alerts.',
      });
      return;
    }
    const phoneNumber = ownerPhone.replace(/\D/g, '');
    const message = `⚠️ LOW STOCK ALERT\n\nProduct: ${item.name}\nSKU: ${item.sku}\nRemaining Quantity: ${item.quantity}`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteInventoryItem(itemToDelete.id);
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedItem(null);
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory</CardTitle>
              <CardDescription>Manage your products, services, and stock levels.</CardDescription>
            </div>
            <Button size="sm" onClick={handleAddItem}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
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
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reorder Level</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => {
                  const isLowStock = item.reorderLevel > 0 && item.quantity <= item.reorderLevel;
                  return(
                  <TableRow key={item.id} className={isLowStock ? 'bg-destructive/10' : ''}>
                    <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                    <TableCell>
                      {isLowStock ? (
                        <Badge variant="destructive">Low Stock ({item.quantity})</Badge>
                      ) : (
                        item.quantity
                      )}
                    </TableCell>
                     <TableCell>{item.reorderLevel}</TableCell>
                    <TableCell className="text-right">R{item.price.toLocaleString()}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEditItem(item)}>Edit</DropdownMenuItem>
                          {isLowStock && (
                            <DropdownMenuItem onClick={() => handleSendLowStockAlert(item)}>
                               <AlertTriangle className="mr-2 h-4 w-4" />
                               Send Low Stock Alert
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDeleteItem(item)} className="text-red-500">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          </ScrollArea>
          )}
        </CardContent>
      </Card>
      
      <InventoryForm 
        isOpen={isFormOpen}
        onClose={handleFormClose}
        item={selectedItem}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item: 
              <strong className="text-foreground"> {itemToDelete?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/80">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
