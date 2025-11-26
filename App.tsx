import React, { useState } from 'react';
import AuthScreen from './components/AuthScreen';
import TermsScreen from './components/TermsScreen';
import Dashboard from './components/Dashboard';
import Workspace from './components/Workspace';
import { Screen, ProjectConfig, User } from './types';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.AUTH);
  const [projectConfig, setProjectConfig] = useState<ProjectConfig | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Handle successful login/signup
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.hasAcceptedTerms) {
      setCurrentScreen(Screen.HOME);
    } else {
      setCurrentScreen(Screen.TERMS);
    }
  };

  const handleTermsAccepted = () => {
    if (!currentUser) return;

    // Update user in local state and local storage
    const updatedUser = { ...currentUser, hasAcceptedTerms: true };
    setCurrentUser(updatedUser);
    
    // Update in DB (localStorage)
    const usersStr = localStorage.getItem('aivan_users');
    if (usersStr) {
      const users: User[] = JSON.parse(usersStr);
      const updatedUsers = users.map(u => u.email === currentUser.email ? updatedUser : u);
      localStorage.setItem('aivan_users', JSON.stringify(updatedUsers));
    }

    setCurrentScreen(Screen.HOME);
  };

  const handleStartProject = (config: ProjectConfig) => {
    setProjectConfig(config);
    // Avoid duplicates at the start of history
    setHistory(prev => {
        const newHistory = [config.prompt, ...prev.filter(p => p !== config.prompt)];
        return newHistory.slice(0, 5);
    }); 
    setCurrentScreen(Screen.WORKSPACE);
  };

  const handleBackToDashboard = () => {
    setProjectConfig(null);
    setCurrentScreen(Screen.HOME);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setProjectConfig(null);
    setCurrentScreen(Screen.AUTH);
  };

  return (
    <>
      {currentScreen === Screen.AUTH && (
        <AuthScreen 
          onLogin={handleAuthSuccess} 
          onSignup={handleAuthSuccess} 
        />
      )}
      
      {currentScreen === Screen.TERMS && (
        <TermsScreen 
          onAccept={handleTermsAccepted} 
        />
      )}

      {currentScreen === Screen.HOME && (
        <Dashboard 
          onStartProject={handleStartProject} 
          history={history}
          onLogout={handleLogout}
        />
      )}

      {currentScreen === Screen.WORKSPACE && projectConfig && (
        <Workspace 
          initialPrompt={projectConfig.prompt}
          initialLanguage={projectConfig.language}
          initialFiles={projectConfig.files || null}
          modelId={projectConfig.model}
          onBack={handleBackToDashboard}
        />
      )}
    </>
  );
};

export default App;