'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { createTask } from '@/lib/db/tasks';
import { CreateTaskInput } from '@/lib/types';
import { useTasksContext } from '@/components/providers/TasksProvider';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskForm } from '@/components/task/TaskForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isSameDay } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

function TasksContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const { tasks, loading, error, addOptimisticTask, removeOptimisticTask } = useTasksContext();

  // State
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("list");

  // Check for ?new=true to open modal
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsNewTaskOpen(true);
    }
  }, [searchParams]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error('Error syncing tasks');
    }
  }, [error]);

  const handleCreateTask = (data: CreateTaskInput) => {
    if (!user) return;

    // Generate a Firestore-like random ID (20 chars)
    const taskId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 9);

    const optimisticTask = {
      id: taskId,
      ...data,
      userId: user.uid,
      status: 'pending',
      priority: data.priority || 'medium',
      category: data.category || 'personal',
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    };

    // Instant UI feedback
    addOptimisticTask(optimisticTask as any);
    setIsNewTaskOpen(false);
    toast.success('Task created');

    // Background Server Sync (Fire and Forget)
    createTask(user.uid, data, taskId).catch((error) => {
      console.error('Task creation background error:', error);
      toast.error('Failed to sync task to server.');
      removeOptimisticTask(taskId);
    });
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const { completeTask } = await import('@/lib/db/tasks');
      // For instant feedback, we'd need a way to optimistically update an existing task
      // For now, at least we don't block the UI
      toast.success('Task completed!');
      await completeTask(taskId);
    } catch (error) {
      console.error('Complete task error:', error);
      toast.error('Failed to update task.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    // Instant UI feedback
    removeOptimisticTask(taskId);
    toast.success('Task deleted');

    try {
      const { deleteTask } = await import('@/lib/db/tasks');
      await deleteTask(taskId);
    } catch (error) {
      console.error('Delete task error:', error);
      toast.error('Failed to delete task.');
      // Ideally we should restore the task here, but onSnapshot might refresh anyway
    }
  };

  // Calendar specific filter
  const selectedDateTasks = tasks.filter(task =>
    date && task.dueDate && isSameDay(new Date(task.dueDate), date)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>

        {/* Unified "New Task" Button Logic */}
        <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {activeTab === 'calendar' ? 'Schedule Task' : 'New Task'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {activeTab === 'calendar' && date
                  ? `Add Task for ${date.toLocaleDateString()}`
                  : 'Create New Task'}
              </DialogTitle>
            </DialogHeader>
            <TaskForm
              onSubmit={handleCreateTask}
              isLoading={isSaving}
              defaultValues={{
                // If in calendar mode, pre-fill the selected date
                dueDate: activeTab === 'calendar' && date
                  ? date.toISOString().split('T')[0]
                  : undefined
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="list" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        {/* LIST VIEW */}
        <TabsContent value="list" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array(6).fill(0).map((_, i) => <TaskSkeleton key={i} />)
            ) : tasks.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 dark:border-slate-800">
                <Plus className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <p className="text-lg font-medium">No tasks found</p>
                <p className="text-sm">Create your first task to get started!</p>
              </div>
            ) : (
              tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={() => handleCompleteTask(task.id)}
                  onDelete={() => handleDeleteTask(task.id)}
                />
              ))
            )}
          </div>
        </TabsContent>

        {/* CALENDAR VIEW */}
        <TabsContent value="calendar">
          <div className="grid gap-6 md:grid-cols-12">
            <Card className="md:col-span-4">
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-8">
              <CardHeader>
                <CardTitle>Schedule for {date?.toLocaleDateString()}</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateTasks.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center text-slate-500 border-2 border-dashed rounded-lg">
                    No tasks scheduled for this day.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDateTasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-slate-900 shadow-sm">
                        <div className="flex items-center gap-3">
                          {task.status === 'completed' ? (
                            <CheckCircle2 className="text-green-500 h-5 w-5" />
                          ) : task.priority === 'urgent' ? (
                            <AlertCircle className="text-red-500 h-5 w-5" />
                          ) : (
                            <Clock className="text-slate-400 h-5 w-5" />
                          )}
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-xs text-slate-500 uppercase">{task.status.replace('-', ' ')} • {task.priority}</p>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-slate-500">
                          {task.dueDate ? new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-lg" />
      </div>
    }>
      <TasksContent />
    </Suspense>
  );
}

function TaskSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white dark:bg-slate-900 shadow-sm">
      <div className="flex justify-between items-start">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}
