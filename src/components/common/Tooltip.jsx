import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

export function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="cursor-help inline-flex items-center"
      >
        {children || <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 ml-1 inline" />}
      </div>
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-40 px-2.5 py-1.5 text-xs font-normal text-white bg-slate-900 rounded-md shadow-lg pointer-events-none whitespace-normal max-w-xs text-center border border-slate-700">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}
