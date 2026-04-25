'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTasksContext } from '@/components/providers/TasksProvider';
import { getJournalEntryByDate, upsertJournalEntry } from '@/lib/db/journal';
import { JournalEntry, CreateJournalEntryInput } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, Save, CheckCircle2, Loader2, Smile, Meh, Frown, Heart, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const MOODS = [
  { id: 'great', label: 'Great', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 'good', label: 'Good', icon: Smile, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 'okay', label: 'Okay', icon: Meh, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'bad', label: 'Bad', icon: Frown, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'terrible', label: 'Terrible', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
] as const;

export default function JournalPage() {
  const { user } = useAuth();
  const { tasks } = useTasksContext();
  const [date, setDate] = useState<Date>(new Date());
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<JournalEntry['mood']>('okay');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const formattedDate = format(date, 'yyyy-MM-dd');
  
  const completedToday = tasks.filter(t => 
    t.status === 'completed' && t.completedAt && isSameDay(new Date(t.completedAt), date)
  );

  useEffect(() => {
    if (!user) return;

    const fetchEntry = async () => {
      setLoading(true);
      try {
        const entry = await getJournalEntryByDate(user.id, formattedDate);
        if (entry) {
          setContent(entry.content);
          setMood(entry.mood || 'okay');
        } else {
          setContent('');
          setMood('okay');
        }
      } catch (err) {
        console.error('Failed to fetch journal entry:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [user, formattedDate]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await upsertJournalEntry(user.id, {
        date: formattedDate,
        content,
        mood,
        completedTaskIds: completedToday.map(t => t.id)
      });
      toast.success('Journal entry saved');
    } catch (err) {
      toast.error('Failed to save journal entry');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const insertRecap = () => {
    if (completedToday.length === 0) {
      toast.info('No tasks completed on this day to recap.');
      return;
    }

    const recap = `<h3>End-of-Day Recap</h3><ul>${completedToday.map(t => `<li>${t.title}</li>`).join('')}</ul><p></p>`;
    setContent(recap + content);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Journal</h1>
          <p className="text-slate-500 mt-1">Reflect on your day and track your progress.</p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none">
            <CardHeader className="pb-3 border-b border-slate-50 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">What happened today?</CardTitle>
                <div className="flex gap-1">
                  {MOODS.map((m) => (
                    <Button
                      key={m.id}
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-10 w-10 rounded-full transition-all",
                        mood === m.id ? cn(m.bg, m.color, "scale-110 shadow-sm") : "opacity-40 grayscale hover:opacity-100 hover:grayscale-0"
                      )}
                      onClick={() => setMood(m.id)}
                      title={m.label}
                    >
                      <m.icon className="h-6 w-6" />
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-sm text-slate-500">Loading your thoughts...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="min-h-[400px]">
                    <RichTextEditor 
                      value={content} 
                      onChange={setContent} 
                      placeholder="Write your thoughts, blockers, or achievements..." 
                    />
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <Button variant="ghost" size="sm" onClick={insertRecap} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Auto-generate Recap
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="shadow-lg shadow-blue-500/20">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Save Entry
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-50/50 dark:bg-slate-900/50 border-dashed">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Accomplishments</CardTitle>
              <CardDescription>Tasks finished on this day.</CardDescription>
            </CardHeader>
            <CardContent>
              {completedToday.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-500">No tasks completed yet.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {completedToday.map(task => (
                    <li key={task.id} className="flex items-start gap-3 text-sm group">
                      <div className="mt-1 bg-green-500/20 rounded-full p-0.5">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
                        {task.title}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="bg-blue-600 text-white border-none shadow-lg shadow-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-widest">Journaling Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium leading-relaxed italic">
                "Writing about your failures is the best way to ensure they aren't repeated. Writing about your wins is the best way to ensure they are."
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
