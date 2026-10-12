import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ShieldAlert,
  Server,
  Layers,
  Globe,
  Radio,
} from 'lucide-react';
import { ObservationField } from '../forms/ObservationField.jsx';
import { SeverityBadge } from '../common/Badge.jsx';

export function DiagnosticWorkflow({ formData, onUpdateFormData, onCompleteWorkflow }) {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { number: 1, title: 'Device IP & Subnet', icon: Layers },
    { number: 2, title: 'Gateway & Subnet Boundary', icon: Radio },
    { number: 3, title: 'External Routing', icon: Server },
    { number: 4, title: 'DNS Resolution', icon: Globe },
    { number: 5, title: 'Application / Web', icon: CheckCircle2 },
    { number: 6, title: 'Final Summary', icon: CheckCircle2 },
  ];

  const handleObservation = (field, value) => {
    onUpdateFormData({
      ...formData,
      observations: {
        ...formData.observations,
        [field]: value,
      },
    });
  };

  const nextStep = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Step Progress Header */}
      <div className="p-6 bg-slate-900 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-network-400">
              Interactive Troubleshooting Wizard
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">
              Stage {currentStep} of {steps.length}: {steps[currentStep - 1].title}
            </h2>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-slate-400 font-mono">
              Step {currentStep} / {steps.length}
            </span>
          </div>
        </div>

        {/* Step indicator bar */}
        <div className="grid grid-cols-6 gap-2">
          {steps.map((s) => {
            const isDone = s.number < currentStep;
            const isCurrent = s.number === currentStep;
            return (
              <div key={s.number} className="flex flex-col items-center">
                <div
                  className={`w-full h-1.5 rounded-full transition-all ${
                    isDone
                      ? 'bg-emerald-400'
                      : isCurrent
                      ? 'bg-network-400 shadow-sm shadow-network-400/50'
                      : 'bg-slate-700'
                  }`}
                />
                <span className="text-[10px] mt-1.5 hidden md:block text-slate-400 truncate w-full text-center">
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Body */}
      <div className="p-6">
        {/* Step 1: Device Configuration */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-network-50 rounded-xl border border-network-200">
              <h3 className="text-sm font-bold text-network-900">Step 1: Validate Device Network Configuration</h3>
              <p className="text-xs text-network-700 mt-1">
                Checking host IP syntax, subnet mask bit contiguity, and address classification according to RFC standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <p className="text-xs text-slate-500 font-medium">Configured Host IP</p>
                <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                  {formData.ip || <span className="text-rose-500 font-sans text-sm">Not entered</span>}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <p className="text-xs text-slate-500 font-medium">Subnet Mask</p>
                <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                  {formData.mask || <span className="text-rose-500 font-sans text-sm">Not entered</span>}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-100 p-3 rounded-lg">
              💡 <strong>Networking Concept:</strong> The host IP and subnet mask are the foundation of Layer 3 IPv4 addressing. The subnet mask separates the 32 bits into the Network portion (routing prefix) and Host portion (interface identifier).
            </p>
          </div>
        )}

        {/* Step 2: Gateway & Locality */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-network-50 rounded-xl border border-network-200">
              <h3 className="text-sm font-bold text-network-900">Step 2: Subnet Boundary & Gateway Reachability</h3>
              <p className="text-xs text-network-700 mt-1">
                Does your machine share the exact same broadcast domain as your upstream router interface?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <p className="text-xs text-slate-500 font-medium">Default Gateway</p>
                <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                  {formData.gateway || <span className="text-amber-600 font-sans text-sm">Not configured</span>}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <p className="text-xs text-slate-500 font-medium">Target Destination IP</p>
                <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                  {formData.destinationIp || <span className="text-slate-400 font-sans text-sm">None specified</span>}
                </p>
              </div>
            </div>

            <ObservationField
              id="wizard-gw"
              label="Diagnostic Test: Can this device ping or reach the local gateway?"
              description="e.g., pinging your router IP (192.168.1.1). Verifies Layer 1 cable/Wi-Fi and Layer 2 ARP resolution."
              value={formData.observations.canReachGateway}
              onChange={(val) => handleObservation('canReachGateway', val)}
            />
          </div>
        )}

        {/* Step 3: External Routing */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-network-50 rounded-xl border border-network-200">
              <h3 className="text-sm font-bold text-network-900">Step 3: Review External IP Connectivity</h3>
              <p className="text-xs text-network-700 mt-1">
                Can your device send and receive packets to an external Internet IP address?
              </p>
            </div>

            <ObservationField
              id="wizard-ext-ip"
              label="Diagnostic Test: Can this device reach an external IP? (e.g. ping 8.8.8.8)"
              description="Pinging an external public IP bypasses DNS to isolate Layer 3 routing, NAT, and WAN link state."
              value={formData.observations.canReachExternalIp}
              onChange={(val) => handleObservation('canReachExternalIp', val)}
            />

            <p className="text-xs text-slate-600 bg-slate-100 p-3 rounded-lg">
              💡 <strong>Key Principle:</strong> If you can ping 8.8.8.8, your physical link, local gateway, NAT, and ISP routing are all confirmed working! Any remaining browsing failure is isolated to DNS or HTTP/HTTPS ports.
            </p>
          </div>
        )}

        {/* Step 4: DNS Resolution */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-network-50 rounded-xl border border-network-200">
              <h3 className="text-sm font-bold text-network-900">Step 4: Review DNS Hostname Resolution</h3>
              <p className="text-xs text-network-700 mt-1">
                Domain Name System (RFC 1035) translates human-readable hostnames into 32-bit IPv4 addresses.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <p className="text-xs text-slate-500 font-medium">Configured Primary DNS</p>
              <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                {formData.primaryDns || <span className="text-amber-600 font-sans text-sm">Not configured</span>}
              </p>
            </div>

            <ObservationField
              id="wizard-dns"
              label="Diagnostic Test: Can this device resolve domain names? (e.g. nslookup google.com)"
              description="Verifies that your operating system resolver can query UDP port 53 on the configured DNS server."
              value={formData.observations.canResolveDomain}
              onChange={(val) => handleObservation('canResolveDomain', val)}
            />
          </div>
        )}

        {/* Step 5: Web Access */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-network-50 rounded-xl border border-network-200">
              <h3 className="text-sm font-bold text-network-900">Step 5: Review Application Layer & Web Accessibility</h3>
              <p className="text-xs text-network-700 mt-1">
                Checking HTTP (TCP port 80) and HTTPS (TCP port 443) connectivity in a web browser.
              </p>
            </div>

            <ObservationField
              id="wizard-web"
              label="Diagnostic Test: Can you open web pages in your browser?"
              description="Tests full end-to-end communication including TCP three-way handshake, TLS negotiation, and HTTP response."
              value={formData.observations.canAccessWeb}
              onChange={(val) => handleObservation('canAccessWeb', val)}
            />
          </div>
        )}

        {/* Step 6: Final Review */}
        {currentStep === 6 && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <h3 className="text-sm font-bold text-emerald-950">Step 6: Diagnostic Review Ready</h3>
              <p className="text-xs text-emerald-800 mt-1">
                All 6 stages completed. Click below to execute the complete rule engine and generate your structured findings.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Device Name:</span>
                <span className="font-semibold text-slate-800">{formData.deviceName || 'Host Device'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">IP / Subnet Mask:</span>
                <span className="font-mono text-slate-800">{formData.ip} / {formData.mask}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Default Gateway:</span>
                <span className="font-mono text-slate-800">{formData.gateway || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Primary DNS:</span>
                <span className="font-mono text-slate-800">{formData.primaryDns || 'None'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={prevStep}
            className={`inline-flex items-center space-x-1 px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold ${
              currentStep === 1 ? 'opacity-40 cursor-not-allowed text-slate-400' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center space-x-1 px-5 py-2 rounded-xl bg-network-600 hover:bg-network-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <span>Next Stage</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onCompleteWorkflow}
              className="inline-flex items-center space-x-2 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>Generate Final Diagnosis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
