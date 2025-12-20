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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { deleteTask, subscribeToTasks, updateTaskStatus } from '@/lib/firestore';
import { Task, TaskStatus } from '@/lib/types';
import { useEffect, useState, useTransition } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TaskForm } from '@/components/app/task-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/firebase/client-provider';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToTasks(db, (tasksData) => {
      const sortedTasks = tasksData.sort((a, b) => {
        if (a.dueDate < b.dueDate) return -1;
        if (a.dueDate > b.dueDate) return 1;
        if (a.status === 'Completed' && b.status !== 'Completed') return 1;
        if (a.status !== 'Completed' && b.status === 'Completed') return -1;
        return 0;
      });
      setTasks(sortedTasks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleStatusChange = (task: Task, status: TaskStatus) => {
    startTransition(async () => {
      await updateTaskStatus(db, task.id, status);
    });
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (taskToDelete) {
      await deleteTask(db, taskToDelete.id);
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const isOverdue = (task: Task) => {
    return new Date(task.dueDate) < new Date() && task.status !== 'Completed';
  }

  const getStatusBadgeVariant = (status: TaskStatus) => {
    switch (status) {
      case 'Completed': return 'default';
      case 'In Progress': return 'secondary';
      case 'Pending': return 'outline';
      default: return 'outline';
    }
  };
  
  const getPriorityBadgeVariant = (priority: Task['priority']) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Manage your tasks and track your workload.</CardDescription>
          </div>
          <Button size="sm" onClick={handleAddTask}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
         {loading ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground animate-pulse">Organizing your tasks...</p>
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
        <ScrollArea className="h-[calc(100vh-22rem)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Priority</TableHead>
                <TableHead className="hidden md:table-cell">Assigned To</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id} className={cn(
                    task.status === 'Completed' ? 'text-muted-foreground' : '',
                    isOverdue(task) ? 'bg-destructive/10' : ''
                  )}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="sm" className="capitalize" disabled={isPending}>
                             <Badge variant={getStatusBadgeVariant(task.status)}>{task.status}</Badge>
                           </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                           <DropdownMenuRadioGroup value={task.status} onValueChange={(value) => handleStatusChange(task, value as TaskStatus)}>
                              <DropdownMenuRadioItem value="Pending">Pending</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="In Progress">In Progress</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="Completed">Completed</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant={getPriorityBadgeVariant(task.priority)}
                    >
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{task.assignedTo || 'Unassigned'}</TableCell>
                  <TableCell>
                    <span className={cn(isOverdue(task) && 'text-destructive font-semibold')}>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isPending}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditTask(task)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteTask(task)} className="text-red-500">Delete</DropdownMenuItem>
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

    <TaskForm
        db={db}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        task={selectedTask}
    />

    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the task:
            <strong className="text-foreground"> {taskToDelete?.title}</strong>.
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
