'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getUserProfile } from '@/lib/auth';
import { useTasksContext } from '@/components/providers/TasksProvider';
import { useProjectsContext } from '@/components/providers/ProjectsProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle2, Clock, TrendingUp, Folder, Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import type { User } from '@/lib/types';
import { StreakCard } from '@/components/dashboard/StreakCard';

export default function DashboardPage() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [currency, setCurrency] = useState('$');

  // Data Hooks
  const { tasks, stats: taskStats, loading: loadingTasks } = useTasksContext();
  const { projects, loading: loadingProjects } = useProjectsContext();

  // Computed Data
  const todaysTasks = tasks.filter(t =>
    (t.status === 'pending' || t.status === 'in-progress')
  ).slice(0, 5);

  const recentProjects = projects.slice(0, 5);

  // Profile Cache & Greeting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCurrency = localStorage.getItem('finance_currency');
      if (savedCurrency) setCurrency(savedCurrency);
    }

    const cachedProfile = localStorage.getItem(`profile_${user?.id}`);
    if (cachedProfile) {
      try {
        setUserProfile(JSON.parse(cachedProfile));
      } catch (err) { }
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(user.id);
        if (data) {
          setUserProfile(data);
          localStorage.setItem(`profile_${user.id}`, JSON.stringify(data));
        }
      } catch (e) {
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [user?.id]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const nameToDisplay = userProfile?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const firstName = nameToDisplay.split(' ')[0];

  const formatCurrency = (val: number) => {
    const prefix = currency.length > 1 ? `${currency} ` : currency;
    return `${prefix}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-12 p-6 md:p-10 lg:p-14">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {getGreeting()}, {firstName || (loadingProfile ? <Skeleton className="h-9 w-32" /> : 'there')}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Here is your daily overview.
        </p>
      </div>

      {/* Gamification Row */}
      {!loadingTasks && tasks.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <StreakCard tasks={tasks} />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tasks Pending"
          value={taskStats?.pending || 0}
          icon={<Clock className="text-yellow-500" />}
          loading={loadingTasks}
        />
        <StatsCard
          title="Completed Tasks"
          value={taskStats?.completed || 0}
          icon={<CheckCircle2 className="text-green-500" />}
          loading={loadingTasks}
        />
        <StatsCard
          title="Total Projects"
          value={projects.length}
          icon={<Folder className="text-blue-500" />}
          loading={loadingProjects}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-10 md:grid-cols-2">

        {/* Recent Tasks */}
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-slate-500" />
              Recent Tasks
            </CardTitle>
            <Link href="/tasks">
              <Button variant="ghost" size="sm" className="text-xs">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingTasks ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : todaysTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[150px] text-center space-y-2">
                <p className="text-sm text-slate-500">No active tasks.</p>
                <Link href="/tasks?new=true"><Button variant="outline" size="sm">Create Task</Button></Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {todaysTasks.map(task => (
                  <Link key={task.id} href={`/tasks`}>
                    <li className="group rounded border p-3 text-sm bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all flex justify-between items-center cursor-pointer">
                      <span className="font-medium truncate">{task.title}</span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30' :
                          'bg-slate-100 text-slate-600 dark:bg-slate-800'
                        }`}>
                        {task.priority}
                      </span>
                    </li>
                  </Link>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-slate-500" />
              Recent Projects
            </CardTitle>
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="text-xs">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingProjects ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[150px] text-center space-y-2">
                <p className="text-sm text-slate-500">No projects yet.</p>
                <Link href="/projects"><Button variant="outline" size="sm">Create Project</Button></Link>
              </div>
            ) : (
              <div className="grid gap-2">
                {recentProjects.map(project => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="group flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full" style={{ backgroundColor: project.color }} />
                        <div>
                          <h3 className="font-medium text-sm group-hover:text-blue-600 transition-colors">{project.name}</h3>
                          <p className="text-xs text-slate-500">Updated {new Date(project.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Quick Actions Row */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        <Link href="/tasks?new=true" className="flex-1 min-w-[150px]">
          <Button className="w-full h-auto py-4 flex flex-col gap-1 items-center justify-center" variant="outline">
            <Plus className="h-5 w-5 mb-1" />
            <span>New Task</span>
          </Button>
        </Link>
        <Link href="/projects" className="flex-1 min-w-[150px]">
          <Button className="w-full h-auto py-4 flex flex-col gap-1 items-center justify-center" variant="outline">
            <Folder className="h-5 w-5 mb-1" />
            <span>New Project</span>
          </Button>
        </Link>
        <Link href="/finance" className="flex-1 min-w-[150px]">
          <Button className="w-full h-auto py-4 flex flex-col gap-1 items-center justify-center" variant="outline">
            <Wallet className="h-5 w-5 mb-1" />
            <span>Add Transaction</span>
          </Button>
        </Link>
      </div>

    </div>
  );
}

function StatsCard({ title, value, icon, loading, isCurrency }: { title: string, value: string | number, icon: any, loading?: boolean, isCurrency?: boolean }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-24" /> : (
          <div className={`text-2xl font-bold ${isCurrency && typeof value === 'string' && value.includes('-') ? 'text-red-500' : ''}`}>
            {value}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
