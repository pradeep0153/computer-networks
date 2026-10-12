import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NetworkConfigForm } from '../components/forms/NetworkConfigForm.jsx';
import { DiagnosticWorkflow } from '../components/diagnosis/DiagnosticWorkflow.jsx';
import { ScenarioPickerModal } from '../components/forms/ScenarioPickerModal.jsx';
import { runDiagnosis } from '../utils/diagnosisEngine.js';
import { saveDiagnosis } from '../utils/storage.js';
import { Toast } from '../components/common/Toast.jsx';
import {
  Sparkles,
  Layers,
  Wrench,
  CheckCircle2,
  FileText,
  HelpCircle,
} from 'lucide-react';

export function NewDiagnosis() {
  const location = useLocation();
  const navigate = useNavigate();

  // If passed scenarioData or editData from another page
  const initialData = location.state?.scenarioData || location.state?.editConfig || {};

  const [mode, setMode] = useState('form'); // 'form' | 'wizard'
  const [formData, setFormData] = useState({
    deviceName: initialData.deviceName || '',
    ip: initialData.ip || '',
    mask: initialData.mask || '255.255.255.0',
    gateway: initialData.gateway || '',
    primaryDns: initialData.primaryDns || '',
    secondaryDns: initialData.secondaryDns || '',
    destinationIp: initialData.destinationIp || '',
    destinationHostname: initialData.destinationHostname || '',
    observations: {
      canReachGateway: initialData.observations?.canReachGateway || 'untested',
      canReachExternalIp: initialData.observations?.canReachExternalIp || 'untested',
      canResolveDomain: initialData.observations?.canResolveDomain || 'untested',
      canAccessWeb: initialData.observations?.canAccessWeb || 'untested',
    },
    sourceMode: initialData.sourceMode || 'Configuration analysis',
  });

  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const handleSelectScenario = (scenario) => {
    setFormData(scenario.data);
    setToastMessage(`Loaded: ${scenario.title}`);
  };

  const handleRunDiagnosis = (dataToRun) => {
    const finalData = dataToRun || formData;
    const diagnosis = runDiagnosis(finalData);

    // Save to localStorage history
    saveDiagnosis(diagnosis);

    // Navigate to results
    navigate('/results', { state: { diagnosis } });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Network Connectivity Diagnosis
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provide network interface parameters and connectivity observations to isolate misconfigurations.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center space-x-2 bg-slate-200/80 p-1 rounded-xl border border-slate-300/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('form')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              mode === 'form'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Direct Form Mode
          </button>
          <button
            type="button"
            onClick={() => setMode('wizard')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              mode === 'wizard'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Guided 6-Stage Wizard
          </button>
        </div>
      </div>

      {/* Main Content: Form or Wizard */}
      {mode === 'form' ? (
        <NetworkConfigForm
          key={JSON.stringify(formData)} // re-render when scenario loaded
          initialData={formData}
          onSubmit={handleRunDiagnosis}
          onLoadScenarioClick={() => setIsScenarioModalOpen(true)}
        />
      ) : (
        <DiagnosticWorkflow
          formData={formData}
          onUpdateFormData={setFormData}
          onCompleteWorkflow={() => handleRunDiagnosis(formData)}
        />
      )}

      {/* Scenario Picker Modal */}
      <ScenarioPickerModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        onSelectScenario={handleSelectScenario}
      />

      {/* Action Toast Feedback */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="info"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
