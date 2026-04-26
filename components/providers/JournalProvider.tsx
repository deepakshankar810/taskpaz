'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import { getJournalEntries } from '@/lib/db/journal';
import type { JournalEntry } from '@/lib/types';
import { toast } from 'sonner';

interface JournalContextType {
    entries: JournalEntry[];
    loading: boolean;
    refreshEntries: () => Promise<void>;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export function JournalProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshEntries = async () => {
        if (!user) return;
        try {
            const data = await getJournalEntries(user.id);
            setEntries(data);
        } catch (error) {
            console.error('Error fetching journal entries:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            refreshEntries();

            // Real-time updates
            const channel = supabase
                .channel(`journal_changes_${user.id}`)
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'journal_entries', filter: `user_id=eq.${user.id}` },
                    () => {
                        refreshEntries();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        } else {
            setEntries([]);
            setLoading(false);
        }
    }, [user]);

    return (
        <JournalContext.Provider value={{ entries, loading, refreshEntries }}>
            {children}
        </JournalContext.Provider>
    );
}

export const useJournal = () => {
    const context = useContext(JournalContext);
    if (context === undefined) {
        throw new Error('useJournal must be used within a JournalProvider');
    }
    return context;
};
