'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreateTaskInput, TaskPriority, TaskCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Internal form state can have strings for dates (HTML input requirement)
interface TaskFormValues extends Omit<CreateTaskInput, 'dueDate'> {
  dueDate?: string | Date; // Allow string for input[type="date"]
}

interface TaskFormProps {
  onSubmit: (data: CreateTaskInput) => Promise<void> | void;
  isLoading?: boolean;
  defaultValues?: Partial<TaskFormValues>; // Accept string dates in defaults
}

export function TaskForm({ onSubmit, isLoading, defaultValues }: TaskFormProps) {
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<TaskFormValues>({
    defaultValues
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onFormSubmit = async (data: TaskFormValues) => {
    try {
      setIsSubmitting(true);
      const result = onSubmit({
        ...data,
        // Ensure we pass back a real Date object to the handler
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined
      });

      // If it's a promise, await it (for legacy or non-optimistic handlers)
      if (result instanceof Promise) {
        await result;
      }

      reset(); // Clear form for next time
    } finally {
      setIsSubmitting(false);
    }
  };

  const loading = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register('title', { required: true })} placeholder="Task title" />
        {errors.title && <span className="text-xs text-red-500">Required</span>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} placeholder="Details..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select onValueChange={(v) => setValue('priority', v as TaskPriority)}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select onValueChange={(v) => setValue('category', v as TaskCategory)}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Input id="dueDate" type="date" {...register('dueDate')} />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating...' : 'Create Task'}
      </Button>
    </form>
  );
}
