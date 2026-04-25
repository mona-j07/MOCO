import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { db } from '../lib/firebase.ts';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.tsx';
import { Button } from './ui/button.tsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs.tsx';
import { ScrollArea } from './ui/scroll-area.tsx';
import { PenTool, Library, Sparkles, History } from 'lucide-react';
import { motion } from 'motion/react';

export default function WritingStudio() {
  const { user } = useApp();
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'writing'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEntries(data);
      if (data.length > 0 && !selectedEntry) {
        setSelectedEntry(data[0]);
      }
    });
  }, [user]);

  return (
    <div className="flex-1 flex overflow-hidden bg-background">
      {/* Entries List */}
      <aside className="w-80 bg-surface/30 border-r border-border-ui flex flex-col">
        <div className="p-6 border-b border-border-ui flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary flex items-center gap-2">
            <Library className="w-4 h-4 text-indigo-paos" />
            Library
          </h3>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-paos hover:bg-indigo-paos/10">
            <PenTool className="w-4 h-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {entries.length > 0 ? entries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className={`w-full text-left p-4 rounded-xl transition-all border ${
                  selectedEntry?.id === entry.id 
                    ? 'bg-surface border-indigo-paos/50 shadow-lg' 
                    : 'border-transparent hover:bg-surface/50 hover:border-border-ui/50'
                }`}
              >
                <p className="text-xs font-bold text-text-primary mb-1 truncate">{entry.text}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[9px] text-text-secondary flex items-center gap-1 font-mono uppercase tracking-tighter">
                    <History className="w-3 h-3" />
                    {new Date(entry.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}
                  </p>
                  <span className="text-[8px] bg-indigo-paos/10 text-indigo-paos px-1.5 py-0.5 rounded uppercase font-bold">Draft</span>
                </div>
              </button>
            )) : (
              <div className="p-8 text-center opacity-20">
                <p className="text-xs italic">No entries found.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Workspace */}
      <main className="flex-1 bg-background p-10 overflow-y-auto">
        {selectedEntry ? (
          <motion.div
            key={selectedEntry.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="mb-10 flex items-center justify-between border-b border-border-ui pb-8">
              <div>
                <p className="badge-paos mb-3">Author Mode Active</p>
                <h2 className="text-3xl font-bold text-white tracking-tight leading-none">Draft Optimization</h2>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="border-border-ui bg-surface/50 text-text-secondary hover:text-white rounded-xl">
                  Export PDF
                </Button>
                <Button className="bg-indigo-paos hover:bg-indigo-paos/90 text-white rounded-xl gap-2 shadow-lg shadow-indigo-paos/20">
                  <Sparkles className="w-4 h-4" />
                  AI Refinement
                </Button>
              </div>
            </div>

            <Tabs defaultValue="improved" className="space-y-8">
              <TabsList className="bg-surface p-1 border border-border-ui rounded-2xl w-fit">
                <TabsTrigger value="improved" className="px-6 rounded-xl data-[state=active]:bg-indigo-paos data-[state=active]:text-white transition-all text-xs font-bold uppercase tracking-widest">Polished Version</TabsTrigger>
                <TabsTrigger value="original" className="px-6 rounded-xl data-[state=active]:bg-indigo-paos data-[state=active]:text-white transition-all text-xs font-bold uppercase tracking-widest">Raw Input</TabsTrigger>
              </TabsList>
              
              <TabsContent value="improved">
                <Card className="bg-surface border-border-ui rounded-3xl overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]">
                  <CardContent className="p-12">
                    <div className="prose prose-invert max-w-none">
                      <p className="text-xl leading-relaxed text-text-primary font-serif italic selection:bg-indigo-paos/30">
                        {selectedEntry.aiResponse || "Your AI system is processing the structural integrity and flow of your input..."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="original">
                <Card className="bg-surface/50 border-border-ui border-dashed rounded-3xl">
                  <CardContent className="p-10">
                    <div className="flex items-center gap-2 mb-6 text-text-secondary">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-paos" />
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Source Transcript Captured</span>
                    </div>
                    <p className="font-mono text-text-secondary text-sm leading-8 selection:bg-indigo-paos/30">
                      {selectedEntry.text}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-text-primary flex items-center justify-center mb-6">
              <PenTool className="w-10 h-10" />
            </div>
            <p className="text-lg font-bold tracking-widest uppercase">System idle. Initiate writing session.</p>
          </div>
        )}
      </main>
    </div>

  );
}
