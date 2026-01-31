import { Badge } from '@/components/ui/badge';
import { TaskCategory } from '@/lib/types';

export function CategoryBadge({ category }: { category: TaskCategory }) {
  return (
    <Badge variant="secondary" className="capitalize">
      {category}
    </Badge>
  );
}
