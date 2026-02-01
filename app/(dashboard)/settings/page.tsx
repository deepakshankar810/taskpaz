'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTheme } from 'next-themes';
import { updateProfile } from 'firebase/auth';
import { createOrUpdateUserProfile, getUserProfile } from '@/lib/auth';
import { toast } from 'sonner';
import { Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async () => {
    if (!user) return;

    // 1. Optimistic update: Update localStorage immediately
    const updatedProfile = {
      id: user.uid,
      name: name,
      email: user.email || '',
      avatar: user.photoURL || '',
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`profile_${user.uid}`, JSON.stringify(updatedProfile));

    // 2. Fire and forget server updates
    toast.success('Profile updated successfully');

    try {
      // Update Firebase Auth profile
      await updateProfile(user, { displayName: name });
      // Update Firestore profile
      await createOrUpdateUserProfile(user);
    } catch (error) {
      console.error('Background profile update failed:', error);
      // We don't necessarily show an error toast here if we want it to feel "done" 
      // but maybe a subtle one if it actually fails long term.
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your public profile information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" defaultValue={user?.email || ''} disabled className="bg-slate-100 dark:bg-slate-800" />
          </div>
          <Button onClick={handleSaveProfile} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your application experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                Dark Mode
                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Label>
              <p className="text-sm text-slate-500">Enable high contrast theme.</p>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
