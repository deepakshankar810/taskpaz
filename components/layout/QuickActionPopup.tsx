'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckSquare, Folder, Wallet, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface QuickActionPopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function QuickActionPopup({ open, onOpenChange }: QuickActionPopupProps) {
    const router = useRouter();

    const actions = [
        {
            name: 'New Task',
            icon: CheckSquare,
            color: 'bg-blue-500',
            href: '/tasks?new=true',
        },
        {
            name: 'New Project',
            icon: Folder,
            color: 'bg-purple-500',
            href: '/projects',
        },
        {
            name: 'Add Transaction',
            icon: Wallet,
            color: 'bg-green-500',
            href: '/finance',
        },
    ];

    const handleAction = (href: string) => {
        onOpenChange(false);
        router.push(href);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Quick Actions</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                    {actions.map((action) => (
                        <button
                            key={action.name}
                            onClick={() => handleAction(action.href)}
                            className="flex items-center gap-4 p-4 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className={`p-3 rounded-full ${action.color} text-white`}>
                                <action.icon className="h-6 w-6" />
                            </div>
                            <span className="font-medium text-lg">{action.name}</span>
                        </button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
