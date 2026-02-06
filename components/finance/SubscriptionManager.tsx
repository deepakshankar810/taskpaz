'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, Trash2, Calendar } from 'lucide-react';
import { Subscription } from '@/lib/types';
import { format } from 'date-fns';
import { addSubscription, deleteSubscription } from '@/lib/db/finance';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

import { useFinanceContext } from '@/components/providers/FinanceProvider';

export function SubscriptionManager({ subscriptions, userId, currency }: { subscriptions: Subscription[], userId: string, currency: string }) {
    const { setSubscriptions } = useFinanceContext();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [billingInterval, setBillingInterval] = useState('1');
    const [nextBillingDate, setNextBillingDate] = useState('');

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !amount || !nextBillingDate) return;

        // Optimistically close and clear
        setIsAddOpen(false);
        const currentName = name;
        const currentAmount = amount;
        const currentCategory = category;
        const currentDate = nextBillingDate;
        const currentCycle = billingCycle;
        const currentInterval = parseInt(billingInterval) || 1;

        setName('');
        setAmount('');
        setCategory('');
        setNextBillingDate('');
        setBillingInterval('1');

        const tempId = crypto.randomUUID();
        const optimisticSub = {
            id: tempId,
            userId,
            name: currentName,
            amount: parseFloat(currentAmount),
            category: currentCategory || 'General',
            billingCycle: currentCycle,
            billingInterval: currentInterval,
            nextBillingDate: new Date(currentDate),
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as any;

        setSubscriptions(prev => [optimisticSub, ...prev]);

        try {
            await addSubscription(userId, {
                name: currentName,
                amount: parseFloat(currentAmount),
                category: currentCategory || 'General',
                billingCycle: currentCycle,
                billingInterval: currentInterval,
                nextBillingDate: new Date(currentDate),
                active: true,
            } as any);
            toast.success('Subscription added');
        } catch (error) {
            toast.error('Failed to add subscription');
            setSubscriptions(prev => prev.filter(s => s.id !== tempId));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remove this subscription?')) return;
        const originalSubs = [...subscriptions];
        setSubscriptions(prev => prev.filter(s => s.id !== id));

        try {
            await deleteSubscription(id);
            toast.success('Subscription removed');
        } catch (error) {
            toast.error('Failed to remove');
            setSubscriptions(originalSubs);
        }
    };

    const totalMonthly = subscriptions.reduce((sum, sub) => {
        const interval = sub.billingInterval || 1;
        const monthlyRate = sub.billingCycle === 'monthly'
            ? sub.amount / interval
            : sub.amount / (interval * 12);
        return sum + (sub.active ? monthlyRate : 0);
    }, 0);

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-purple-500" />
                    Subscriptions
                </CardTitle>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8 gap-1">
                            <Plus className="h-4 w-4" />
                            Add
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Subscription</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAdd} className="space-y-4 pt-4">
                            <div className="grid gap-2">
                                <Label>Service Name</Label>
                                <Input placeholder="Netflix, Spotify..." value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Amount</Label>
                                    <Input type="number" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required />
                                </div>
                                <div className="grid gap-2 text-xs">
                                    <Label>Billing Frequency</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            min="1"
                                            className="w-16"
                                            value={billingInterval}
                                            onChange={e => setBillingInterval(e.target.value)}
                                            required
                                        />
                                        <Select value={billingCycle} onValueChange={(v: any) => setBillingCycle(v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="monthly">Months</SelectItem>
                                                <SelectItem value="yearly">Years</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Next Billing Date</Label>
                                <Input type="date" value={nextBillingDate} onChange={e => setNextBillingDate(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full">Save Subscription</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Monthly Commitment:</span>
                    <span className="font-bold text-purple-600">{currency}{totalMonthly.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="space-y-3">
                    {subscriptions.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm italic">
                            No active subscriptions tracked.
                        </div>
                    ) : (
                        subscriptions.map(sub => (
                            <div key={sub.id} className="flex items-center justify-between group p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-md border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all">
                                <div className="flex gap-3 items-center">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg h-9 w-9 flex items-center justify-center">
                                        <Calendar className="h-4 w-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{sub.name}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">
                                                {currency}{sub.amount} / {sub.billingInterval > 1 ? `${sub.billingInterval} ` : ''}{sub.billingCycle.replace('ly', '')}{sub.billingInterval > 1 ? 's' : ''}
                                            </span>
                                            <Badge variant="outline" className="h-4 text-[10px] px-1 uppercase">{format(sub.nextBillingDate, 'MMM d')}</Badge>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => handleDelete(sub.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
