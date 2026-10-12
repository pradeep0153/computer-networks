import React from 'react';
import { Route, MapPin, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export function LocalityCard({ destLocality, destinationIp, gateway }) {
  if (!destLocality || !destinationIp) return null;

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition-all ${
        destLocality.isLocal
          ? 'bg-emerald-50/50 border-emerald-200'
          : 'bg-indigo-50/50 border-indigo-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2.5 rounded-xl ${
              destLocality.isLocal
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 text-white'
            }`}
          >
            <Route className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-slate-900">
                Destination Locality: {destLocality.isLocal ? 'Local Subnet' : 'Remote Network'}
              </h4>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  destLocality.isLocal
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                }`}
              >
                {destLocality.isLocal ? 'Layer 2 ARP Direct' : 'Layer 3 Gateway Forwarding'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {destLocality.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-slate-500">Destination Target:</span>
          <p className="font-mono font-bold text-slate-800">{destinationIp}</p>
        </div>
        <div>
          <span className="text-slate-500">Target Subnet ID:</span>
          <p className="font-mono font-bold text-slate-800">
            {destLocality.destNetwork}/{destLocality.cidr}
          </p>
        </div>
        <div>
          <span className="text-slate-500">Next Hop Requirement:</span>
          <p className="font-bold text-slate-800">
            {destLocality.isLocal
              ? 'Local ARP Broadcast'
              : gateway
              ? `Gateway ${gateway}`
              : 'CRITICAL: Gateway Missing'}
          </p>
        </div>
      </div>
    </div>
  );
}
