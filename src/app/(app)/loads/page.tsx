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
import { deleteLoad, subscribeToLoads } from '@/lib/firestore';
import { Load } from '@/lib/types';
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
import { LoadForm } from '@/components/app/load-form';
import { useAuth, useFirestore } from '@/firebase';

export default function LoadsPage() {
  const db = useFirestore();
  const { user, isUserLoading } = useAuth();
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loadToDelete, setLoadToDelete] = useState<Load | null>(null);
  
  useEffect(() => {
    if (isUserLoading || !db || !user?.uid) {
      setLoading(true);
      return;
    }

    const unsubscribe = subscribeToLoads(db, user.uid, (loadsData) => {
      setLoads(loadsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, user?.uid, isUserLoading]);

  const handleAddLoad = () => {
    setSelectedLoad(null);
    setIsFormOpen(true);
  };

  const handleEditLoad = (load: Load) => {
    setSelectedLoad(load);
    setIsFormOpen(true);
  };

  const handleDeleteLoad = (load: Load) => {
    setLoadToDelete(load);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (loadToDelete && db && user?.uid) {
      await deleteLoad(db, user.uid, loadToDelete.id);
      setIsDeleteDialogOpen(false);
      setLoadToDelete(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedLoad(null);
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Loads</CardTitle>
              <CardDescription>Manage your products, services, and stock levels.</CardDescription>
            </div>
            <Button size="sm" onClick={handleAddLoad} disabled={loading || !db || !user}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Load
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
                  <TableHead className="hidden sm:table-cell">SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="hidden lg:table-cell">Reorder Level</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loads.map((load) => {
                  const isLowStock = load.reorderLevel !== undefined && load.reorderLevel > 0 && load.quantity <= load.reorderLevel;
                  return(
                  <TableRow key={load.id} className={isLowStock ? 'bg-destructive/10' : ''}>
                    <TableCell className="hidden sm:table-cell font-mono text-xs">{load.sku}</TableCell>
                    <TableCell className="font-medium">{load.name}</TableCell>
                    <TableCell className="hidden md:table-cell"><Badge variant="outline">{load.category}</Badge></TableCell>
                    <TableCell>
                      {isLowStock ? (
                        <Badge variant="destructive">Low Stock ({load.quantity})</Badge>
                      ) : (
                        load.quantity
                      )}
                    </TableCell>
                     <TableCell className="hidden lg:table-cell">{load.reorderLevel}</TableCell>
                    <TableCell className="text-right">R{load.price.toLocaleString()}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEditLoad(load)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteLoad(load)} className="text-red-500">Delete</DropdownMenuItem>
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
      
      {db && user?.uid && (
        <LoadForm 
          db={db}
          userId={user.uid}
          isOpen={isFormOpen}
          onClose={handleFormClose}
          load={selectedLoad}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the load: 
              <strong className="text-foreground"> {loadToDelete?.name}</strong>.
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
