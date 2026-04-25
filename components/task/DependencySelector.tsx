'use client';

import { Task } from '@/lib/types';
import { useTasksContext } from '@/components/providers/TasksProvider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DependencySelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  excludeTaskId?: string;
}

export function DependencySelector({ selectedIds, onChange, excludeTaskId }: DependencySelectorProps) {
  const { tasks } = useTasksContext();
  
  // Filter out the current task being edited (to prevent self-dependency)
  const availableTasks = tasks.filter(t => t.id !== excludeTaskId && t.status !== 'completed');

  const toggleDependency = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (availableTasks.length === 0) {
    return <p className="text-xs text-slate-500 italic">No other active tasks available to depend on.</p>;
  }

  return (
    <div className="space-y-2">
      <ScrollArea className="h-[120px] rounded-md border p-2">
        <div className="space-y-2">
          {availableTasks.map((task) => (
            <div key={task.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`task-${task.id}`} 
                checked={selectedIds.includes(task.id)}
                onCheckedChange={() => toggleDependency(task.id)}
              />
              <Label 
                htmlFor={`task-${task.id}`}
                className="text-sm font-normal truncate cursor-pointer hover:text-blue-600 transition-colors"
              >
                {task.title}
              </Label>
            </div>
          ))}
        </div>
      </ScrollArea>
      <p className="text-[10px] text-slate-500 italic">Select tasks that must be finished before this one.</p>
    </div>
  );
}
