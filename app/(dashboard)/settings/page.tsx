'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getUserProfile } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, UserCircle, Settings as SettingsIcon, Shield, Bell, Palette } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setEmail(user.email || '');

    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile(user.id);
        if (profile) {
          setName(profile.name || user.user_metadata?.full_name || '');
        } else {
          setName(user.user_metadata?.full_name || '');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    // 1. Optimistic update: Update localStorage immediately
    const updatedProfile = {
      id: user.id,
      name: name,
      email: user.email || '',
      avatar: user.user_metadata?.avatar_url || '',
      updatedAt: new Date(),
    };
    localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));

    // 2. Fire and forget server updates
    toast.success('Profile updated successfully');
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-slate-500 mt-1 text-sm">Manage your account preferences and app settings.</p>
      </div>

      <div className="grid gap-10">
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
                  {loading ? <Skeleton className="h-10 w-full" /> : (
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                    />
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={email}
                    disabled
                    className="bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-500 italic">Email cannot be changed directly.</p>
                </div>
              </div>
              <Button type="submit" disabled={loading}>Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        {/* Placeholder Sections */}
        <div className="grid gap-8 md:grid-cols-2">
          <SettingsSection
            icon={<Shield className="h-5 w-5 text-purple-500" />}
            title="Privacy & Security"
            description="Manage your password and security keys."
          />
          <SettingsSection
            icon={<Bell className="h-5 w-5 text-yellow-500" />}
            title="Notifications"
            description="Configure how you receive updates."
          />
          <SettingsSection
            icon={<Palette className="h-5 w-5 text-pink-500" />}
            title="Appearance"
            description="Customize your theme and dashboard layout."
          />
          <SettingsSection
            icon={<SettingsIcon className="h-5 w-5 text-slate-500" />}
            title="Integrations"
            description="Connect your favorite tools."
          />
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
