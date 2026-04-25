import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.tsx';
import { Button } from './ui/button.tsx';
import { useApp } from '../context/AppContext.tsx';
import { db } from '../lib/firebase.ts';
import { ai } from '../lib/gemini.ts';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { 
  Briefcase, 
  TrendingUp, 
  Globe, 
  Zap, 
  ArrowUpRight,
  TrendingDown,
  Quote,
  Target,
  Brain,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

const mockTrends = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 8000 },
  { name: 'May', value: 7000 },
  { name: 'Jun', value: 9000 },
];

export default function CEOInsights() {
  const { user } = useApp();
  const [training, setTraining] = useState<any>(null);
  const [globalPulse, setGlobalPulse] = useState<any[]>([]);
  const [loadingPulse, setLoadingPulse] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAndAnalyzeNews = async () => {
    setLoadingPulse(true);
    try {
      const newsRes = await fetch('/api/news/pulse');
      const newsData = await newsRes.json();
      
      if (newsData.news && newsData.news.length > 0) {
        const prompt = `
          Analyze these global headlines for a CEO. Return a JSON array of objects with keys: 
          title, summary (1 line), insight, risk, opportunity, source.
          
          News:
          ${newsData.news.map((n: any) => `- ${n.title}: ${n.summary}`).join('\n')}
        `;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          }
        });

        const insights = JSON.parse(response.text);
        setGlobalPulse(insights);
      }
    } catch (error) {
      console.error('Failed to update pulse:', error);
    } finally {
      setLoadingPulse(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    fetchAndAnalyzeNews();

    // Fetch training data
    const qTr = query(
      collection(db, 'ceo_training'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubTr = onSnapshot(qTr, (snapshot) => {
      if (!snapshot.empty) setTraining(snapshot.docs[0].data());
    });

    // Fetch global pulse
    const qPulse = query(
      collection(db, 'global_insights'),
      orderBy('createdAt', 'desc'),
      limit(4)
    );

    const unsubPulse = onSnapshot(qPulse, (snapshot) => {
      const insights = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGlobalPulse(insights);
      setLoading(false);
    });

    return () => {
      unsubTr();
      unsubPulse();
    };
  }, [user]);

  return (
    <div className="flex-1 p-10 overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border-ui">
          <div>
            <div className="badge-paos mb-3 bg-amber-500/10 text-amber-500 border-amber-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full w-fit">CEO Training System</div>
            <h2 className="text-4xl font-bold text-white tracking-tight">Active Mastery</h2>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="border-border-ui bg-surface/50 text-text-secondary hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest gap-2">
              <Globe className="w-3 h-3" /> Market Pulse
            </Button>
            <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-[10px] font-bold uppercase tracking-widest px-6 shadow-lg shadow-amber-500/20">
              New Simulation
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Training Area */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {training ? (
                <motion.div
                  key={training.createdAt?.seconds}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Current Lesson */}
                  <Card className="bg-surface border-border-ui rounded-3xl overflow-hidden shadow-2xl border-l-4 border-l-amber-500">
                    <CardHeader className="p-8 pb-4">
                      <div className="flex items-center gap-3 text-amber-500 mb-2">
                        <BookOpen className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Active Lesson Component</span>
                      </div>
                      <CardTitle className="text-2xl font-bold text-white">
                        {training.concept || "Strategic Overview"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-6">
                      <p className="text-text-secondary leading-relaxed text-lg">
                        {training.content}
                      </p>
                      
                      {training.example && (
                        <div className="p-6 bg-background rounded-2xl border border-border-ui/50 italic text-text-primary/80">
                          <span className="block text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">Practical Example</span>
                          "{training.example}"
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Active Task */}
                  {training.task && (
                    <Card className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-8">
                      <div className="flex items-start gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shrink-0">
                          <Target className="w-6 h-6 text-black" />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Executive Task</span>
                          <h4 className="text-xl font-bold text-white leading-snug">{training.task}</h4>
                          <p className="text-sm text-text-secondary">Simulate this scenario using the Jay interface to submit your analysis.</p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Quiz Section */}
                  {training.quiz && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2 px-2">
                        <Brain className="w-4 h-4 text-amber-500" />
                        Deep Logic Quiz
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {training.quiz.map((q: any, i: number) => (
                          <Card key={i} className="bg-surface border-border-ui rounded-2xl p-6 hover:border-amber-500/30 transition-all cursor-pointer">
                            <p className="text-sm font-medium text-white mb-4">{q.question}</p>
                            <div className="space-y-2">
                              {q.options?.map((opt: string, oi: number) => (
                                <button key={oi} className="w-full text-left p-3 rounded-xl bg-background border border-border-ui/50 text-xs text-text-secondary hover:text-white hover:border-amber-500/50 transition-all">
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border-ui rounded-3xl">
                  <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-6">
                    <Briefcase className="w-8 h-8 text-text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Active Training</h3>
                  <p className="text-text-secondary max-w-sm mb-8">Initiate a CEO mentorship session with Jay to begin your strategic development program.</p>
                  <Button className="bg-amber-500 text-black font-bold px-8">Start Session</Button>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Executive Sidebar Context */}
          <div className="space-y-8">
            <Card className="bg-surface border-border-ui rounded-3xl overflow-hidden shadow-xl sticky top-8">
              <CardHeader className="p-6 border-b border-border-ui">
                <CardTitle className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[200px] w-full p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockTrends}>
                      <Area type="monotone" dataKey="value" stroke="#f59e0b" fill="#f59e0b20" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="px-6 pb-6 space-y-4">
                  {[
                    { label: 'Strategic Clarity', val: '86%', color: 'bg-emerald-500' },
                    { label: 'Financial Literacy', val: '72%', color: 'bg-amber-500' },
                    { label: 'Leadership Delta', val: '94%', color: 'bg-indigo-500' },
                  ].map((stat, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                        <span className="text-text-secondary">{stat.label}</span>
                        <span className="text-white">{stat.val}</span>
                      </div>
                      <div className="h-1 bg-background rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: stat.val }}
                          className={`h-full ${stat.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1E293B] border border-indigo-500/20 rounded-3xl p-6">
              <Quote className="w-8 h-8 text-indigo-500/20 mb-4" />
              <p className="text-sm italic text-indigo-100 font-serif leading-relaxed mb-6">
                "Leadership is not a rank, it's a responsibility. Every decision you make resonates through the entire system."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                </div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Protocol Verified</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Global Intelligence Pulse */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <Globe className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Global Intelligence Pulse</h3>
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Real-time CEO Strategy Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Sync: Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {loadingPulse ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="h-64 rounded-3xl bg-surface border border-border-ui animate-pulse" />
              ))
            ) : globalPulse.length === 0 ? (
              <div className="col-span-full py-12 text-center text-text-secondary border border-dashed border-border-ui rounded-3xl">
                Waiting for the next signal pulse...
              </div>
            ) : (
              globalPulse.map((insight, i) => (
                <motion.div
                  key={insight.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-surface border-border-ui rounded-3xl p-6 hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-all cursor-pointer group h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-indigo-paos uppercase tracking-widest bg-indigo-paos/10 px-2 py-0.5 rounded border border-indigo-paos/20">
                          {insight.source || 'Global Context'}
                        </span>
                        <Zap className="w-3 h-3 text-text-secondary group-hover:text-amber-500 transition-colors" />
                      </div>
                      <h4 className="text-sm font-bold text-white leading-relaxed group-hover:text-indigo-400 transition-colors">
                        {insight.title}
                      </h4>
                      <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                        {insight.summary}
                      </p>
                    </div>
                    
                    <div className="pt-6 border-t border-border-ui mt-6 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-500">
                        <ArrowUpRight className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-tighter">Opportunity: {insight.opportunity}</span>
                      </div>
                      <div className="flex items-center gap-2 text-rose-500">
                        <TrendingDown className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-tighter">Risk: {insight.risk}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
