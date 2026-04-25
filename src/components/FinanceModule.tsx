import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { db } from '../lib/firebase.ts';
import { collection, query, where, orderBy, onSnapshot, addDoc, limit, serverTimestamp } from 'firebase/firestore';
import { 
  Wallet, 
  TrendingDown, 
  TrendingUp, 
  Plus, 
  PieChart as PieChartIcon, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  BrainCircuit,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.tsx';
import { Button } from './ui/button.tsx';
import { Progress } from './ui/progress.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { cn } from '../lib/utils.ts';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function FinanceModule() {
  const { user } = useApp();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(docs);
      setLoading(false);
    });

    // Fetch budgets
    const bq = query(
      collection(db, 'budgets'),
      where('userId', '==', user.uid)
    );

    const bUnsubscribe = onSnapshot(bq, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBudgets(docs);
    });

    return () => {
      unsubscribe();
      bUnsubscribe();
    };
  }, [user]);

  // Calculate current month's expenses per category
  const currentMonthTransactions = transactions.filter(t => {
    if (t.type !== 'expense' || !t.createdAt) return false;
    const date = t.createdAt.toDate?.() || new Date(t.createdAt);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const categorySpending: Record<string, number> = {};
  currentMonthTransactions.forEach(t => {
    categorySpending[t.category] = (categorySpending[t.category] || 0) + (t.amount || 0);
  });

  // Calculate alerts
  const smartAlerts = budgets.map(budget => {
    const spending = categorySpending[budget.category] || 0;
    const percentage = (spending / budget.limit) * 100;
    
    if (percentage >= 100) {
      return { 
        type: 'critical', 
        category: budget.category, 
        message: `CRITICAL: You've exceeded your ${budget.category} budget (₹${spending.toLocaleString()} / ₹${budget.limit.toLocaleString()})` 
      };
    } else if (percentage >= 80) {
      return { 
        type: 'warning', 
        category: budget.category, 
        message: `WARNING: Nearing limit for ${budget.category} (${Math.round(percentage)}% used)` 
      };
    }
    return null;
  }).filter(Boolean);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + (t.amount || 0), 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  const balance = totalIncome - totalExpense;

  const chartData = transactions.slice(0, 7).reverse().map(t => ({
    name: format(new Date(t.createdAt?.toDate?.() || Date.now()), 'MMM d'),
    amount: t.amount,
    type: t.type
  }));

  // Group by category for bar chart
  const categories: Record<string, number> = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + (t.amount || 0);
  });

  const categoryData = Object.entries(categories).map(([name, value]) => ({ name, value }));

  const [isAdding, setIsAdding] = useState(false);
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [newTx, setNewTx] = useState({ amount: '', type: 'expense', category: 'Food', note: '' });
  const [newBudget, setNewBudget] = useState({ category: '', limit: '' });

  const handleAddTx = async () => {
    if (!newTx.amount || !user) return;
    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        amount: parseFloat(newTx.amount),
        type: newTx.type,
        category: newTx.category,
        note: newTx.note,
        createdAt: serverTimestamp(),
      });
      setIsAdding(false);
      setNewTx({ amount: '', type: 'expense', category: 'Food', note: '' });
      toast.success("Transaction recorded");
    } catch (e) {
      toast.error("Failed to add transaction");
    }
  };

  const handleAddBudget = async () => {
    if (!newBudget.category || !newBudget.limit || !user) return;
    try {
      await addDoc(collection(db, 'budgets'), {
        userId: user.uid,
        category: newBudget.category,
        limit: parseFloat(newBudget.limit),
        month: format(new Date(), 'yyyy-MM'),
        createdAt: serverTimestamp(),
      });
      setIsAddingBudget(false);
      setNewBudget({ category: '', limit: '' });
      toast.success("Budget set successfully");
    } catch (e) {
      toast.error("Failed to set budget");
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end border-b border-border-ui pb-8">
          <div>
            <div className="badge-paos mb-3 bg-emerald-500/10 text-emerald-500 border-emerald-500/30">Finance Active</div>
            <h2 className="text-4xl font-bold text-white tracking-tight">Financial Intelligence</h2>
          </div>
          <div className="flex gap-3">
             <Button 
               onClick={() => setIsAdding(!isAdding)}
               className="bg-indigo-paos hover:bg-indigo-paos/90 text-white rounded-xl gap-2 shadow-lg shadow-indigo-paos/20"
             >
              <Plus className="w-4 h-4" /> {isAdding ? 'Cancel' : 'Quick Entry'}
            </Button>
          </div>
        </header>
        
        {/* Smart Alerts */}
        <AnimatePresence>
          {smartAlerts.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {smartAlerts.map((alert: any, i: number) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border transition-all",
                    alert.type === 'critical' 
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400" 
                      : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  )}
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-xs font-bold uppercase tracking-wider leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-surface border border-border-ui rounded-3xl p-6 shadow-xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Amount</label>
                  <input 
                    type="number" 
                    value={newTx.amount}
                    onChange={e => setNewTx({...newTx, amount: e.target.value})}
                    placeholder="₹0.00"
                    className="w-full bg-background border border-border-ui rounded-xl px-4 py-2 text-white outline-none focus:ring-1 focus:ring-indigo-paos"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Type</label>
                  <select 
                    value={newTx.type}
                    onChange={e => setNewTx({...newTx, type: e.target.value as any})}
                    className="w-full bg-background border border-border-ui rounded-xl px-4 py-2 text-white outline-none focus:ring-1 focus:ring-indigo-paos"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Category</label>
                  <input 
                    type="text" 
                    value={newTx.category}
                    onChange={e => setNewTx({...newTx, category: e.target.value})}
                    placeholder="e.g. Food"
                    className="w-full bg-background border border-border-ui rounded-xl px-4 py-2 text-white outline-none focus:ring-1 focus:ring-indigo-paos"
                  />
                </div>
                <Button onClick={handleAddTx} className="bg-indigo-paos text-white rounded-xl h-10">Save Record</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-surface border-border-ui rounded-3xl p-6 relative overflow-hidden group border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">Total Balance</p>
              <Wallet className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-4xl font-bold text-white tracking-tight">₹{balance.toLocaleString()}</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded uppercase">+2.4% this month</span>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Wallet className="w-24 h-24" />
            </div>
          </Card>

          <Card className="bg-surface border-border-ui rounded-3xl p-6 relative overflow-hidden group border-l-4 border-l-indigo-paos">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">Monthly Income</p>
              <TrendingUp className="w-5 h-5 text-indigo-paos" />
            </div>
            <p className="text-4xl font-bold text-white tracking-tight">₹{totalIncome.toLocaleString()}</p>
            <p className="mt-4 text-[10px] text-text-secondary uppercase font-mono tracking-widest">Optimized for savings</p>
          </Card>

          <Card className="bg-surface border-border-ui rounded-3xl p-6 relative overflow-hidden group border-l-4 border-l-rose-500">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">Total Expenses</p>
              <TrendingDown className="w-5 h-5 text-rose-500" />
            </div>
            <p className="text-4xl font-bold text-white tracking-tight">₹{totalExpense.toLocaleString()}</p>
            <p className="mt-4 text-[10px] text-text-secondary uppercase font-mono tracking-widest">High velocity detected</p>
          </Card>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Main Chart Column */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <Card className="bg-surface border-border-ui rounded-3xl overflow-hidden shadow-2xl">
              <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-paos" />
                  Transaction Flow
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] p-8 pt-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '16px', fontSize: '10px' }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#6366f1" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* AI Advisor Card */}
            <Card className="bg-surface border-border-ui rounded-3xl p-8 border-l-4 border-l-amber-500 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <BrainCircuit className="w-6 h-6 text-amber-500" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Personal Financial Advisor</h3>
                </div>
                <p className="text-lg font-serif italic text-white leading-relaxed mb-6">
                  "Based on your recent transactions, your spending on 'Food' has increased by 14% compared to last week. I recommend moving ₹2,500 from your discretionary fund to savings today to maintain target velocity."
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-border-ui bg-background text-[10px] font-bold uppercase tracking-widest rounded-xl px-6">
                    Analyze Habits
                  </Button>
                  <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-widest rounded-xl px-6 text-[10px]">
                    Accept Recommendation
                  </Button>
                </div>
              </div>
              <div className="absolute -right-12 -top-12 opacity-5">
                <BrainCircuit className="w-64 h-64 text-amber-500" />
              </div>
            </Card>

            {/* Recent Transactions List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-paos" />
                  Recent Activity
                </h3>
                <span className="text-[10px] font-mono text-text-secondary opacity-50 uppercase">v1.2 SYNCED</span>
              </div>
              <div className="grid gap-3">
                {transactions.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-surface border border-border-ui rounded-2xl p-4 flex items-center justify-between group hover:border-indigo-paos/30 transition-all hover:bg-surface/80"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-border-ui/50 shadow-sm",
                        t.type === 'income' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      )}>
                        {t.type === 'income' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white tracking-tight">{t.note || t.category}</p>
                        <p className="text-[10px] text-text-secondary uppercase tracking-widest">{t.category} • {format(new Date(t.createdAt?.toDate?.() || Date.now()), 'hh:mm a')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-lg font-mono font-bold tracking-tighter",
                        t.type === 'income' ? "text-emerald-400" : "text-white"
                      )}>
                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            {/* Category Breadown */}
            <Card className="bg-surface border-border-ui rounded-3xl p-6">
              <h3 className="text-[10px] font-bold text-white uppercase tracking-widest mb-6 flex items-center justify-between">
                Category Breakdown
                <PieChartIcon className="w-4 h-4 text-indigo-paos" />
              </h3>
              <div className="h-[200px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={10} width={70} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '12px', fontSize: '10px' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#f43f5e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Budget Progress */}
            <Card className="bg-surface border-border-ui rounded-3xl p-6">
              <h3 className="text-[10px] font-bold text-white uppercase tracking-widest mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-rose-500" />
                  Budget Integrity
                </div>
                <button 
                  onClick={() => setIsAddingBudget(!isAddingBudget)}
                  className="p-1 hover:bg-background rounded-md transition-colors text-text-secondary hover:text-white"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </h3>
              <div className="space-y-6">
                <AnimatePresence>
                  {isAddingBudget && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 bg-background border border-border-ui rounded-2xl space-y-3"
                    >
                      <input 
                        type="text" 
                        placeholder="Category (e.g. Food)"
                        className="w-full bg-surface border border-border-ui rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                        value={newBudget.category}
                        onChange={e => setNewBudget({...newBudget, category: e.target.value})}
                      />
                      <input 
                        type="number" 
                        placeholder="Monthly Limit (₹)"
                        className="w-full bg-surface border border-border-ui rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                        value={newBudget.limit}
                        onChange={e => setNewBudget({...newBudget, limit: e.target.value})}
                      />
                      <Button 
                        onClick={handleAddBudget}
                        className="w-full h-8 text-[10px] bg-indigo-paos text-white rounded-xl"
                      >
                        Set Budget
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
                {budgets.length === 0 && (
                  <p className="text-[10px] text-text-secondary italic uppercase tracking-widest text-center py-4">No budgets set</p>
                )}
                {budgets.map((budget) => {
                  const spending = categorySpending[budget.category] || 0;
                  const percentage = Math.min((spending / budget.limit) * 100, 100);
                  const isOver = spending > budget.limit;

                  return (
                    <div key={budget.id}>
                      <div className="flex justify-between items-end mb-2">
                        <p className="text-xs font-bold text-white uppercase tracking-tight">{budget.category}</p>
                        <p className={cn(
                          "text-[10px] font-mono",
                          isOver ? "text-rose-400" : "text-text-secondary"
                        )}>
                          ₹{spending.toLocaleString()} / ₹{budget.limit.toLocaleString()}
                        </p>
                      </div>
                      <Progress 
                        value={percentage} 
                        className={cn(
                          "h-1.5 bg-background",
                          isOver ? "[&>div]:bg-rose-500" : "[&>div]:bg-indigo-paos"
                        )} 
                      />
                    </div>
                  );
                })}
                
                {smartAlerts.length > 0 && (
                  <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider leading-relaxed">
                      {smartAlerts.length} Active System Alert{smartAlerts.length > 1 ? 's' : ''} detected. Review your spending velocity.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Micro-Savings Goal */}
            <Card className="bg-indigo-paos border-transparent relative overflow-hidden rounded-3xl group">
              <CardContent className="p-8 relative z-10 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold mb-1 uppercase tracking-tight">House Fund</h4>
                <p className="text-sm text-white/70 mb-8">Save for a smart home in silicon valley.</p>
                
                <div className="space-y-2 mb-8">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em]">
                    <span>Progress</span>
                    <span>12%</span>
                  </div>
                  <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                    <div className="bg-white h-full w-[12%]" />
                  </div>
                </div>

                <Button className="w-full bg-white text-indigo-paos hover:bg-white/90 font-bold rounded-xl py-6 shadow-2xl text-[10px] tracking-widest uppercase">
                  Allocate Funds
                </Button>
              </CardContent>
              <div className="absolute -right-6 -bottom-6 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
