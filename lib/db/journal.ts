import { supabase } from '@/lib/supabase';
import type { JournalEntry, CreateJournalEntryInput } from '@/lib/types';

const TABLE = 'journal_entries';

const mapRow = (d: any): JournalEntry => ({
  id: d.id,
  userId: d.user_id,
  date: d.date,
  content: d.content,
  mood: d.mood,
  completedTaskIds: d.completed_task_ids || [],
  createdAt: new Date(d.created_at),
  updatedAt: new Date(d.updated_at),
});

/** Get all journal entries for a user, ordered newest first */
export const getJournalEntries = async (userId: string): Promise<JournalEntry[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) { console.error('[getJournalEntries]', error); return []; }
  return (data || []).map(mapRow);
};

/** Get the entry for a specific date (YYYY-MM-DD) */
export const getJournalEntryByDate = async (
  userId: string,
  date: string
): Promise<JournalEntry | null> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();

  if (error) { console.error('[getJournalEntryByDate]', error); return null; }
  return data ? mapRow(data) : null;
};

/** Upsert (create or update) an entry for a date */
export const upsertJournalEntry = async (
  userId: string,
  input: CreateJournalEntryInput
): Promise<JournalEntry> => {
  const payload = {
    user_id: userId,
    date: input.date,
    content: input.content,
    mood: input.mood || null,
    completed_task_ids: input.completedTaskIds || [],
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: 'user_id,date' })
    .select()
    .single();

  if (error) { console.error('[upsertJournalEntry]', error); throw error; }
  return mapRow(data);
};

/** Delete a journal entry by id */
export const deleteJournalEntry = async (entryId: string): Promise<void> => {
  const { error } = await supabase.from(TABLE).delete().eq('id', entryId);
  if (error) { console.error('[deleteJournalEntry]', error); throw error; }
};
