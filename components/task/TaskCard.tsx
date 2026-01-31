'use client';

import { Task } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Tag, Trash2, CheckCircle } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';
interface TaskCardProps {
  task: Task;
  onComplete?: () => void;
  onDelete?: () => void;
}

export function TaskCard({ task, onComplete, onDelete }: TaskCardProps) {

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-slate-500 line-clamp-2">{task.description}</p>
            )}
          </div>
          <PriorityBadge priority={task.priority} />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge category={task.category} />
          {task.dueDate && (
            <div className="flex items-center text-xs text-slate-500 bg-slate-100 rounded px-2 py-1 dark:bg-slate-800">
              <Clock className="w-3 h-3 mr-1" />
              {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-2">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
        {task.status !== 'completed' && (
          <Button size="sm" className="h-8" onClick={onComplete}>
            <CheckCircle className="w-4 h-4 mr-1" /> Complete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
