import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-6 px-4 sm:px-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-network-600" />
          <span>
            <strong className="text-slate-700">NetPulse</strong> — Academic Computer Networks Troubleshooting Project.
          </span>
        </div>

        <div className="flex items-center space-x-6">
          <span className="text-slate-400">
            Privacy notice: All diagnosis inputs and history are stored locally in your browser (localStorage).
          </span>
          <Link to="/about" className="text-network-600 hover:text-network-700 font-medium inline-flex items-center space-x-1">
            <Info className="w-3.5 h-3.5" />
            <span>Scope & Limitations</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
