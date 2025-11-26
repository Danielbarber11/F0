import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Role } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import AccessibilityManager from './AccessibilityManager';

interface WorkspaceProps {
  initialPrompt: string;
  initialLanguage: string;
  initialFiles: FileList | null;
  modelId: string;
  onBack: () => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ initialPrompt, initialLanguage, initialFiles, modelId, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with the user's first prompt
  useEffect(() => {
    const initChat = async () => {
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: Role.USER,
        text: `אני רוצה לבנות: ${initialPrompt}. שפה: ${initialLanguage}`,
        timestamp: Date.now(),
      };
      setMessages([userMsg]);
      setIsLoading(true);

      try {
        const responseText = await sendMessageToGemini(userMsg.text, [], initialFiles, modelId);
        
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: Role.MODEL,
          text: responseText,
          timestamp: Date.now(),
        };
        
        setMessages(prev => [...prev, botMsg]);
        extractCode(responseText);
      } catch (error) {
         setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: Role.MODEL,
          text: "אופס, נתקלתי בבעיה. נסה שוב.",
          timestamp: Date.now(),
          isError: true
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: Role.USER,
      text: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(input, messages, null, modelId);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: responseText,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, botMsg]);
      extractCode(responseText);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to extract code from markdown blocks
  const extractCode = (text: string) => {
    // Regex to find code blocks like ```html ... ``` or just ``` ... ```
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
    let match;
    let foundCode = '';
    
    // Concatenate all code blocks found
    while ((match = codeBlockRegex.exec(text)) !== null) {
      foundCode += match[1] + '\n\n';
    }

    if (foundCode) {
      setCode(foundCode);
      // Automatically switch to preview if it looks like HTML
      if (foundCode.includes('<html') || foundCode.includes('<!DOCTYPE') || foundCode.includes('<div')) {
         setActiveTab('preview');
      }
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    alert('הקוד הועתק ללוח!');
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden fade-in-up relative text-gray-900">
      
      {/* Left Side: Preview / Code (Main Display) */}
      <div className="flex-1 flex flex-col h-full border-l border-gray-200 bg-white shadow-lg z-0">
        {/* Toolbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center space-x-3 space-x-reverse">
            <AccessibilityManager 
              positionClass="relative" 
              buttonClass="bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 w-10 h-10 shadow-sm"
            />
            
            <div className="w-px h-6 bg-gray-300 mx-2"></div>

            <button 
              onClick={() => setActiveTab('preview')}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${activeTab === 'preview' ? 'bg-purple-600 text-white shadow-purple-200' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
            >
              <i className="fas fa-eye ml-2"></i>תצוגה מקדימה
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${activeTab === 'code' ? 'bg-purple-600 text-white shadow-purple-200' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
            >
              <i className="fas fa-code ml-2"></i>קוד
            </button>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
             <button onClick={handleCopy} className="text-gray-600 hover:text-purple-600 px-4 py-2 bg-white rounded-xl border border-gray-200 hover:border-purple-200 shadow-sm transition-all font-medium text-sm">
               <i className="fas fa-copy ml-1"></i> העתק
             </button>
             <button onClick={handleDownload} className="text-gray-600 hover:text-purple-600 px-4 py-2 bg-white rounded-xl border border-gray-200 hover:border-purple-200 shadow-sm transition-all font-medium text-sm">
               <i className="fas fa-download ml-1"></i> הורד
             </button>
             <div className="w-px h-6 bg-gray-300 mx-2"></div>
             <button onClick={onBack} className="w-10 h-10 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors">
               <i className="fas fa-times text-lg"></i>
             </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative bg-gray-50">
          {activeTab === 'preview' ? (
            code ? (
              <iframe 
                title="Preview"
                srcDoc={code}
                className="w-full h-full bg-white border-none"
                sandbox="allow-scripts" // Allow scripts for JS interaction
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <i className="fas fa-robot text-6xl mb-4 text-gray-200"></i>
                <p className="text-lg font-medium">אייבן חושב על הקוד המושלם עבורך...</p>
              </div>
            )
          ) : (
            <div className="h-full overflow-auto p-6 bg-white">
              <pre className="text-gray-800 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                {code || <span className="text-gray-400 italic">// ממתין לקוד...</span>}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Chat Bot (Aivan) */}
      <div className="w-96 flex flex-col bg-white border-r border-gray-200 z-20 shadow-xl">
        <div className="h-16 bg-white border-b border-gray-100 flex items-center px-4 shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full flex items-center justify-center text-white font-bold ml-3 shadow-md">
            A
          </div>
          <div>
            <h2 className="text-gray-800 font-bold text-lg">אייבן (Aivan)</h2>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full ml-1 animate-pulse"></span>
              <span className="text-xs text-gray-500">{modelId === 'gemini-3-pro-preview' ? 'Pro Model' : 'Flash Model'}</span>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50 scroll-smooth">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex w-full ${msg.role === Role.USER ? 'justify-start' : 'justify-end'}`}
            >
              <div 
                className={`max-w-[90%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === Role.USER 
                    ? 'bg-white text-gray-800 border border-gray-200 rounded-tr-none' 
                    : 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-tl-none shadow-md'
                }`}
              >
                 <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex justify-end w-full">
               <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl px-4 py-3 rounded-tl-none shadow-md flex items-center space-x-2 space-x-reverse">
                 <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce"></div>
                 <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce delay-75"></div>
                 <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce delay-150"></div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="relative group">
             <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="בקש תיקון או שינוי..."
              className="w-full bg-gray-50 text-gray-800 pl-4 pr-12 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all placeholder-gray-400 shadow-inner"
            />
            <button 
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-purple-600 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <i className="fas fa-paper-plane text-lg"></i>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Workspace;