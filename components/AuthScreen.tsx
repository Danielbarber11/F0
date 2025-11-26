
import React, { useState, useEffect, useRef } from 'react';
import AccessibilityManager from './AccessibilityManager';
import { User } from '../types';

// Declare global google object for TypeScript
declare global {
  interface Window {
    google: any;
  }
}

interface AuthScreenProps {
  onLogin: (user: User) => void;
  onSignup: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onSignup }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Google Sign-In Initialization
  useEffect(() => {
    // --- HELP FOR DEVELOPER ---
    // This logs the exact URL needed for Google Cloud Console
    console.log("%c--- הגדרת Google Auth ---", "color: blue; font-size: 14px; font-weight: bold;");
    console.log("עליך להעתיק את הכתובת הבאה ולהוסיף אותה ב-Authorized JavaScript origins:");
    console.log(`%c${window.location.origin}`, "color: green; font-size: 16px; font-weight: bold;");
    console.log("---------------------------");
    // --------------------------

    const initializeGoogle = () => {
      if (window.google && window.google.accounts && window.google.accounts.id && googleButtonRef.current) {
        
        // Initialize Google Identity Services
        window.google.accounts.id.initialize({
          client_id: "1029411846084-2jidcvnmiumb0ajqdm3fcot1rvmaldr6.apps.googleusercontent.com",
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Render the button
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          { 
            theme: "outline", 
            size: "large", 
            width: googleButtonRef.current.offsetWidth, // Match container width
            text: isSignup ? "signup_with" : "signin_with", 
            shape: "pill" 
          }
        );
      }
    };

    // Check if script is loaded, otherwise poll for it
    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else {
      const intervalId = setInterval(() => {
        if (window.google?.accounts?.id) {
          initializeGoogle();
          clearInterval(intervalId);
        }
      }, 500); // Check every 500ms
      return () => clearInterval(intervalId);
    }
  }, [isSignup]); // Re-render button if mode changes (signup/signin text)

  const handleGoogleCallback = (response: any) => {
    try {
      const jwt = response.credential;
      // Decode JWT Payload safely
      const base64Url = jwt.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      
      const googleUserEmail = payload.email;
      const googleUserName = payload.name;
      const googleUserPicture = payload.picture;

      // Check existing user in local storage
      const usersStr = localStorage.getItem('aivan_users');
      const users: User[] = usersStr ? JSON.parse(usersStr) : [];
      
      const existingUser = users.find(u => u.email === googleUserEmail);

      if (existingUser) {
        // User exists -> Login
        onLogin(existingUser);
      } else {
        // New user -> Register automatically
        const newUser: User = { 
          email: googleUserEmail, 
          name: googleUserName, 
          picture: googleUserPicture,
          hasAcceptedTerms: false 
        };
        const updatedUsers = [...users, newUser];
        localStorage.setItem('aivan_users', JSON.stringify(updatedUsers));
        onSignup(newUser);
      }

    } catch (e) {
      console.error("Google Auth Error", e);
      setError("שגיאה בהתחברות עם Google.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Simulate DB with localStorage
    const usersStr = localStorage.getItem('aivan_users');
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];

    if (isSignup) {
      // Check if user exists
      if (users.find(u => u.email === email)) {
        setError('משתמש זה כבר קיים במערכת.');
        return;
      }
      const newUser: User = { email, password, hasAcceptedTerms: false };
      const updatedUsers = [...users, newUser];
      localStorage.setItem('aivan_users', JSON.stringify(updatedUsers));
      onSignup(newUser);
    } else {
      // Check login
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('אימייל או סיסמה שגויים. אם אין לך חשבון, אנא הירשם.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center animate-gradient p-4 relative">
      {/* Accessibility Button - Top Right for Auth Screen */}
      <AccessibilityManager positionClass="fixed top-6 right-6" />

      <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/30 fade-in-up">
        <h1 className="text-5xl font-black text-white text-center mb-8 drop-shadow-md tracking-wide">
          AIVAN
        </h1>
        <h2 className="text-xl text-white text-center mb-6 font-light">
          {isSignup ? 'הרשמה לאייבן' : 'התחברות לאייבן'}
        </h2>
        
        {error && (
          <div className="bg-red-500/80 text-white text-center p-2 rounded-lg mb-4 text-sm font-medium">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white mb-2 text-sm font-medium">אימייל</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder-white/70 text-gray-900 transition-all"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-white mb-2 text-sm font-medium">סיסמה</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder-white/70 text-gray-900 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3.5 rounded-xl bg-white text-purple-600 font-bold text-lg shadow-lg hover:bg-gray-50 hover:scale-[1.02] transition-transform duration-200"
          >
            {isSignup ? 'צור חשבון' : 'התחבר'}
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
            <div className="absolute w-full border-t border-white/30"></div>
            <span className="relative bg-transparent px-3 text-white text-sm">או</span>
        </div>

        {/* Google Button Container using Ref */}
        <div ref={googleButtonRef} className="w-full flex justify-center h-[44px]"></div>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsSignup(!isSignup); setError(''); }}
            className="text-white hover:text-yellow-200 underline decoration-dotted underline-offset-4 text-sm font-medium transition-colors"
          >
            {isSignup ? 'כבר יש לך חשבון? התחבר' : 'אין לך חשבון? הירשם עכשיו'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
