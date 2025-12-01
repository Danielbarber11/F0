import React, { useEffect, useState } from 'react';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Profile from './components/Profile';
import ActivityRecorder from './components/ActivityRecorder';
import { supabase } from './services/supabase';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [view, setView] = useState<'signin' | 'signup' | 'app'>('signin');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) setView('app');
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setView('app');
      else setView('signin');
    });

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <h1>F0 — Demo with Supabase</h1>

      {!session && view === 'signin' && (
        <div>
          <SignIn />
          <p>
            אין לך חשבון? <button onClick={() => setView('signup')}>הרשם</button>
          </p>
        </div>
      )}

      {!session && view === 'signup' && (
        <div>
          <SignUp />
          <p>
            יש לך חשבון? <button onClick={() => setView('signin')}>התחבר</button>
          </p>
        </div>
      )}

      {session && (
        <div>
          <button onClick={() => supabase.auth.signOut()}>התנתק</button>
          <Profile session={session} />
          <ActivityRecorder session={session} />
        </div>
      )}
    </div>
  );
}