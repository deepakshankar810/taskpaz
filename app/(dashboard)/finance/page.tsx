'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useFinance } from '@/hooks/useFinance';
import { format, addMonths, subMonths, isSameMonth } from 'date-fns';
import { addTransaction, deleteTransaction } from '@/lib/db/finance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wallet, TrendingUp, TrendingDown, Plus, Trash2, ArrowUpRight, ArrowDownRight, Loader2, Download } from 'lucide-react';
import { CreateTransactionInput, TransactionType } from '@/lib/types';
import { toast } from 'sonner';
import { toDate } from '@/lib/utils';
import { SubscriptionManager } from '@/components/finance/SubscriptionManager';
import { SavingsGoals } from '@/components/finance/SavingsGoals';

export default function FinancePage() {
  const { user } = useAuth();
  const { transactions, subscriptions, savingsGoals, stats, loading } = useFinance(user?.uid);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [currency, setCurrency] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPeriod, setCurrentPeriod] = useState(new Date());

  const handlePrevMonth = () => setCurrentPeriod(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentPeriod(prev => addMonths(prev, 1));
  const handleCurrentMonth = () => setCurrentPeriod(new Date());

  // Load currency from local storage on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('finance_currency');
      setCurrency(saved || '$');
    }
  });

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCurrency(val);
    localStorage.setItem('finance_currency', val);
  };

  // Form State
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !category) return;

    // Close and clear immediately for instant feel
    setIsAddOpen(false);

    // Create a date in the selected month
    const transactionDate = new Date();
    transactionDate.setFullYear(currentPeriod.getFullYear());
    transactionDate.setMonth(currentPeriod.getMonth());

    const data: CreateTransactionInput = {
      amount: parseFloat(amount),
      type,
      category,
      description,
      date: transactionDate,
    };

    // Background write
    addTransaction(user.uid, data)
      .then(() => {
        toast.success('Transaction added');
      })
      .catch(err => {
        console.error('Error adding transaction:', err);
        toast.error('Failed to add transaction');
      });

    // Clear form
    setAmount('');
    setDescription('');
    setCategory('');
  };

  const { monthlyIncome, monthlyExpenses, filteredByPeriod } = useMemo(() => {
    const periodTransactions = transactions.filter(t => {
      const d = toDate(t.date);
      return d && isSameMonth(d, currentPeriod);
    });

    const income = periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const filtered = periodTransactions.filter(t => {
      const matchesSearch = (t.description || t.category).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    return { monthlyIncome: income, monthlyExpenses: expenses, filteredByPeriod: filtered };
  }, [transactions, currentPeriod, searchQuery, filterCategory]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await deleteTransaction(id);
      toast.success('Transaction deleted');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete');
    }
  };

  const formatCurrency = (val: number) => {
    const prefix = currency.length > 1 ? `${currency} ` : currency;
    return `${prefix}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleExport = () => {
    if (filteredByPeriod.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = filteredByPeriod.map(t => [
      format(toDate(t.date)!, 'yyyy-MM-dd'),
      t.type,
      t.category,
      t.description,
      t.amount
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${format(currentPeriod, 'yyyy-MM')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported to CSV');
  };

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className=" animate-spin text-slate-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Finance Tracker</h1>
          <p className="text-slate-500 text-sm">Managing finances for {format(currentPeriod, 'MMMM yyyy')}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white dark:bg-slate-900 border rounded-md p-1 mr-2">
            <Button variant="ghost" size="sm" onClick={handlePrevMonth} className="h-8 w-8 p-0">
              &lt;
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCurrentMonth} className="px-3 h-8 text-xs font-medium">
              Today
            </Button>
            <Button variant="ghost" size="sm" onClick={handleNextMonth} className="h-8 w-8 p-0">
              &gt;
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} className="h-9 mr-2">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border rounded-md px-3 py-1 mr-2">
            <span className="text-xs text-slate-500 font-medium">Currency:</span>
            <Input
              className="h-6 w-16 text-center p-0 border-none focus-visible:ring-0"
              value={currency}
              onChange={handleCurrencyChange}
              maxLength={5}
            />
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTransaction} className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v: TransactionType) => setType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-7"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {type === 'income' ? (
                        <>
                          <SelectItem value="Salary">Salary</SelectItem>
                          <SelectItem value="Freelance">Freelance</SelectItem>
                          <SelectItem value="Investment">Investment</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="Food">Food</SelectItem>
                          <SelectItem value="Transport">Transport</SelectItem>
                          <SelectItem value="Shopping">Shopping</SelectItem>
                          <SelectItem value="Bills">Bills</SelectItem>
                          <SelectItem value="Entertainment">Entertainment</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Description (Optional)</Label>
                  <Input
                    placeholder="What was this for?"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Save Transaction
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <Wallet className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-600'}`}>
              {formatCurrency(stats.balance)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(monthlyIncome)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(monthlyExpenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saving Rate</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {user && <SubscriptionManager subscriptions={subscriptions} userId={user.uid} currency={currency} />}
        {user && <SavingsGoals goals={savingsGoals} userId={user.uid} currency={currency} />}
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Transactions</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Search description..."
                className="w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Bills">Bills</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Salary">Salary</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Investment">Investment</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="flex h-[200px] flex-col items-center justify-center text-center space-y-2 border-2 border-dashed rounded-lg border-slate-200 dark:border-slate-800">
              <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-900">
                <Wallet className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500">No transactions yet. Add one to see it here.</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4 -mr-4">
              <div className="space-y-4">
                {filteredByPeriod.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                        {t.type === 'income' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{t.description || t.category}</p>
                        <p className="text-xs text-slate-500">{t.category} • {toDate(t.date)?.toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-900 dark:text-red-400'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => handleDelete(t.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredByPeriod.length === 0 && searchQuery && (
                  <div className="text-center py-8 text-slate-500">
                    No transactions match your search.
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
