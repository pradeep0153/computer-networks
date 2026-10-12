import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Stethoscope,
  History,
  FileQuestion,
  Info,
  Network,
  Cpu,
  Layers,
} from 'lucide-react';

export function Sidebar({ isOpen, onClose }) {
  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Metrics & Quick Overview',
    },
    {
      to: '/diagnose',
      label: 'New Diagnosis',
      icon: Stethoscope,
      description: 'Analyze Host Configuration',
    },
    {
      to: '/history',
      label: 'Diagnosis History',
      icon: History,
      description: 'Past Reports & Logs',
    },
    {
      to: '/scenarios',
      label: 'Example Scenarios',
      icon: FileQuestion,
      description: 'Preconfigured Test Cases',
    },
    {
      to: '/about',
      label: 'About & Limitations',
      icon: Info,
      description: 'Concepts & Academic Scope',
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm md:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Main Navigation */}
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Troubleshooting Tools
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      if (window.innerWidth < 768) onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-start space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-network-600 text-white shadow-sm shadow-network-900/50'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <div className="leading-snug">{item.label}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{item.description}</div>
                    </div>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Educational Quick Reference Box */}
          <div className="p-3.5 rounded-xl bg-slate-850/90 border border-slate-700/60 text-xs">
            <div className="flex items-center space-x-2 text-network-400 font-semibold mb-1.5">
              <Layers className="w-4 h-4" />
              <span>OSI Layer Model</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Diagnostic rules systematically evaluate Layer 1 (Link), Layer 2 (ARP/MAC), Layer 3 (IP/Subnet/Gateway), Layer 4 (Ports), and Layer 7 (DNS/HTTP).
            </p>
          </div>
        </div>

        {/* Bottom System Info */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-network-400" />
              <span>Local Engine</span>
            </span>
            <span className="font-mono text-network-300 bg-network-950 px-1.5 py-0.5 rounded border border-network-800">
              v1.0.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
