import { useState, useRef, useEffect, FormEvent } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Mic, Send, X, MessageSquare, Loader2 } from 'lucide-react';
import { processInput, AIResponse } from '../lib/gemini.ts';
import { db } from '../lib/firebase.ts';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button.tsx';
import { ScrollArea } from './ui/scroll-area.tsx';
import { toast } from 'sonner';

export default function ChatInterface() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string; data?: AIResponse }[]>([]);
  const { mode, user } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userText = input;
    const startTime = Date.now();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsProcessing(true);

    try {
      const aiResponse = await processInput(userText, mode, user?.displayName || undefined);
      const textToShow = aiResponse.content || aiResponse.improved || (aiResponse as any).improvedText || "Processed.";
      
      // Ensure minimum loading time of 1s to prevent flickering
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - elapsedTime));
      }

      setMessages(prev => [...prev, { role: 'ai', text: textToShow, data: aiResponse }]);

      // PERSISTENCE LOGIC (keep existing logic)
      if (mode === 'AUTHOR') {
        await addDoc(collection(db, 'writing'), {
          userId: user?.uid,
          transcript: aiResponse.transcript || userText,
          originalText: aiResponse.original || userText,
          improvedText: aiResponse.improved || aiResponse.content,
          createdAt: serverTimestamp(),
        });
      }

      if (mode === 'PERSONAL') {
        await addDoc(collection(db, 'moods'), {
          userId: user?.uid,
          text: userText,
          aiResponse: textToShow,
          createdAt: serverTimestamp(),
        });
      }

      if (mode === 'FINANCE' && aiResponse.financeData) {
        await addDoc(collection(db, 'transactions'), {
          userId: user?.uid,
          ...aiResponse.financeData,
          createdAt: serverTimestamp(),
        });
        toast.info(`Logged ${aiResponse.financeData.type}: ₹${aiResponse.financeData.amount}`);
      }

      if (mode === 'CEO') {
        await addDoc(collection(db, 'ceo_training'), {
          userId: user?.uid,
          content: aiResponse.content,
          concept: aiResponse.concept || null,
          example: aiResponse.example || null,
          task: aiResponse.task || null,
          quiz: aiResponse.quiz || null,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to process your request");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    if (!isListening) {
      recognition.start();
      setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Auto-submit after small delay
        setTimeout(() => {
          document.getElementById('chat-submit-btn')?.click();
        }, 300);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-[400px] h-[550px] bg-surface border border-border-ui rounded-3xl shadow-2xl flex flex-col mb-6 overflow-hidden"
          >
            <div className="p-4 border-b border-border-ui flex items-center justify-between bg-indigo-paos/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-paos flex items-center justify-center">
                  <span className="text-white font-bold text-xs">J</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">Jay</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_4px_#10b981]" />
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">{mode} Mode</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-text-secondary hover:text-white hover:bg-surface">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4 h-full" ref={scrollRef}>
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="h-[400px] flex flex-col items-center justify-center text-center px-8 opacity-30">
                    <div className="w-16 h-16 rounded-full bg-surface border border-border-ui flex items-center justify-center mb-4">
                      <MessageSquare className="w-8 h-8 text-text-secondary" />
                    </div>
                    <p className="text-xs font-medium text-text-secondary tracking-wide italic">
                      "Yeah, go ahead..."
                    </p>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm space-y-3 ${
                      m.role === 'user' 
                        ? 'bg-indigo-paos text-white rounded-tr-none' 
                        : 'bg-background text-text-primary rounded-tl-none border border-border-ui'
                    }`}>
                      <div>{m.text}</div>
                      
                      {m.role === 'ai' && m.data && (
                        <div className="space-y-3 pt-2">
                          {/* Finance Data */}
                          {m.data.financeData && (
                            <div className="p-3 bg-surface border border-emerald-500/20 rounded-xl space-y-1">
                              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                                <span>{m.data.financeData.type} Recorded</span>
                                <span>₹{m.data.financeData.amount}</span>
                              </div>
                              <div className="text-xs text-text-secondary">
                                {m.data.financeData.category} • {m.data.financeData.note}
                              </div>
                            </div>
                          )}

                          {/* Writing Studio */}
                          {m.data.improved && (
                            <div className="p-3 bg-indigo-paos/10 border border-indigo-paos/20 rounded-xl space-y-2">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-paos">Refined Thought</div>
                              <div className="text-xs italic text-text-primary leading-relaxed">
                                "{m.data.improved}"
                              </div>
                            </div>
                          )}

                          {/* CEO Training */}
                          {(m.data.concept || m.data.task) && (
                            <div className="space-y-2">
                              {m.data.concept && (
                                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-1">Executive Concept</div>
                                  <div className="text-xs font-bold text-white mb-1">{m.data.concept}</div>
                                  {m.data.example && <div className="text-[10px] text-text-secondary">Ex: {m.data.example}</div>}
                                </div>
                              )}
                              {m.data.task && (
                                <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mb-1">Strategic Task</div>
                                  <div className="text-xs text-text-primary">{m.data.task}</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-background text-text-primary px-4 py-2.5 rounded-2xl rounded-tl-none border border-border-ui flex items-center gap-2">
                      <span className="text-xs text-text-secondary italic">Got it...</span>
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-paos" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 bg-background/50 border-t border-border-ui">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    placeholder={isListening ? "Jay is listening..." : "Speak or type..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full bg-surface border border-border-ui text-white rounded-2xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-paos/50 text-sm placeholder:text-text-secondary/50 transition-all shadow-inner"
                  />
                  <button 
                    type="button"
                    onClick={toggleListening}
                    className={`absolute right-2 top-1.5 p-1.5 rounded-xl transition-all ${
                      isListening ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/20' : 'text-text-secondary hover:text-white hover:bg-surface'
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
                <Button id="chat-submit-btn" type="submit" size="icon" className="h-11 w-11 rounded-2xl bg-indigo-paos hover:bg-indigo-paos/90 text-white shadow-lg shadow-indigo-paos/20">
                  <Send className="w-4 h-4 shadow-sm" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-3xl bg-indigo-paos shadow-[0_8px_30px_rgba(99,102,241,0.4)] flex items-center justify-center text-white relative group border-4 border-background"
      >
        <MessageSquare className="w-7 h-7 group-hover:hidden" />
        <Mic className="w-7 h-7 hidden group-hover:block" />
        {isListening && (
          <span className="absolute inset-0 rounded-3xl bg-white/20 animate-ping" />
        )}
      </motion.button>
    </div>
  );
}
