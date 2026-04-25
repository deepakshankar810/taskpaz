'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileJson, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Task } from '@/lib/types';
import { createTask } from '@/lib/db/tasks';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';

interface ImportExportProps {
  tasks: Task[];
  onImportSuccess?: () => void;
}

export function ImportExport({ tasks, onImportSuccess }: ImportExportProps) {
  const { user } = useAuth();
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `taskpaz_tasks_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success('Tasks exported to JSON');
  };

  const handleExportCSV = () => {
    if (tasks.length === 0) return;
    
    const headers = ['Title', 'Description', 'Status', 'Priority', 'Category', 'Due Date'];
    const rows = tasks.map(t => [
      t.title,
      t.description?.replace(/<[^>]*>/g, '') || '',
      t.status,
      t.priority,
      t.category,
      t.dueDate ? new Date(t.dueDate).toISOString() : ''
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `taskpaz_tasks_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Tasks exported to CSV');
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        
        const importedTasks = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',');
          return {
            title: values[0],
            description: values[1],
            status: values[2] as any,
            priority: values[3] as any,
            category: values[4] as any,
            dueDate: values[5] ? new Date(values[5]) : undefined
          };
        });

        let successCount = 0;
        for (const task of importedTasks) {
          try {
            await createTask(user.id, task);
            successCount++;
          } catch (err) {
            console.error('Import failed for task:', task.title, err);
          }
        }

        toast.success(`Successfully imported ${successCount} tasks`);
        onImportSuccess?.();
      } catch (err) {
        toast.error('Failed to parse CSV file');
        console.error(err);
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={handleExportJSON} className="gap-2">
        <FileJson className="h-4 w-4 text-blue-500" />
        JSON Export
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
        <FileSpreadsheet className="h-4 w-4 text-green-500" />
        CSV Export
      </Button>
      <div className="relative">
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleImportCSV} 
          className="hidden" 
          ref={fileInputRef}
          disabled={isImporting}
        />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fileInputRef.current?.click()} 
          className="gap-2"
          disabled={isImporting}
        >
          {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 text-orange-500" />}
          CSV Import
        </Button>
      </div>
    </div>
  );
}
