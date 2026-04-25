import { supabase } from '@/lib/supabase';
import type { TaskCollaborator } from '@/lib/types';

const TABLE = 'task_collaborators';

const mapRow = (d: any): TaskCollaborator => ({
  id: d.id,
  taskId: d.task_id,
  invitedEmail: d.invited_email,
  access: d.access,
  status: d.status,
  createdAt: new Date(d.created_at),
});

export const getTaskCollaborators = async (taskId: string): Promise<TaskCollaborator[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) { console.error('[getTaskCollaborators]', error); return []; }
  return (data || []).map(mapRow);
};

export const addCollaborator = async (
  taskId: string,
  email: string,
  access: 'read' | 'edit' = 'read'
): Promise<TaskCollaborator> => {
  const { data, error } = await supabase
    .from(TABLE)
    .upsert({ task_id: taskId, invited_email: email, access, status: 'pending' }, { onConflict: 'task_id,invited_email' })
    .select()
    .single();

  if (error) { console.error('[addCollaborator]', error); throw error; }
  return mapRow(data);
};

export const removeCollaborator = async (collaboratorId: string): Promise<void> => {
  const { error } = await supabase.from(TABLE).delete().eq('id', collaboratorId);
  if (error) { console.error('[removeCollaborator]', error); throw error; }
};
