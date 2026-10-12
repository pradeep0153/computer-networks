import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EXAMPLE_SCENARIOS } from '../data/exampleScenarios.js';
import { ArrowRight, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

export function ScenariosPage() {
  const navigate = useNavigate();

  const handleRun = (scenario) => {
    navigate('/diagnose', { state: { scenarioData: scenario.data } });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-network-50 text-network-700 text-xs font-semibold border border-network-200 mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Curated Academic Test Suite</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Example Diagnostic Scenarios
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore benchmark network configurations illustrating common errors, edge cases, and protocol interactions. Click "Load & Diagnose" to run any case through the real diagnostic engine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXAMPLE_SCENARIOS.map((scenario) => (
          <div
            key={scenario.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-network-400 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${scenario.badgeColor}`}>
                  {scenario.badge}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {scenario.data.ip}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">
                {scenario.title}
              </h3>

              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {scenario.description}
              </p>

              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                <div className="flex items-center space-x-1 text-network-700 font-semibold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Expected Diagnostic Findings:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  {scenario.expectedOutcome}
                </p>
              </div>

              {/* Parameters Preview */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                <div>Subnet: {scenario.data.mask}</div>
                <div>Gateway: {scenario.data.gateway || 'None'}</div>
                <div>DNS: {scenario.data.primaryDns || 'None'}</div>
                <div>Target: {scenario.data.destinationIp || scenario.data.destinationHostname || 'None'}</div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => handleRun(scenario)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-network-600 hover:bg-network-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
              >
                <span>Load & Diagnose</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
