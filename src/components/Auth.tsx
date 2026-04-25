import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../lib/firebase.ts';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button } from './ui/button.tsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card.tsx';
import { LogIn } from 'lucide-react';
import { motion } from 'motion/react';

export default function Auth() {
  const { setGuestUser } = useApp();
  
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Store user in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0F172A] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md bg-[#1E293B] border-[#334155] text-[#E2E8F0]">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight text-white mb-2">moecho</CardTitle>
            <CardDescription className="text-[#94A3B8]">
              Personal AI Operating System
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6">
            <div className="w-24 h-24 rounded-3xl bg-indigo-600/20 flex items-center justify-center mb-8 border border-indigo-500/30">
              <LogIn className="w-10 h-10 text-indigo-400" />
            </div>
            <p className="text-center text-sm text-[#94A3B8] mb-8 max-w-[280px]">
              Unlock your second brain. Experience curated intelligence for your life's primary roles.
            </p>
            <Button 
              onClick={handleLogin} 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 text-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98] mb-4"
            >
              Initialize with Google
            </Button>
            <button 
              onClick={() => setGuestUser("Explorer")}
              className="text-sm text-[#94A3B8] hover:text-white transition-colors"
            >
              Or enter as Guest
            </button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
