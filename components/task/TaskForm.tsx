'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreateTaskInput, TaskPriority, TaskCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Plus, X } from 'lucide-react';
import { Subtask } from '@/lib/types';

// Internal form state can have strings for dates (HTML input requirement)
interface TaskFormValues extends Omit<CreateTaskInput, 'dueDate'> {
  dueDate?: string;
  dueTime?: string;
  subtasks?: Subtask[];
  recurringPattern?: 'none' | 'daily' | 'weekly' | 'monthly';
}

interface TaskFormProps {
  onSubmit: (data: CreateTaskInput) => Promise<void> | void;
  isLoading?: boolean;
  defaultValues?: Partial<TaskFormValues>;
  submitLabel?: string;
}

export function TaskForm({ onSubmit, isLoading, defaultValues, submitLabel }: TaskFormProps) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TaskFormValues>({
    defaultValues
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const descriptionValue = watch('description');
  const subtasks = watch('subtasks') || [];

  const addSubtask = () => {
    setValue('subtasks', [...subtasks, { id: crypto.randomUUID(), title: '', completed: false }]);
  };

  const removeSubtask = (index: number) => {
    const newSubtasks = [...subtasks];
    newSubtasks.splice(index, 1);
    setValue('subtasks', newSubtasks);
  };

  const updateSubtask = (index: number, title: string) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index].title = title;
    setValue('subtasks', newSubtasks);
  };

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
        <RichTextEditor 
          value={descriptionValue || ''} 
          onChange={(val) => setValue('description', val)} 
          placeholder="Task details, notes, links..." 
        />
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

      <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
        <div className="flex items-center justify-between">
          <Label>Subtasks</Label>
          <Button type="button" variant="ghost" size="sm" onClick={addSubtask} className="h-6 text-xs">
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </div>
        {subtasks.length > 0 && (
          <div className="space-y-2">
            {subtasks.map((st, i) => (
              <div key={st.id} className="flex gap-2 items-center">
                <Input 
                  value={st.title} 
                  onChange={(e) => updateSubtask(i, e.target.value)}
                  placeholder="Subtask..."
                  className="h-8"
                />
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeSubtask(i)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Recurring</Label>
          <Select
            defaultValue={defaultValues?.recurringPattern || 'none'}
            onValueChange={(v) => setValue('recurringPattern', v as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="No repeat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No repeat</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          {/* Empty spacer or something else */}
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
