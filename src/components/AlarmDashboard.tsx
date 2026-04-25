import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.tsx';
import { Button } from './ui/button.tsx';
import { 
  AlarmClock, 
  Bell, 
  BellOff, 
  History, 
  Settings2,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import SmartAlarm from './SmartAlarm.tsx';

export default function AlarmDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [history] = useState([
    { time: '06:00 AM', status: 'Success', date: 'Yesterday', points: '+15 XP' },
    { time: '06:00 AM', status: 'Success', date: '2 days ago', points: '+15 XP' },
    { time: '08:30 AM', status: 'Snoozed', date: '3 days ago', points: '+5 XP' },
  ]);

  return (
    <div className="flex-1 p-10 overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border-ui">
          <div>
            <div className="badge-paos mb-3 bg-rose-500/10 text-rose-500 border-rose-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full w-fit">Temporal Mastery</div>
            <h2 className="text-4xl font-bold text-white tracking-tight">Focus & Waking</h2>
          </div>
          <div className="flex gap-3">
             <Button 
               onClick={() => setIsModalOpen(true)}
               className="bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest px-8 shadow-lg shadow-rose-600/20 gap-2 h-12"
             >
              <AlarmClock className="w-4 h-4" /> Set New Alarm
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Alarms */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest px-2">Scheduled Protocols</h3>
            <Card className="bg-surface border-border-ui rounded-3xl p-8 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                    <Clock className="w-8 h-8 text-rose-500" />
                  </div>
                  <div>
                    <div className="text-5xl font-mono font-black text-white tracking-tighter">06:00 <span className="text-2xl opacity-40 uppercase">am</span></div>
                    <p className="text-xs text-text-secondary font-medium uppercase tracking-widest mt-1">Deep Work Wake Up</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                   <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20 text-[10px] font-bold uppercase">
                    <CheckCircle2 className="w-3 h-3" /> System Ready
                  </div>
                  <Button variant="ghost" className="text-text-secondary hover:text-rose-500 text-[10px] font-bold uppercase tracking-widest">
                    Deactivate
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-surface/50 border border-border-ui rounded-2xl p-6 border-dashed opacity-50 hover:opacity-100 transition-opacity cursor-pointer flex flex-col items-center justify-center gap-4 py-12">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-border-ui flex items-center justify-center">
                  <Bell className="w-6 h-6 text-text-secondary" />
                </div>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Add Morning Ritual</span>
              </Card>
              <Card className="bg-surface/50 border border-border-ui rounded-2xl p-6 border-dashed opacity-50 hover:opacity-100 transition-opacity cursor-pointer flex flex-col items-center justify-center gap-4 py-12">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-border-ui flex items-center justify-center">
                  <Settings2 className="w-6 h-6 text-text-secondary" />
                </div>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Ritual Settings</span>
              </Card>
            </div>
          </div>

          {/* History */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest px-2 flex items-center gap-2">
              <History className="w-4 h-4" />
              Wake Up Integrity
            </h3>
            <Card className="bg-surface border-border-ui rounded-3xl overflow-hidden shadow-xl">
              <CardContent className="p-0">
                <div className="p-6 border-b border-border-ui bg-background/50">
                  <div className="text-3xl font-black text-white">94%</div>
                  <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Consistency Score</p>
                </div>
                <div className="divide-y divide-border-ui">
                  {history.map((item, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-background/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.status === 'Success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          {item.status === 'Success' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-tight">{item.time}</p>
                          <p className="text-[10px] text-text-secondary">{item.date}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-indigo-400">{item.points}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <SmartAlarm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
