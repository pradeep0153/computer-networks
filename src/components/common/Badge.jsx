import React from 'react';

export function SeverityBadge({ severity, size = 'sm' }) {
  const styles = {
    Critical: 'bg-rose-100 text-rose-800 border-rose-300',
    High: 'bg-orange-100 text-orange-800 border-orange-300',
    Medium: 'bg-amber-100 text-amber-800 border-amber-300',
    Low: 'bg-blue-100 text-blue-800 border-blue-300',
    Informational: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  };

  const currentStyle = styles[severity] || 'bg-slate-100 text-slate-800 border-slate-300';
  const sizeClasses = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${currentStyle} ${sizeClasses}`}
      role="status"
    >
      <span
        className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
          severity === 'Critical'
            ? 'bg-rose-500'
            : severity === 'High'
            ? 'bg-orange-500'
            : severity === 'Medium'
            ? 'bg-amber-500'
            : severity === 'Low'
            ? 'bg-blue-500'
            : 'bg-emerald-500'
        }`}
      />
      {severity}
    </span>
  );
}

export function BasisBadge({ basis }) {
  const config = {
    'Configuration analysis': {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      label: 'Config Analysis',
      tooltip: 'Derived strictly from IPv4 syntax & subnet mathematics',
    },
    'User observation': {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      label: 'User Observation',
      tooltip: 'Based on connectivity results provided by the user',
    },
    'Simulated test': {
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      label: 'Simulated Scenario',
      tooltip: 'Predefined benchmark scenario data',
    },
    'Actual test': {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: 'Live Socket Test',
      tooltip: 'Direct operating system network test result',
    },
  };

  const item = config[basis] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    label: basis || 'Unknown',
    tooltip: '',
  };

  return (
    <span
      title={item.tooltip}
      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded border ${item.bg}`}
    >
      {item.label}
    </span>
  );
}
