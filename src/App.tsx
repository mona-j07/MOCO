import { AppProvider, useApp } from './context/AppContext.tsx';
import Sidebar from './components/Sidebar.tsx';
import ChatInterface from './components/ChatInterface.tsx';
import WritingStudio from './components/WritingStudio.tsx';
import LearningDashboard from './components/LearningDashboard.tsx';
import CEOInsights from './components/CEOInsights.tsx';
import PersonalDashboard from './components/PersonalDashboard.tsx';
import FinanceModule from './components/FinanceModule.tsx';
import AlarmDashboard from './components/AlarmDashboard.tsx';
import TaskBoard from './components/TaskBoard.tsx';
import Auth from './components/Auth.tsx';
import { Toaster } from './components/ui/sonner.tsx';
import { cn } from './lib/utils.ts';

function AppContent() {
  const { user, loading, mode, setMode } = useApp();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0F172A] text-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mb-4" />
          <p className="font-mono text-sm uppercase tracking-widest opacity-50">Initializing moecho...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen bg-background text-text-primary overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Theme Header */}
        <header className="h-16 border-b border-border-ui bg-background/50 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">Active Mode</span>
            <div className="flex bg-surface rounded-full p-1 border border-border-ui/50">
              {["AUTHOR", "DEVELOPER", "TASKS", "CEO", "PERSONAL", "FINANCE", "ALARM"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m as any)}
                  className={cn(
                    "px-4 py-1 rounded-full text-[10px] font-bold transition-all uppercase tracking-wider",
                    mode === m 
                      ? "bg-indigo-paos text-white shadow-lg" 
                      : "text-text-secondary hover:text-white"
                  )}
                >
                  {m === "PERSONAL" ? "SELF" : (m === "DEVELOPER" ? "DEV" : m)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span className="text-[10px] font-mono text-text-secondary font-medium">AI ORCHESTRATOR ONLINE</span>
            </div>
            <button className="text-text-secondary hover:text-white transition-colors relative">
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-paos rounded-full border-2 border-background" />
              🔔
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* State-based routing for modes */}
          {mode === "AUTHOR" && <WritingStudio />}
          {mode === "DEVELOPER" && <LearningDashboard />}
          {mode === "TASKS" && <TaskBoard />}
          {mode === "CEO" && <CEOInsights />}
          {mode === "PERSONAL" && <PersonalDashboard />}
          {mode === "FINANCE" && <FinanceModule />}
          {mode === "ALARM" && <AlarmDashboard />}
        </div>
        
        {/* Floating Chat Interface */}
        <ChatInterface />
      </main>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
