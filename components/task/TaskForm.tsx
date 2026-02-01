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
  dueDate?: string;
  dueTime?: string;
}

interface TaskFormProps {
  onSubmit: (data: CreateTaskInput) => Promise<void> | void;
  isLoading?: boolean;
  defaultValues?: Partial<TaskFormValues>;
  submitLabel?: string;
}

export function TaskForm({ onSubmit, isLoading, defaultValues, submitLabel }: TaskFormProps) {
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<TaskFormValues>({
    defaultValues
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onFormSubmit = async (data: TaskFormValues) => {
    try {
      setIsSubmitting(true);

      let finalDueDate: Date | undefined;
      if (data.dueDate) {
        finalDueDate = new Date(data.dueDate);
        if (data.dueTime) {
          const [hours, minutes] = data.dueTime.split(':').map(Number);
          finalDueDate.setHours(hours, minutes);
        }
      }

      const result = onSubmit({
        ...data,
        dueDate: finalDueDate
      });

      if (result instanceof Promise) {
        await result;
      }

      reset();
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
          <Select
            defaultValue={defaultValues?.priority}
            onValueChange={(v) => setValue('priority', v as TaskPriority)}
          >
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
          <Select
            defaultValue={defaultValues?.category}
            onValueChange={(v) => setValue('category', v as TaskCategory)}
          >
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input id="dueDate" type="date" {...register('dueDate')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueTime">Due Time</Label>
          <Input id="dueTime" type="time" {...register('dueTime')} />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (submitLabel === 'Save Changes' ? 'Saving...' : 'Creating...') : (submitLabel || 'Create Task')}
      </Button>
    </form>
  );
}
