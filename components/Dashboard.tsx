import React, { useState, useRef } from 'react';
import { ProjectConfig } from '../types';
import AccessibilityManager from './AccessibilityManager';

interface DashboardProps {
  onStartProject: (config: ProjectConfig) => void;
  history: string[];
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartProject, history, onLogout }) => {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('HTML/CSS/JS');
  const [model, setModel] = useState('gemini-2.5-flash'); // Default model
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const handleSend = () => {
    if (!prompt.trim()) return;
    onStartProject({ prompt, language, model, files: selectedFiles });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center animate-gradient p-4 relative">
      
      {/* Top Right Controls - Fixed to stay visible */}
      <div className="fixed top-6 right-6 flex items-center gap-3 z-50">
        
        {/* Accessibility Button - Using Component */}
        <AccessibilityManager positionClass="relative" buttonClass="bg-white/20 hover:bg-white/30" />

        {/* Logout Button */}
        <button 
          onClick={onLogout}
          className="group flex items-center justify-center w-10 h-10 bg-red-500 hover:w-32 rounded-full text-white shadow-lg transition-all duration-300 overflow-hidden relative"
        >
          <div className="absolute right-3 flex items-center justify-center">
            <i className="fas fa-sign-out-alt text-lg"></i>
          </div>
          <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap mr-6 pr-2 font-bold text-sm transition-opacity duration-300 delay-75">
            התנתק
          </span>
        </button>
      </div>

      {/* Header */}
      <header className="w-full max-w-6xl flex justify-center py-8 fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="text-center">
          <h1 className="text-7xl font-black text-white drop-shadow-lg tracking-wide">AIVAN</h1>
          <p className="text-white/90 mt-2 text-xl font-light">המומחה שלך לבניית קוד</p>
        </div>
      </header>

      {/* Main Input Area */}
      <div className="w-full max-w-3xl mt-10 fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl p-2 border border-white/30 relative">
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="מה תרצה לבנות היום? (לדוגמה: דף נחיתה למספרה עם גלריה)"
            className="w-full h-32 bg-transparent text-white placeholder-white/70 p-4 text-lg resize-none focus:outline-none"
          />

          <div className="flex flex-wrap justify-between items-center px-4 pb-2 mt-2 gap-2">
            <div className="flex gap-2 flex-wrap">
               {/* File Upload Button */}
               <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors relative group"
                title="הוסף קובץ או תמונה"
              >
                <i className="fas fa-paperclip text-xl"></i>
                {selectedFiles && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-bounce">
                    {selectedFiles.length}
                  </span>
                )}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                multiple
                accept="image/*, .txt, .js, .html, .css, .json"
              />

              {/* Language Selector */}
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:bg-white/20 cursor-pointer"
              >
                <option value="HTML/CSS/JS" className="text-gray-800">HTML/Web</option>
                <option value="Python" className="text-gray-800">Python</option>
                <option value="React" className="text-gray-800">React</option>
                <option value="NodeJS" className="text-gray-800">Node.js</option>
              </select>

              {/* Model Selector */}
              <select 
                value={model} 
                onChange={(e) => setModel(e.target.value)}
                className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:bg-white/20 cursor-pointer"
                title="בחר מודל AI"
              >
                <option value="gemini-2.5-flash" className="text-gray-800">⚡ Aivan Flash (מהיר)</option>
                <option value="gemini-3-pro-preview" className="text-gray-800">🧠 Aivan Pro (חכם)</option>
              </select>
            </div>

            {/* Send Button */}
            <button 
              onClick={handleSend}
              disabled={!prompt.trim()}
              className="bg-white text-purple-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 disabled:opacity-50 disabled:scale-100 transition-all duration-300"
            >
              <i className="fas fa-paper-plane text-xl transform translate-x-[-2px] translate-y-[2px]"></i>
            </button>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="w-full max-w-3xl mt-12 fade-in-up" style={{ animationDelay: '0.4s' }}>
        <h3 className="text-white font-bold text-lg mb-4 px-2 opacity-90">היסטוריה אחרונה</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.length === 0 ? (
            <div className="text-white/50 text-center col-span-2 py-8">אין היסטוריה עדיין. התחל ליצור!</div>
          ) : (
            history.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => onStartProject({ prompt: item, language: 'HTML/CSS/JS', model: model })}
                className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 text-white hover:bg-white/20 hover:scale-[1.02] transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <div className="flex items-center justify-between">
                  <p className="truncate w-full font-medium">{item}</p>
                  <i className="fas fa-arrow-left opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </div>
                <div className="text-xs text-white/60 mt-2">לחץ לשחזור שיחה</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;