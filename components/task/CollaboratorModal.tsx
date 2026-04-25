'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getTaskCollaborators, addCollaborator, removeCollaborator } from '@/lib/db/collaborators';
import { TaskCollaborator } from '@/lib/types';
import { Users, UserPlus, Trash2, Mail, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface CollaboratorModalProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CollaboratorModal({ taskId, isOpen, onClose }: CollaboratorModalProps) {
  const [collaborators, setCollaborators] = useState<TaskCollaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [email, setEmail] = useState('');
  const [access, setAccess] = useState<'read' | 'edit'>('read');

  const fetchCollaborators = async () => {
    setLoading(true);
    try {
      const data = await getTaskCollaborators(taskId);
      setCollaborators(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchCollaborators();
  }, [isOpen, taskId]);

  const handleAdd = async () => {
    if (!email) return;
    setAdding(true);
    try {
      await addCollaborator(taskId, email, access);
      setEmail('');
      toast.success(`Invitation sent to ${email}`);
      fetchCollaborators();
    } catch (err) {
      toast.error('Failed to add collaborator');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeCollaborator(id);
      toast.success('Collaborator removed');
      fetchCollaborators();
    } catch (err) {
      toast.error('Failed to remove collaborator');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-5 w-5 text-blue-500" />
            <DialogTitle>Task Collaboration</DialogTitle>
          </div>
          <DialogDescription>
            Invite others to view or edit this task.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex flex-col gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</Label>
              <Input 
                id="email" 
                placeholder="colleague@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white dark:bg-slate-950"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select value={access} onValueChange={(v) => setAccess(v as any)}>
                  <SelectTrigger className="bg-white dark:bg-slate-950">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Viewer (Read only)</SelectItem>
                    <SelectItem value="edit">Editor (Can modify)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} disabled={adding || !email} className="shadow-sm">
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Invite
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Collaborators</Label>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
              </div>
            ) : collaborators.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed rounded-lg">
                <p className="text-sm text-slate-400">No collaborators yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {collaborators.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-md border bg-white dark:bg-slate-950 group">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                        <Mail className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{c.invitedEmail}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <Shield className="h-3 w-3" />
                          {c.access === 'edit' ? 'Editor' : 'Viewer'} • {c.status}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemove(c.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
