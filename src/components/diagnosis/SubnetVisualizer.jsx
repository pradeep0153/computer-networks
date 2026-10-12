import React from 'react';
import { Network, Server, Hash, Layers, Info } from 'lucide-react';

export function SubnetVisualizer({ subnetInfo }) {
  if (!subnetInfo) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center text-slate-500 text-sm">
        <Network className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p>Subnet calculations require a valid IPv4 address and contiguous subnet mask.</p>
      </div>
    );
  }

  // Generate 32 bit representations for visual bit bar
  const cidr = subnetInfo.cidr;
  const bitArray = [];
  for (let i = 0; i < 32; i++) {
    bitArray.push(i < cidr ? 1 : 0);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-900">Calculated Subnet Architecture</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-network-100 text-network-800 border border-network-200">
              {subnetInfo.fullCidrNotation}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            CIDR prefix /32-bit boundary analysis per RFC 4632
          </p>
        </div>

        {subnetInfo.specialCaseType !== 'Standard' && (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <Info className="w-3.5 h-3.5" />
            <span>{subnetInfo.specialCaseType}</span>
          </span>
        )}
      </div>

      {/* Grid of Key Properties */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-slate-400 block font-medium">Network Address</span>
          <span className="font-mono font-bold text-slate-800 text-sm">{subnetInfo.networkAddress}</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-slate-400 block font-medium">Directed Broadcast</span>
          <span className="font-mono font-bold text-slate-800 text-sm">
            {subnetInfo.cidr === 32 ? 'N/A (Host Route)' : subnetInfo.broadcastAddress}
          </span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-slate-400 block font-medium">Usable Host Capacity</span>
          <span className="font-mono font-bold text-slate-800 text-sm">
            {subnetInfo.usableHostsCount.toLocaleString()} {subnetInfo.usableHostsCount === 1 ? 'host' : 'hosts'}
          </span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-slate-400 block font-medium">Wildcard Mask</span>
          <span className="font-mono font-bold text-slate-800 text-sm">{subnetInfo.wildcardMask}</span>
        </div>
      </div>

      {/* Usable Range Box */}
      <div className="p-3.5 bg-network-50/60 rounded-xl border border-network-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-network-600" />
          <span className="font-semibold text-network-950">Valid Usable Host Range:</span>
          <span className="font-mono font-bold text-network-800">{subnetInfo.usableRange}</span>
        </div>
        <span className="text-[11px] text-network-700">
          Mask: <code className="font-mono font-semibold">{subnetInfo.mask}</code> ({subnetInfo.cidrNotation})
        </span>
      </div>

      {/* 32-Bit Binary Visualizer Bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-3 h-3 rounded bg-network-600" />
            <span>Network Prefix: <strong>{cidr} bits</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-3 h-3 rounded bg-emerald-500" />
            <span>Host Identifiers: <strong>{32 - cidr} bits</strong></span>
          </div>
        </div>

        <div className="flex h-5 rounded-lg overflow-hidden border border-slate-300 shadow-inner bg-slate-200">
          {bitArray.map((bit, idx) => (
            <div
              key={idx}
              title={`Bit ${idx + 1}: ${bit === 1 ? 'Network Bit' : 'Host Bit'}`}
              className={`flex-1 flex items-center justify-center text-[9px] font-mono font-bold text-white transition-colors border-r border-black/10 last:border-0 ${
                bit === 1 ? 'bg-network-600' : 'bg-emerald-500'
              }`}
            >
              {bit}
            </div>
          ))}
        </div>

        <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
          <span>Bit 1 (MSB)</span>
          <span>Bit 8</span>
          <span>Bit 16</span>
          <span>Bit 24</span>
          <span>Bit 32 (LSB)</span>
        </div>
      </div>

      {/* Technical Special Case Explanation */}
      {subnetInfo.specialCaseExplanation && (
        <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start space-x-2">
          <Info className="w-4 h-4 text-network-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{subnetInfo.specialCaseExplanation}</p>
        </div>
      )}
    </div>
  );
}
