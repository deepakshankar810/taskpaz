'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { breakdownTask, AIBreakdownResult } from '@/lib/ai/taskBreakdown';
import { toast } from 'sonner';

interface AIBreakdownButtonProps {
  title: string;
  description?: string;
  onResult: (result: AIBreakdownResult) => void;
  disabled?: boolean;
}

export function AIBreakdownButton({ title, description, onResult, disabled }: AIBreakdownButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleBreakdown = async () => {
    if (!title) {
      toast.error('Please enter a task title first');
      return;
    }

    try {
      setLoading(true);
      const result = await breakdownTask(title, description);
      onResult(result);
      toast.success('Task broken down successfully!');
    } catch (error: any) {
      console.error('AI Breakdown error:', error);
      toast.error(error.message || 'Failed to breakdown task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleBreakdown}
      disabled={loading || disabled || !title}
      className="gap-2 border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 dark:border-purple-900/30 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Sparkles className="h-3 w-3 text-purple-500" />
      )}
      {loading ? 'Analyzing...' : 'AI Breakdown'}
    </Button>
  );
}
