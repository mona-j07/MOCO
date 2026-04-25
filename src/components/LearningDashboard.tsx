import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { db } from '../lib/firebase.ts';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.tsx';
import { Button } from './ui/button.tsx';
import { Progress } from './ui/progress.tsx';
import { Badge } from './ui/badge.tsx';
import { Code2, Trophy, BookOpen, Target, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

const mockTasks = [
  { id: '1', topic: 'Computer Architecture', description: 'Design a simple ALU schematic', type: 'project', status: 'pending', deadline: '2026-04-26' },
  { id: '2', topic: 'Cybersecurity', description: 'Explain the difference between Symmetric and Asymmetric encryption', type: 'quiz', status: 'completed', score: 95 },
  { id: '3', topic: 'IoT Systems', description: 'Review MQTT protocol basics', type: 'reading', status: 'pending', deadline: '2026-04-25' },
];

export default function LearningDashboard() {
  const { user } = useApp();
  const [tasks, setTasks] = useState<any[]>(mockTasks);
  const progress = 68;

  return (
    <div className="flex-1 p-10 overflow-y-auto bg-background">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="flex justify-between items-end border-b border-border-ui pb-8">
          <div>
            <div className="badge-paos mb-3">Intelligence Center</div>
            <h2 className="text-4xl font-bold text-white tracking-tight">Technical Mastery</h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-1">Total Progress</p>
            <div className="flex items-center gap-3">
              <Progress value={progress} className="w-48 h-2 bg-surface" />
              <span className="text-lg font-mono font-bold text-indigo-paos">{progress}%</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-paos" />
                Active Objectives
              </h3>
              <div className="grid gap-4">
                {tasks.map((task: any, i: number) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="bg-surface border-border-ui group hover:border-indigo-paos/30 transition-all rounded-2xl overflow-hidden shadow-sm">
                      <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-border-ui/50 ${
                            task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-background text-indigo-paos'
                          }`}>
                            <Code2 className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <h4 className="font-bold text-white uppercase tracking-tight">{task.topic}</h4>
                              <span className="text-[9px] font-bold bg-background border border-border-ui/50 text-text-secondary px-2 py-0.5 rounded uppercase">{task.type}</span>
                            </div>
                            <p className="text-xs text-text-secondary max-w-md leading-relaxed">{task.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {task.status === 'completed' ? (
                            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/5 px-3 py-1.5 rounded-lg border border-emerald-400/20 shadow-lg shadow-emerald-400/5">
                              <Trophy className="w-4 h-4" />
                              <span className="text-xs font-bold">{task.score} PTS</span>
                            </div>
                          ) : (
                            <Button className="bg-indigo-paos hover:bg-indigo-paos/90 text-white rounded-xl px-5 h-10 shadow-lg shadow-indigo-paos/20">
                              Begin Challenge
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <Card className="card-paos bg-surface border-border-ui">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-paos" />
                  Knowledge Base
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                {[
                  { title: 'The OSI Model Revisited', time: '12m' },
                  { title: 'Rust vs C++ in Embedded', time: '18m' },
                  { title: 'Zero Trust Architecture', time: '24m' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer p-2 hover:bg-background rounded-lg transition-all border border-transparent hover:border-border-ui/50">
                    <p className="text-xs text-text-secondary group-hover:text-white transition-colors">→ {item.title}</p>
                    <span className="text-[9px] font-mono text-text-secondary opacity-50 uppercase">{item.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-indigo-paos border-transparent relative overflow-hidden rounded-2xl group">
              <CardContent className="p-8 relative z-10">
                <Trophy className="w-10 h-10 mb-6 text-white/50 group-hover:scale-110 transition-transform" />
                <h4 className="text-lg font-bold text-white mb-2 uppercase tracking-tight">Weekly Objective</h4>
                <p className="text-xs text-white/80 mb-8 leading-relaxed">Build a custom kernel module for hardware interfacing on ARM systems.</p>
                <Button className="w-full bg-white text-indigo-paos hover:bg-white/90 font-bold rounded-xl py-6 shadow-2xl text-[10px] tracking-widest uppercase">
                  Accept Intel
                </Button>
              </CardContent>
              <div className="absolute -right-6 -bottom-6 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
            </Card>
          </aside>
        </div>
      </div>
    </div>

  );
}
