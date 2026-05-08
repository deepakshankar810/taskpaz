import { supabase } from '@/lib/supabase';

export interface FocusSession {
  id: string;
  user_id: string;
  task_id?: string;
  label: string;
  duration_minutes: number;
  completed_at: string;
}

const TABLE = 'focus_sessions';

export const saveFocusSession = async (session: Omit<FocusSession, 'id' | 'completed_at'>) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .insert([
        {
          user_id: session.user_id,
          task_id: session.task_id && session.task_id !== 'none' ? session.task_id : null,
          label: session.label,
          duration_minutes: session.duration_minutes,
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data as FocusSession;
  } catch (error) {
    console.error('[saveFocusSession] Error:', error);
    throw error;
  }
};

export const getFocusSessions = async (userId: string, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as FocusSession[];
  } catch (error) {
    console.error('[getFocusSessions] Error:', error);
    return [];
  }
};

export const deleteFocusSession = async (id: string) => {
  try {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[deleteFocusSession] Error:', error);
    throw error;
  }
};
