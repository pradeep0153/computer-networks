import React from 'react';
import { Modal } from '../common/Modal.jsx';
import { EXAMPLE_SCENARIOS } from '../../data/exampleScenarios.js';
import { ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

export function ScenarioPickerModal({ isOpen, onClose, onSelectScenario }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Built-In Network Scenario" maxWidth="max-w-3xl">
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          Choose from standard lab scenarios to test IPv4 addressing, non-contiguous subnet masks, off-subnet gateways, decoupled DNS issues, or point-to-point links. Selecting a scenario loads its configuration and observations directly into the diagnostic engine.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {EXAMPLE_SCENARIOS.map((scenario) => (
            <div
              key={scenario.id}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:border-network-400 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
              onClick={() => {
                onSelectScenario(scenario);
                onClose();
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${scenario.badgeColor}`}>
                    {scenario.badge}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {scenario.data.ip}/{scenario.data.mask}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-network-600 transition-colors">
                  {scenario.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                  {scenario.description}
                </p>

                <div className="mt-3 p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700">Expected Outcome: </span>
                  {scenario.expectedOutcome}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-network-600 group-hover:text-network-700">
                <span>Load into Form & Run Engine</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
