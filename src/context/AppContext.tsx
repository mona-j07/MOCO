import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/firebase.ts';
import { onAuthStateChanged, User } from 'firebase/auth';
import { PAOSMode } from '../lib/gemini.ts';

interface AppContextType {
  user: User | null;
  loading: boolean;
  mode: PAOSMode;
  setMode: (mode: PAOSMode) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<PAOSMode>("PERSONAL");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AppContext.Provider value={{ user, loading, mode, setMode }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
