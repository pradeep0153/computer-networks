import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Menu, X, PlusCircle, ShieldCheck } from 'lucide-react';

export function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-network-600 to-network-400 flex items-center justify-center shadow-md shadow-network-900/30 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">NetPulse</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-network-900/80 text-network-300 border border-network-700/50">
                  Assistant
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Network Connectivity Troubleshooting</p>
            </div>
          </Link>
        </div>

        {/* Diagnostic Engine Status Tag & Quick Action */}
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Deterministic RFC Rule Engine</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <Link
            to="/diagnose"
            className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-network-600 hover:bg-network-500 text-white shadow-sm transition-all hover:shadow-network-600/25 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Diagnosis</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
