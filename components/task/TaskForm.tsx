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
import { Plus, X, Tag as TagIcon } from 'lucide-react';
import { TagInput } from './TagInput';

// Internal form state can have strings for dates (HTML input requirement)
interface TaskFormValues extends Omit<CreateTaskInput, 'dueDate'> {
  dueDate?: string;
  dueTime?: string;
  tags: string[];
}

interface TaskFormProps {
  onSubmit: (data: CreateTaskInput) => Promise<void> | void;
  isLoading?: boolean;
  defaultValues?: Partial<TaskFormValues>;
  submitLabel?: string;
  taskId?: string; // Needed for excluding current task
}

export function TaskForm({ onSubmit, isLoading, defaultValues, submitLabel, taskId }: TaskFormProps) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TaskFormValues>({
    defaultValues: {
      tags: [],
      priority: 'medium',
      category: 'personal',
      ...defaultValues
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const descriptionValue = watch('description');
  const tags = watch('tags') || [];

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

      const { dueDate: _, dueTime: __, ...rest } = data;
      
      const result = onSubmit({
        ...rest,
        dueDate: finalDueDate,
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
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col h-full max-h-[85vh]">
      <div className="flex-1 overflow-y-auto px-1 pb-6 space-y-6 scrollbar-hide">
        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Title</Label>
            <Input 
              id="title" 
              {...register('title', { required: true })} 
              placeholder="What needs to be done?" 
              className="text-lg font-bold h-12 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500 bg-white dark:bg-slate-900 shadow-sm"
            />
            {errors.title && <span className="text-xs text-red-500 font-medium">Title is required</span>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</Label>
            <RichTextEditor 
              value={descriptionValue || ''} 
              onChange={(val) => setValue('description', val)} 
              placeholder="Add context, links, or notes..." 
            />
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Priority</Label>
              <Select
                value={watch('priority')}
                onValueChange={(v) => setValue('priority', v as TaskPriority)}
              >
                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-10">
                  <SelectValue placeholder="Select priority" />
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
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category</Label>
              <Select
                value={watch('category')}
                onValueChange={(v) => setValue('category', v as TaskCategory)}
              >
                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-10">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recurring & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Recurring</Label>
              <Select
                value={watch('recurringPattern') || 'none'}
                onValueChange={(v) => setValue('recurringPattern', v as any)}
              >
                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-10">
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
              <Label htmlFor="dueDate" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Due Date</Label>
              <Input 
                id="dueDate" 
                type="date" 
                {...register('dueDate')} 
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-10 w-full" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueTime" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Due Time</Label>
              <Input 
                id="dueTime" 
                type="time" 
                {...register('dueTime')} 
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-10 w-full" 
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <TagIcon className="h-3 w-3 text-slate-400" />
              Tags
            </Label>
            <TagInput 
              tags={tags} 
              onChange={(newTags) => setValue('tags', newTags)} 
              placeholder="Work, urgent, home..." 
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t bg-white dark:bg-slate-950/50 mt-2">
        <Button 
          type="submit" 
          className="w-full h-12 text-lg font-bold shadow-xl shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-none" 
          disabled={loading}
        >
          {loading ? (submitLabel === 'Save Changes' ? 'Saving...' : 'Creating...') : (submitLabel || 'Create Task')}
        </Button>
      </div>
    </form>
  );
}
