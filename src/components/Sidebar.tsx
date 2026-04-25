import { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { PAOSMode } from '../lib/gemini.ts';
import { 
  PenTool, 
  Code2, 
  Briefcase, 
  User, 
  Settings, 
  LogOut, 
  AlarmClock,
  LayoutDashboard,
  Wallet,
  ClipboardList
} from 'lucide-react';
import { Button } from './ui/button.tsx';
import { auth } from '../lib/firebase.ts';
import { cn } from '../lib/utils.ts';
import SmartAlarm from './SmartAlarm.tsx';

const modes: { id: PAOSMode; icon: any; label: string; color: string }[] = [
  { id: 'PERSONAL', icon: LayoutDashboard, label: 'Dashboard', color: 'text-sky-400' },
  { id: 'TASKS', icon: ClipboardList, label: 'Registry', color: 'text-indigo-400' },
  { id: 'FINANCE', icon: Wallet, label: 'Finance', color: 'text-emerald-400' },
  { id: 'AUTHOR', icon: PenTool, label: 'Writing', color: 'text-emerald-400' },
  { id: 'DEVELOPER', icon: Code2, label: 'Learning', color: 'text-indigo-400' },
  { id: 'CEO', icon: Briefcase, label: 'CEO Insights', color: 'text-amber-400' },
  { id: 'ALARM', icon: AlarmClock, label: 'Alarms', color: 'text-rose-400' },
];

export default function Sidebar() {
  const { mode, setMode, user } = useApp();
  const [alarmOpen, setAlarmOpen] = useState(false);

  return (
    <aside className="w-64 bg-background border-r border-border-ui flex flex-col h-full z-20">
      <div className="p-6 border-b border-border-ui">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-paos flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full opacity-80" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">moecho<span className="text-indigo-paos">.v1</span></h1>
        </div>
      </div>

      <div className="flex-1 py-4 px-3 space-y-1">
        <p className="px-3 text-[10px] uppercase tracking-widest text-text-secondary font-bold mb-3">Operating Modes</p>
        {modes.map((m) => {
          const Icon = m.icon;
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group text-sm font-medium",
                active 
                  ? "bg-surface text-white shadow-sm border border-border-ui/50" 
                  : "text-text-secondary hover:bg-surface/50 hover:text-text-primary"
              )}
            >
              <Icon className={cn("w-5 h-5", active ? "text-indigo-paos" : "text-text-secondary group-hover:text-text-primary")} />
              {m.label}
            </button>
          );
        })}

        <div className="pt-6">
          <p className="px-3 text-[10px] uppercase tracking-widest text-text-secondary font-bold mb-3">Utilities</p>
          <button 
            onClick={() => setAlarmOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface/50 transition-all text-sm font-medium"
          >
            <AlarmClock className="w-5 h-5" />
            Smart Alarm
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-border-ui">
        <div className="bg-surface p-3 rounded-lg flex items-center gap-3 border border-border-ui/50">
          <img 
            src={user?.photoURL || ''} 
            alt={user?.displayName || ''} 
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-paos"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.displayName}</p>
            <p className="text-[10px] text-text-secondary truncate">Premium Subscriber</p>
          </div>
          <button onClick={() => auth.signOut()} className="text-text-secondary hover:text-rose-400">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <SmartAlarm isOpen={alarmOpen} onClose={() => setAlarmOpen(false)} />
    </aside>
  );
}
