'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreateTaskInput, TaskPriority, TaskCategory, Subtask } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Plus, X, Timer, Tag as TagIcon, Link as LinkIcon } from 'lucide-react';
import { TagInput } from './TagInput';
import { DependencySelector } from './DependencySelector';

// Internal form state can have strings for dates (HTML input requirement)
interface TaskFormValues extends Omit<CreateTaskInput, 'dueDate'> {
  dueDate?: string;
  dueTime?: string;
  subtasks: Subtask[];
  tags: string[];
  dependencies: string[];
  estimatedMinutes?: number;
}

interface TaskFormProps {
  onSubmit: (data: CreateTaskInput) => Promise<void> | void;
  isLoading?: boolean;
  defaultValues?: Partial<TaskFormValues>;
  submitLabel?: string;
  taskId?: string; // Needed for dependency exclusion
}

export function TaskForm({ onSubmit, isLoading, defaultValues, submitLabel, taskId }: TaskFormProps) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TaskFormValues>({
    defaultValues: {
      subtasks: [],
      tags: [],
      dependencies: [],
      priority: 'medium',
      category: 'personal',
      ...defaultValues
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const descriptionValue = watch('description');
  const titleValue = watch('title');
  const subtasks = watch('subtasks') || [];
  const tags = watch('tags') || [];
  const dependencies = watch('dependencies') || [];



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

      const { dueDate: _, dueTime: __, ...rest } = data;
      
      const result = onSubmit({
        ...rest,
        dueDate: finalDueDate,
        estimatedMinutes: data.estimatedMinutes ? Number(data.estimatedMinutes) : undefined
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
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto px-1 pb-4 scrollbar-hide">
      <div className="space-y-4">
        {/* Title & AI Button */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="title" className="text-sm font-semibold">Title</Label>
          </div>
          <Input 
            id="title" 
            {...register('title', { required: true })} 
            placeholder="What needs to be done?" 
            className="text-lg font-medium h-12 focus-visible:ring-blue-500"
          />
          {errors.title && <span className="text-xs text-red-500">Title is required</span>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
          <RichTextEditor 
            value={descriptionValue || ''} 
            onChange={(val) => setValue('description', val)} 
            placeholder="Add context, links, or notes..." 
          />
        </div>

        {/* Priority & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Priority</Label>
            <Select
              value={watch('priority')}
              onValueChange={(v) => setValue('priority', v as TaskPriority)}
            >
              <SelectTrigger className="bg-white dark:bg-slate-900">
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
            <Label className="text-sm font-semibold">Category</Label>
            <Select
              value={watch('category')}
              onValueChange={(v) => setValue('category', v as TaskCategory)}
            >
              <SelectTrigger className="bg-white dark:bg-slate-900">
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

        {/* Time Estimate & Recurring */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Timer className="h-3 w-3 text-slate-400" />
              Estimate (mins)
            </Label>
            <Input 
              type="number" 
              {...register('estimatedMinutes')} 
              placeholder="e.g. 45" 
              className="bg-white dark:bg-slate-900"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Recurring</Label>
            <Select
              value={watch('recurringPattern') || 'none'}
              onValueChange={(v) => setValue('recurringPattern', v as any)}
            >
              <SelectTrigger className="bg-white dark:bg-slate-900">
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
        </div>

        {/* Due Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-sm font-semibold">Due Date</Label>
            <Input id="dueDate" type="date" {...register('dueDate')} className="bg-white dark:bg-slate-900" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueTime" className="text-sm font-semibold">Due Time</Label>
            <Input id="dueTime" type="time" {...register('dueTime')} className="bg-white dark:bg-slate-900" />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <TagIcon className="h-3 w-3 text-slate-400" />
            Tags
          </Label>
          <TagInput 
            tags={tags} 
            onChange={(newTags) => setValue('tags', newTags)} 
            placeholder="Work, urgent, home..." 
          />
        </div>

        {/* Dependencies */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <LinkIcon className="h-3 w-3 text-slate-400" />
            Dependencies
          </Label>
          <DependencySelector 
            selectedIds={dependencies} 
            onChange={(ids) => setValue('dependencies', ids)} 
            excludeTaskId={taskId}
          />
        </div>

        {/* Subtasks */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Subtasks</Label>
            <Button type="button" variant="ghost" size="sm" onClick={addSubtask} className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
              <Plus className="h-4 w-4 mr-1" /> Add Subtask
            </Button>
          </div>
          {subtasks.length > 0 && (
            <div className="space-y-2">
              {subtasks.map((st, i) => (
                <div key={st.id} className="flex gap-2 items-center animate-in slide-in-from-left-2 duration-200">
                  <Input 
                    value={st.title} 
                    onChange={(e) => updateSubtask(i, e.target.value)}
                    placeholder="Task step..."
                    className="h-10 bg-white dark:bg-slate-900"
                  />
                  <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => removeSubtask(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t sticky bottom-0 bg-white dark:bg-slate-950 pb-2 z-10">
        <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg shadow-blue-500/20" disabled={loading}>
          {loading ? (submitLabel === 'Save Changes' ? 'Saving...' : 'Creating...') : (submitLabel || 'Create Task')}
        </Button>
      </div>
    </form>
  );
}
