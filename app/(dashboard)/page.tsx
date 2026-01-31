'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getUserProfile } from '@/lib/auth';
import { useTasksContext } from '@/components/providers/TasksProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import type { Task, User } from '@/lib/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Use the new real-time hook which handles offline/cache automatically
  // This replaces both fetchStats and fetchTasks with a single efficient listener
  const { tasks, stats, loading: loadingTasks } = useTasksContext();

  // Computed today's tasks from the full list
  const todaysTasks = tasks.filter(t =>
    t.status === 'pending' || t.status === 'in-progress'
  ).slice(0, 5); // We only show top 5 anyway

  // Profile Cache for instant greeting
  useEffect(() => {
    const cachedProfile = localStorage.getItem(`profile_${user?.uid}`);
    if (cachedProfile) {
      try {
        setUserProfile(JSON.parse(cachedProfile));
      } catch (err) {
        console.error('Failed to parse cached profile', err);
      }
    }
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(user.uid);
        if (data) {
          setUserProfile(data);
          localStorage.setItem(`profile_${user.uid}`, JSON.stringify(data));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
    // No need to fetch stats/tasks manually anymore
  }, [user?.uid]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const nameToDisplay = userProfile?.name || user?.displayName || (loadingProfile ? '' : 'there');
  const firstName = nameToDisplay.split(' ')[0];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {getGreeting()}, {firstName || (loadingProfile ? <Skeleton className="h-9 w-32" /> : 'there')}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {loadingTasks ? <Skeleton className="h-4 w-48" /> : `You have ${stats?.pending || 0} tasks pending today.`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loadingTasks ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : (
          <>
            <StatsCard title="Total Tasks" value={stats?.total || 0} icon={<CheckCircle2 className="text-blue-500" />} />
            <StatsCard title="Pending" value={stats?.pending || 0} icon={<Clock className="text-yellow-500" />} />
            <StatsCard title="Completed" value={stats?.completed || 0} icon={<TrendingUp className="text-green-500" />} />
          </>
        )}
      </div>

      {/* Today's Tasks & Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/tasks?new=true">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Create New Task
              </Button>
            </Link>
            <Link href="/projects">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Create Project
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTasks ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : todaysTasks.length === 0 ? (
              <p className="text-sm text-slate-500">No active tasks found.</p>
            ) : (
              <ul className="space-y-2">
                {todaysTasks.slice(0, 5).map(task => (
                  <li key={task.id} className="rounded border p-2 text-sm bg-white dark:bg-slate-900 shadow-sm flex justify-between items-center">
                    <span>{task.title}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{task.priority}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon }: { title: string, value: number, icon: any }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
