import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/firebase.ts';
import { onAuthStateChanged, User } from 'firebase/auth';
import { PAOSMode } from '../lib/gemini.ts';

interface AppContextType {
  user: any | null;
  loading: boolean;
  mode: PAOSMode;
  setMode: (mode: PAOSMode) => void;
  setGuestUser: (name: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<PAOSMode>("PERSONAL");

  const setGuestUser = (name: string) => {
    setUser({
      uid: 'guest-' + Date.now(),
      displayName: name,
      email: 'guest@moecho.local',
      isGuest: true
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AppContext.Provider value={{ user, loading, mode, setMode, setGuestUser }}>
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
