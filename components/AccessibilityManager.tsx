import React, { useState, useEffect } from 'react';

interface AccessibilityManagerProps {
  positionClass?: string;
  buttonClass?: string;
}

const AccessibilityManager: React.FC<AccessibilityManagerProps> = ({ 
  positionClass = "fixed top-6 left-6", 
  buttonClass = "bg-white/20 hover:bg-white/30"
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showStatement, setShowStatement] = useState(false);
  const [activeA11y, setActiveA11y] = useState<Set<string>>(new Set());

  // Restore state on mount (optional, but good for persistence across screens)
  useEffect(() => {
    // Check existing classes on body to sync state
    const currentClasses = new Set<string>();
    document.body.classList.forEach(cls => {
      if (cls.startsWith('a11y-')) currentClasses.add(cls.replace('a11y-', ''));
    });
    // check html for text size
    if (document.documentElement.classList.contains('a11y-large-text')) currentClasses.add('large-text');
    if (document.documentElement.classList.contains('a11y-small-text')) currentClasses.add('small-text');
    
    setActiveA11y(currentClasses);
  }, []);

  const toggleA11yOption = (option: string, type: 'body' | 'html' = 'body') => {
    const newSet = new Set(activeA11y);
    const className = `a11y-${option}`;
    const element = type === 'html' ? document.documentElement : document.body;

    if (newSet.has(option)) {
      newSet.delete(option);
      element.classList.remove(className);
    } else {
      // Logic for mutually exclusive options
      if (option === 'large-text') {
        newSet.delete('small-text');
        document.documentElement.classList.remove('a11y-small-text');
      }
      if (option === 'small-text') {
        newSet.delete('large-text');
        document.documentElement.classList.remove('a11y-large-text');
      }

      newSet.add(option);
      element.classList.add(className);
    }
    setActiveA11y(newSet);
  };

  const resetA11y = () => {
    activeA11y.forEach(opt => {
      document.body.classList.remove(`a11y-${opt}`);
      document.documentElement.classList.remove(`a11y-${opt}`);
    });
    setActiveA11y(new Set());
  };

  const a11yOptions = [
    { id: 'large-text', label: 'הגדלת טקסט', icon: 'fa-plus', type: 'html' },
    { id: 'small-text', label: 'הקטנת טקסט', icon: 'fa-minus', type: 'html' },
    { id: 'grayscale', label: 'גווני אפור', icon: 'fa-adjust', type: 'body' },
    { id: 'high-contrast', label: 'ניגודיות גבוהה', icon: 'fa-sun', type: 'body' },
    { id: 'negative-contrast', label: 'ניגודיות הפוכה', icon: 'fa-moon', type: 'body' },
    { id: 'light-bg', label: 'רקע בהיר', icon: 'fa-paint-roller', type: 'body' },
    { id: 'highlight-links', label: 'הדגשת קישורים', icon: 'fa-link', type: 'body' },
    { id: 'readable-font', label: 'פונט קריא', icon: 'fa-font', type: 'body' },
    { id: 'big-cursor', label: 'סמן גדול', icon: 'fa-mouse-pointer', type: 'body' },
    { id: 'stop-animations', label: 'עצור אנימציות', icon: 'fa-pause-circle', type: 'body' },
  ];

  return (
    <>
      <div className={`${positionClass} z-[9999]`}>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className={`w-10 h-10 rounded-full backdrop-blur-md border border-white/30 transition-all flex items-center justify-center shadow-lg text-white ${buttonClass} ${showMenu ? 'ring-2 ring-purple-400' : ''}`}
            title="נגישות"
            aria-label="תפריט נגישות"
            aria-expanded={showMenu}
          >
            <i className="fas fa-universal-access text-lg"></i>
          </button>

          {showMenu && (
            <div className="absolute top-12 ltr:left-0 rtl:right-0 w-72 bg-white rounded-xl shadow-2xl p-4 border border-gray-200 fade-in-up text-gray-800 transform ltr:origin-top-left rtl:origin-top-right">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-bold text-lg">כלי נגישות</h3>
                <button onClick={resetA11y} className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded">
                  <i className="fas fa-redo ml-1"></i> איפוס
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                {a11yOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => toggleA11yOption(opt.id, opt.type as 'body' | 'html')}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg text-sm transition-all border ${
                      activeA11y.has(opt.id) 
                        ? 'bg-purple-600 text-white border-purple-600' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100'
                    }`}
                  >
                    <i className={`fas ${opt.icon} mb-2 text-lg`}></i>
                    <span className="text-xs text-center">{opt.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-2 border-t text-center">
                <button 
                  onClick={() => setShowStatement(true)}
                  className="text-purple-600 text-xs underline font-medium"
                >
                  הצהרת נגישות
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showStatement && (
        <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowStatement(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowStatement(false)} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600">
              <i className="fas fa-times text-xl"></i>
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">הצהרת נגישות</h2>
            <div className="h-64 overflow-y-auto text-gray-600 text-sm leading-relaxed space-y-3">
              <p>אנו ב-"אייבן" (Aivan) רואים חשיבות עליונה בהנגשת שירותינו לכלל האוכלוסייה.</p>
              <p>אתר זה נבנה בהתאם להוראות נגישות תכנים באינטרנט.</p>
              <ul className="list-disc list-inside space-y-1">
                <li>האתר מותאם לניווט באמצעות מקלדת.</li>
                <li>קיימת אפשרות לשינוי גודל טקסט וניגודיות צבעים.</li>
                <li>כפתור עצור אנימציות מפסיק הבהובים ותנועה.</li>
              </ul>
              <p>אם נתקלתם בבעיה, אנא פנו אלינו.</p>
            </div>
            <div className="mt-6 text-center">
              <button onClick={() => setShowStatement(false)} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold">סגור</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityManager;