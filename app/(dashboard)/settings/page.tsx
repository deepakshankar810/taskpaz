'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useNotification } from '@/components/providers/NotificationProvider';
import { getUserProfile, updateUserProfile } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserCircle, Settings as SettingsIcon, Bell, Palette } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useThemeAccent } from '@/components/providers/ThemeAccentProvider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check } from 'lucide-react';

export default function SettingsPage() {
  const { user, profile: authProfile, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { requestPermission, sendNotification } = useNotification();
  const { vibe, setVibe, availableVibes } = useThemeAccent();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // Notification states
  const [browserNotifs, setBrowserNotifs] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setEmail(user.email || '');

    // Load notification preferences
    if (typeof window !== 'undefined') {
      const savedBrowser = localStorage.getItem(`notif_browser_${user.id}`);
      if (savedBrowser !== null) setBrowserNotifs(savedBrowser === 'true');
    }

    if (authProfile) {
      setName(authProfile.name || '');
      setLoading(false);
    } else if (user.user_metadata?.full_name) {
      setName(user.user_metadata.full_name);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user, authProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await updateUserProfile({
        id: user.id,
        name,
        email: user.email || ''
      });

      if (error) throw error;

      if (data) {
        localStorage.setItem(`profile_${user.id}`, JSON.stringify(data));
        await refreshProfile();
        toast.success('Profile updated successfully');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotif = async (type: 'browser', val: boolean) => {
    if (type === 'browser') {
      if (val) {
        if ('Notification' in window) {
          if (Notification.permission !== 'granted') {
            await requestPermission();
          }
          if (Notification.permission === 'granted') {
            setBrowserNotifs(true);
            localStorage.setItem(`notif_browser_${user?.id}`, 'true');
            toast.success('Browser notifications enabled');
            sendNotification('Notifications Enabled', { body: 'You will now receive alerts for urgent tasks.' });
          } else {
            toast.error('Notification permission denied');
            setBrowserNotifs(false);
            localStorage.setItem(`notif_browser_${user?.id}`, 'false');
          }
        } else {
          toast.error('Browser does not support notifications');
          setBrowserNotifs(false);
        }
      } else {
        setBrowserNotifs(false);
        localStorage.setItem(`notif_browser_${user?.id}`, 'false');
        toast.success('Browser notifications disabled');
      }
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-slate-500 mt-1 text-sm">Manage your account preferences and app settings.</p>
      </div>

      <div className="grid gap-8">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-blue-500" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={email} disabled className="bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed" />
                </div>
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-pink-500" />
                Appearance
              </CardTitle>
              <CardDescription>Customize your theme and view.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Theme Mode</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t space-y-3">
                <Label className="text-xs uppercase font-bold text-slate-500 tracking-wider">Accent Vibe</Label>
                <div className="flex flex-wrap gap-3">
                    <TooltipProvider>
                        {(Object.entries(availableVibes) as [any, any][]).map(([key, info]) => (
                            <Tooltip key={key}>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => setVibe(key)}
                                        className={`group relative h-10 w-10 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 flex items-center justify-center ${
                                            vibe === key ? 'border-primary ring-2 ring-primary/20 ring-offset-2 dark:ring-offset-slate-950 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                        style={{ backgroundColor: info.color }}
                                    >
                                        {vibe === key && <Check className="h-5 w-5 text-white drop-shadow-md" />}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p className="text-xs font-bold">{info.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </TooltipProvider>
                </div>
                <p className="text-[10px] text-slate-400">Choose a primary accent color that flows through the entire app.</p>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-yellow-500" />
                Notifications
              </CardTitle>
              <CardDescription>Stay updated with your tasks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Browser Push Notifications</Label>
                  <p className="text-[10px] text-slate-500">Alerts for urgent tasks and deadlines.</p>
                </div>
                <Switch checked={browserNotifs} onCheckedChange={(v) => handleToggleNotif('browser', v)} />
              </div>
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-slate-500" />
                Integrations
              </CardTitle>
              <CardDescription>Connected services and tools.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-white flex items-center justify-center border shadow-sm text-xs font-bold">G</div>
                  <div>
                    <h4 className="text-sm font-medium">Google Services</h4>
                    <p className="text-xs text-slate-500">Auth & Drive</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Connected</Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white shadow-sm text-[10px] font-bold">S</div>
                  <div>
                    <h4 className="text-sm font-medium">Supabase</h4>
                    <p className="text-xs text-slate-500">Database & Storage</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
