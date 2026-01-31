import { Badge } from '@/components/ui/badge';
import { TaskPriority } from '@/lib/types';

const styles: Record<TaskPriority, string> = {
  urgent: 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200',
  high: 'bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200',
  low: 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200',
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge variant="outline" className={styles[priority] || styles.medium}>
      {priority}
    </Badge>
  );
}
