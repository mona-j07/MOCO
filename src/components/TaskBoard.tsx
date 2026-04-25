import { useState, useEffect, useRef, FormEvent } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.tsx';
import { Button } from './ui/button.tsx';
import { useApp } from '../context/AppContext.tsx';
import { db } from '../lib/firebase.ts';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Calendar, 
  Trash2, 
  ClipboardList,
  AlertCircle,
  Layout,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'done';
  dueDate: string;
  createdAt: any;
}

export default function TaskBoard() {
  const { user } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '' });
  const notifiedTasks = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(taskList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Reminder System
  useEffect(() => {
    if (loading || tasks.length === 0) return;

    const checkReminders = () => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const todayStr = now.toISOString().split('T')[0];
      
      tasks.forEach(task => {
        if (task.status === 'done' || !task.dueDate || notifiedTasks.current.has(task.id)) return;

        if (task.dueDate < todayStr) {
          toast.error(`Overdue Protocol`, {
            description: `${task.title} was due on ${task.dueDate}`,
          });
          notifiedTasks.current.add(task.id);
        } else if (task.dueDate === todayStr) {
          toast.warning(`Critical Protocol Due`, {
            description: `${task.title} must be completed today`,
          });
          notifiedTasks.current.add(task.id);
        }
      });
    };

    checkReminders();
  }, [loading, tasks]);

  const addTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      await addDoc(collection(db, 'tasks'), {
        userId: user?.uid,
        title: newTask.title,
        description: newTask.description,
        status: 'todo',
        dueDate: newTask.dueDate || new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
      });
      setNewTask({ title: '', description: '', dueDate: '' });
      setIsAdding(false);
      toast.success("Task added to your system");
    } catch (error) {
      console.error(error);
      toast.error("Failed to sync task");
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        status: task.status === 'todo' ? 'done' : 'todo'
      });
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
      toast.info("Task removed");
    } catch (error) {
      toast.error("Deletion failed");
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'todo');
  const completedTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="flex-1 p-10 overflow-y-auto bg-background">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="flex items-end justify-between pb-8 border-b border-border-ui">
          <div>
            <div className="badge-paos mb-3 bg-indigo-500/10 text-indigo-500 border-indigo-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full w-fit">Registry</div>
            <h2 className="text-4xl font-bold text-white tracking-tight">Active Protocols</h2>
          </div>
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-indigo-paos hover:bg-indigo-paos/90 text-white font-bold rounded-2xl px-8 shadow-lg shadow-indigo-paos/20 gap-2 h-12"
          >
            <Plus className="w-4 h-4" /> New Task
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence>
              {isAdding && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="bg-surface border-indigo-paos/30 shadow-xl mb-6">
                    <CardContent className="p-6">
                      <form onSubmit={addTask} className="space-y-4">
                        <input
                          autoFocus
                          placeholder="What needs to be done?"
                          className="w-full bg-transparent text-xl font-bold text-white placeholder:text-text-secondary outline-none"
                          value={newTask.title}
                          onChange={e => setNewTask({...newTask, title: e.target.value})}
                        />
                        <textarea
                          placeholder="Protocol details..."
                          className="w-full bg-transparent text-sm text-text-secondary placeholder:text-text-secondary/30 outline-none resize-none h-20"
                          value={newTask.description}
                          onChange={e => setNewTask({...newTask, description: e.target.value})}
                        />
                        <div className="flex items-center justify-between pt-4 border-t border-border-ui">
                          <input
                            type="date"
                            className="bg-background border border-border-ui rounded-xl px-3 py-1.5 text-xs text-text-secondary outline-none focus:ring-1 ring-indigo-paos"
                            value={newTask.dueDate}
                            onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                          />
                          <div className="flex gap-2">
                            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="text-text-secondary hover:text-white">Cancel</Button>
                            <Button type="submit" className="bg-indigo-paos text-white px-6">Initialize</Button>
                          </div>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2 px-2">
                <ClipboardList className="w-4 h-4 text-indigo-paos" />
                Pending Queues
              </h3>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-surface rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : pendingTasks.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-border-ui rounded-3xl opacity-30">
                  <Layout className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-sm italic">"All protocols completed. Neutral state achieved."</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingTasks.map((task) => {
                    const now = new Date();
                    now.setHours(0, 0, 0, 0);
                    const todayStr = now.toISOString().split('T')[0];
                    const isOverdue = task.dueDate && task.dueDate < todayStr;
                    const isDueToday = task.dueDate === todayStr;

                    return (
                      <motion.div
                        layout
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <Card className={`bg-surface border-border-ui group hover:border-indigo-paos/30 transition-all cursor-pointer ${
                          isOverdue ? 'border-l-4 border-l-rose-500 shadow-lg shadow-rose-500/5' : 
                          isDueToday ? 'border-l-4 border-l-amber-500 shadow-lg shadow-amber-500/5' : ''
                        }`}>
                          <CardContent className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                              <button onClick={() => toggleTask(task)} className="text-text-secondary hover:text-indigo-paos transition-colors">
                                <Circle className="w-6 h-6" />
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold text-white truncate">{task.title}</h4>
                                  {isOverdue && <span className="text-[8px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">Overdue</span>}
                                  {isDueToday && <span className="text-[8px] font-black bg-amber-500 text-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Today</span>}
                                </div>
                                {task.description && <p className="text-xs text-text-secondary line-clamp-1">{task.description}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className={`hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase py-1 px-2 rounded-lg bg-background border ${
                                isOverdue ? 'text-rose-500 border-rose-500/20' : 
                                isDueToday ? 'text-amber-500 border-amber-500/20' : 
                                'text-text-secondary border-border-ui'
                              }`}>
                                <Clock className="w-3 h-3" /> {task.dueDate}
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => deleteTask(task.id)}
                                className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-rose-500 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {completedTasks.length > 0 && (
              <div className="pt-8 space-y-4">
                <h3 className="text-sm font-bold text-text-secondary/50 uppercase tracking-widest px-2">Archived Records</h3>
                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 rounded-xl bg-surface/30 border border-border-ui/50 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                      <div className="flex items-center gap-4">
                        <button onClick={() => toggleTask(task)} className="text-emerald-500">
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <span className="text-sm line-through text-text-secondary">{task.title}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)} className="h-8 w-8 text-text-secondary hover:text-rose-500">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stats & Context */}
          <div className="space-y-8">
            <Card className="bg-surface border-border-ui rounded-3xl overflow-hidden shadow-xl">
              <CardHeader className="p-6 border-b border-border-ui bg-indigo-paos/5">
                <CardTitle className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Layout className="w-4 h-4 text-indigo-paos" />
                  Efficiency Matrix
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2">
                    <span className="text-text-secondary">Completion Rate</span>
                    <span className="text-white">{tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%</span>
                  </div>
                  <div className="h-1 bg-background rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-indigo-paos"
                      initial={{ width: 0 }}
                      animate={{ width: tasks.length > 0 ? `${(completedTasks.length / tasks.length) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
                
                <div className="p-4 rounded-2xl bg-background border border-border-ui space-y-3">
                  <div className="flex items-center gap-2 text-rose-500">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">System Load</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {pendingTasks.length > 5 
                      ? "Cognitive load high. Recommend prioritization of deep work tasks." 
                      : "System load optimal. Continue protocol execution."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="p-6 rounded-3xl border border-border-ui bg-background flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Consistency Streak</h4>
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">12 Days Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
