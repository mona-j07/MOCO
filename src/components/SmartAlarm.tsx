import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog.tsx';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';
import { 
  AlarmClock, 
  Quote, 
  Puzzle, 
  Brain, 
  CheckCircle2,
  BellRing
} from 'lucide-react';
import { Card, CardContent } from './ui/card.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface SmartAlarmProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SmartAlarm({ isOpen, onClose }: SmartAlarmProps) {
  const [alarmTime, setAlarmTime] = useState('06:00');
  const [isActive, setIsActive] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [puzzleAnswer, setPuzzleAnswer] = useState('');
  const [puzzle, setPuzzle] = useState({ q: '57 + 38 = ?', a: '95' });

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const current = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      if (current === alarmTime) {
        setIsRinging(true);
        setIsActive(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, alarmTime]);

  useEffect(() => {
    let audioContext: AudioContext | null = null;
    let intervalId: any;

    if (isRinging) {
      // Initialize AudioContext
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playBeep = () => {
        if (!audioContext) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
      };

      intervalId = setInterval(playBeep, 1000);
      playBeep();
    } else {
      if (intervalId) clearInterval(intervalId);
      if (audioContext) audioContext.close();
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (audioContext) audioContext.close();
    };
  }, [isRinging]);

  const handleDismiss = () => {
    if (puzzleAnswer === puzzle.a) {
      setIsRinging(false);
      setPuzzleAnswer('');
      toast.success("Good morning! System fully operational.");
    } else {
      toast.error("Incorrect answer. Stay alert.");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-white rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlarmClock className="w-5 h-5 text-indigo-400" />
              Smart Wake-Up
            </DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              Solve the intelligence puzzle to dismiss the alarm.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            <div className="flex flex-col items-center">
              <input
                type="time"
                value={alarmTime}
                onChange={(e) => setAlarmTime(e.target.value)}
                className="bg-transparent text-6xl font-mono font-bold text-white focus:outline-none border-b-2 border-[#334155] focus:border-indigo-500 w-full text-center"
              />
            </div>

            <Button 
              onClick={() => {
                setIsActive(!isActive);
                if (!isActive) toast.info(`Alarm set for ${alarmTime}`);
              }}
              className={`w-full py-6 rounded-2xl font-bold uppercase tracking-widest transition-all ${
                isActive ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              {isActive ? 'Deactivate System' : 'Set Active'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {isRinging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0F172A] flex flex-col items-center justify-center p-8"
          >
            <div className="absolute inset-0 overflow-hidden opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-rose-500 animate-pulse" />
            </div>

            <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mb-8 animate-bounce">
                <BellRing className="w-12 h-12 text-white" />
              </div>

              <div className="mb-12">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400 mb-4">WAKE UP PROTOCOL ACTIVE</p>
                <div className="text-8xl font-mono font-black text-white mb-8 tracking-tighter">{alarmTime}</div>
                
                <Card className="bg-[#1E293B] border-[#334155] text-left">
                  <CardContent className="p-6">
                    <Quote className="w-6 h-6 text-[#475569] mb-4" />
                    <p className="text-lg font-serif italic text-white leading-relaxed">
                      "You do not need more time—you need more intent."
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="w-full space-y-4">
                <div className="flex items-center gap-3 text-[#94A3B8] mb-4 px-2">
                  <Puzzle className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-widest">Logic Challenge</span>
                </div>
                
                <div className="text-3xl font-mono font-bold text-white mb-6 underline decoration-indigo-500 underline-offset-8">
                  {puzzle.q}
                </div>

                <Input 
                  placeholder="Enter response..."
                  value={puzzleAnswer}
                  onChange={(e) => setPuzzleAnswer(e.target.value)}
                  className="bg-[#1E293B] border-[#334155] text-white py-8 text-center text-2xl font-mono rounded-2xl focus:ring-indigo-500 mb-6"
                />

                <Button 
                  onClick={handleDismiss}
                  className="w-full py-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-xl font-bold uppercase tracking-widest shadow-2xl shadow-indigo-500/20"
                >
                  Confirm Intelligence
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
