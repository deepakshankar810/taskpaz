'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, Trash2, TrendingUp } from 'lucide-react';
import { SavingsGoal } from '@/lib/types';
import { addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } from '@/lib/db/finance';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { useFinanceContext } from '@/components/providers/FinanceProvider';

export function SavingsGoals({ goals, userId, currency }: { goals: SavingsGoal[], userId: string, currency: string }) {
    const { setSavingsGoals } = useFinanceContext();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
    const [depositAmount, setDepositAmount] = useState('');

    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [color, setColor] = useState('#3b82f6');

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !target) return;

        // Optimistic close
        setIsAddOpen(false);
        const currentName = name;
        const currentTarget = target;
        const currentColor = color;

        setName('');
        setTarget('');

        const tempId = crypto.randomUUID();
        const optimisticGoal = {
            id: tempId,
            userId,
            name: currentName,
            targetAmount: parseFloat(currentTarget),
            currentAmount: 0,
            color: currentColor,
            isCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as any;

        setSavingsGoals(prev => [optimisticGoal, ...prev]);

        try {
            await addSavingsGoal(userId, {
                name: currentName,
                targetAmount: parseFloat(currentTarget),
                currentAmount: 0,
                color: currentColor,
                isCompleted: false,
            });
            toast.success('Goal created');
        } catch (error) {
            toast.error('Failed to create goal');
            setSavingsGoals(prev => prev.filter(g => g.id !== tempId));
        }
    };

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGoal || !depositAmount) return;

        const goal = selectedGoal;
        // Optimistic close
        setIsDepositOpen(false);
        const amount = depositAmount;
        setDepositAmount('');
        setSelectedGoal(null);

        const newAmount = goal.currentAmount + parseFloat(amount);
        const isCompleted = newAmount >= goal.targetAmount;

        const originalGoals = [...goals];
        setSavingsGoals(prev => prev.map(g =>
            g.id === goal.id ? { ...g, currentAmount: newAmount, isCompleted } : g
        ));

        try {
            await updateSavingsGoal(goal.id, {
                currentAmount: newAmount,
                isCompleted,
            });
            toast.success('Savings updated!');
        } catch (error) {
            toast.error('Failed to update savings');
            setSavingsGoals(originalGoals);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this goal?')) return;
        const originalGoals = [...goals];
        setSavingsGoals(prev => prev.filter(g => g.id !== id));

        try {
            await deleteSavingsGoal(id);
            toast.success('Goal deleted');
        } catch (error) {
            toast.error('Failed to delete');
            setSavingsGoals(originalGoals);
        }
    };

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    Savings Goals
                </CardTitle>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8 gap-1">
                            <Plus className="h-4 w-4" />
                            New Goal
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Savings Goal</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddGoal} className="space-y-4 pt-4">
                            <div className="grid gap-2">
                                <Label>Goal Name</Label>
                                <Input placeholder="e.g. New Macbook, House Fund..." value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div className="grid gap-2">
                                <Label>Target Amount</Label>
                                <Input type="number" step="0.01" placeholder="0.00" value={target} onChange={e => setTarget(e.target.value)} required />
                            </div>
                            <div className="grid gap-2">
                                <Label>Theme Color</Label>
                                <div className="flex gap-2">
                                    {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-slate-900 dark:border-white shadow-sm' : 'border-transparent'}`}
                                            style={{ backgroundColor: c }}
                                            onClick={() => setColor(c)}
                                        />
                                    ))}
                                </div>
                            </div>
                            <Button type="submit" className="w-full">Create Goal</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {goals.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm italic">
                            Set your first goal to start saving.
                        </div>
                    ) : (
                        goals.map(goal => {
                            const progress = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
                            return (
                                <div key={goal.id} className="space-y-2 group">
                                    <div className="flex justify-between items-end">
                                        <div className="flex gap-2 items-center">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: goal.color }} />
                                            <span className="text-sm font-semibold">{goal.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">{currency}{goal.currentAmount} / {currency}{goal.targetAmount}</span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(goal.id)}>
                                                <Trash2 className="h-3 w-3 text-red-400" />
                                            </Button>
                                        </div>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                    <div className="flex justify-between items-center pr-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{progress}% Saved</span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 text-[10px] px-2 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                                            onClick={() => {
                                                setSelectedGoal(goal);
                                                setIsDepositOpen(true);
                                            }}
                                        >
                                            <Plus className="h-2.5 w-2.5 mr-1" />
                                            Add Savings
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add to "{selectedGoal?.name}"</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleDeposit} className="space-y-4 pt-4">
                            <div className="grid gap-2">
                                <Label>Amount to add</Label>
                                <Input type="number" step="0.01" placeholder="0.00" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} required autoFocus />
                            </div>
                            <Button type="submit" className="w-full">Confirm Deposit</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
