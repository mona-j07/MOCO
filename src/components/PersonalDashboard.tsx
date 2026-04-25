import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { db } from '../lib/firebase.ts';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.tsx';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Heart, Brain, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function PersonalDashboard() {
  const { user } = useApp();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'moods'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    return onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [user]);

  // Mock data for chart if no logs exist
  const chartData = logs.length > 0 
    ? [...logs].reverse().map((l, i) => ({ name: i.toString(), mood: l.aiResponse?.length || 5 }))
    : [
      { name: 'Mon', mood: 4 },
      { name: 'Tue', mood: 6 },
      { name: 'Wed', mood: 5 },
      { name: 'Thu', mood: 8 },
      { name: 'Fri', mood: 7 },
    ];

  return (
    <div className="flex-1 p-8 overflow-y-auto w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="card-paos bg-surface border-border-ui p-8 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Good Morning, {user?.displayName?.split(' ')[0]}</h2>
                <p className="text-text-secondary text-sm italic max-w-lg">
                  "The impediment to action advances action. What stands in the way becomes the way."
                </p>
              </div>
              <span className="badge-paos">System Quote</span>
            </div>
            
            <div className="mt-10 h-32 bg-background rounded-xl border border-border-ui flex flex-col items-center justify-center relative group">
              <div className="flex gap-1.5 items-end h-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="voice-bar" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <p className="text-[11px] text-text-secondary mt-3 font-mono uppercase tracking-[0.2em]">Listening for voice input...</p>
              <button className="absolute bottom-3 right-3 text-[10px] bg-surface/50 px-2.5 py-1 rounded-md text-text-primary border border-border-ui/50 hover:bg-surface">
                Switch to Text
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-surface border-border-ui rounded-xl p-5 hover:border-indigo-paos/30 transition-colors">
              <div className="flex justify-between mb-3">
                <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">Recent Draft</h3>
                <span className="text-[10px] text-text-secondary">14m ago</span>
              </div>
              <p className="text-sm font-semibold text-white mb-2 line-clamp-1">Meditations on Silicon</p>
              <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">Intersection of stoicism and software development dictated via moecho voice engine...</p>
              <div className="mt-4 flex gap-2">
                <span className="px-2 py-0.5 bg-background border border-border-ui/50 text-[10px] rounded text-text-secondary">Philosophy</span>
                <span className="px-2 py-0.5 bg-background border border-border-ui/50 text-[10px] rounded text-text-secondary">Draft</span>
              </div>
            </Card>
            
            <Card className="bg-surface border-border-ui rounded-xl p-5 hover:border-emerald-500/30 transition-colors">
              <div className="flex justify-between mb-3">
                <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">AI Improvement</h3>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Ready</span>
              </div>
              <p className="text-sm font-semibold text-white mb-2 line-clamp-1">Chapter 4: The Void</p>
              <p className="text-xs text-text-secondary line-clamp-2 italic leading-relaxed">"Enhanced flow by 24%. Tone adjusted to be more evocative and cinematic..."</p>
              <button className="mt-4 text-[10px] text-indigo-paos font-bold uppercase tracking-widest hover:underline text-left">Review Changes</button>
            </Card>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Card className="bg-surface border-border-ui rounded-xl p-6">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-widest mb-4 flex items-center justify-between">
              Learning Path
              <span className="text-indigo-paos">72%</span>
            </h3>
            <div className="mb-4">
              <p className="text-[10px] text-text-secondary mb-1 uppercase tracking-wider">Current Topic</p>
              <p className="text-sm font-bold text-white leading-snug">System Architecture (Microservices)</p>
            </div>
            <div className="w-full bg-background h-1.5 rounded-full overflow-hidden mb-6 border border-border-ui/30">
              <div className="bg-indigo-paos h-full w-[72%] shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            </div>
            <div className="bg-background p-4 rounded-xl border border-border-ui">
              <p className="text-[10px] font-bold text-indigo-paos mb-2 uppercase tracking-widest">Today's Challenge</p>
              <p className="text-xs text-text-primary leading-relaxed">Sketch a multi-tenant DB schema for a global SaaS.</p>
              <button className="mt-4 w-full py-2.5 bg-indigo-paos rounded-lg text-[10px] font-bold uppercase tracking-widest text-white shadow-lg hover:bg-indigo-paos/90 transition-all">
                Start Session
              </button>
            </div>
          </Card>

          <Card className="bg-surface border-border-ui rounded-xl p-6">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse shadow-[0_0_8px_#fb7185]" />
              CEO Intelligence
            </h3>
            <ul className="space-y-4">
              {[
                { icon: '📈', title: 'Cloud Inflation Index', desc: 'Costs up 4.2% this quarter.' },
                { icon: '🚀', title: 'Venture Pulse', desc: 'Series A rounds tightening.' },
                { icon: '💡', title: 'Opportunity', desc: 'New API released for Vector DB.' },
              ].map((item, i) => (
                <li key={i} className="flex gap-3 items-start group cursor-pointer">
                  <div className="text-lg bg-background p-1.5 rounded-lg border border-border-ui/50 group-hover:border-indigo-paos/30 transition-colors">{item.icon}</div>
                  <div>
                    <p className="text-xs text-white font-bold">{item.title}</p>
                    <p className="text-[10px] text-text-secondary">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <div className="px-1 flex items-center justify-between opacity-50">
             <span className="text-[9px] text-text-secondary font-mono tracking-widest uppercase">Memory Sync: 100%</span>
             <span className="text-[9px] text-text-secondary font-mono tracking-widest uppercase">v1.0.4 - STABLE</span>
          </div>
        </div>
      </div>
    </div>

  );
}
