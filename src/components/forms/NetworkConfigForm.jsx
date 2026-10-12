import React, { useState } from 'react';
import { validateIPv4 } from '../../utils/ipv4.js';
import { validateSubnetMask, cidrToMask } from '../../utils/subnet.js';
import { ObservationField } from './ObservationField.jsx';
import { Tooltip } from '../common/Tooltip.jsx';
import {
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Network,
  Globe,
  Server,
  Laptop,
} from 'lucide-react';

export function NetworkConfigForm({ initialData = {}, onSubmit, onLoadScenarioClick }) {
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

  const [touched, setTouched] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleObservationChange = (key, val) => {
    setFormData((prev) => ({
      ...prev,
      observations: {
        ...prev.observations,
        [key]: val,
      },
    }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleQuickCIDR = (cidr) => {
    try {
      const maskStr = cidrToMask(cidr);
      handleChange('mask', maskStr);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    setFormData({
      deviceName: '',
      ip: '',
      mask: '255.255.255.0',
      gateway: '',
      primaryDns: '',
      secondaryDns: '',
      destinationIp: '',
      destinationHostname: '',
      observations: {
        canReachGateway: 'untested',
        canReachExternalIp: 'untested',
        canResolveDomain: 'untested',
        canAccessWeb: 'untested',
      },
      sourceMode: 'Configuration analysis',
    });
    setTouched({});
  };

  // Real-time field validations
  const ipValidation = formData.ip ? validateIPv4(formData.ip) : { isValid: true };
  const maskValidation = formData.mask ? validateSubnetMask(formData.mask) : { isValid: true };
  const gwValidation = formData.gateway ? validateIPv4(formData.gateway) : { isValid: true };
  const dns1Validation = formData.primaryDns ? validateIPv4(formData.primaryDns) : { isValid: true };
  const dns2Validation = formData.secondaryDns ? validateIPv4(formData.secondaryDns) : { isValid: true };
  const destIpValidation = formData.destinationIp ? validateIPv4(formData.destinationIp) : { isValid: true };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mark core fields touched
    setTouched({
      ip: true,
      mask: true,
      gateway: true,
      primaryDns: true,
      destinationIp: true,
    });

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-network-50 rounded-xl border border-network-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-network-600 text-white shadow-sm">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-network-950">Host IP & Subnet Configuration</h3>
            <p className="text-xs text-network-700">
              Enter your network settings below or load an academic benchmark scenario.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onLoadScenarioClick && (
            <button
              type="button"
              onClick={onLoadScenarioClick}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-network-300 text-network-700 hover:bg-network-100 hover:border-network-400 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-network-600" />
              <span>Load Example</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Section 1: Device and Core IPv4 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          <Laptop className="w-4 h-4 text-network-600" />
          <span>1. Host Interface Configuration</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Device Name */}
          <div>
            <label htmlFor="deviceName" className="block text-xs font-semibold text-slate-700 mb-1">
              Device Identifier / Hostname <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="deviceName"
              type="text"
              placeholder="e.g. Lab-Workstation-01, iPhone-WiFi"
              value={formData.deviceName}
              onChange={(e) => handleChange('deviceName', e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white placeholder-slate-400 focus:border-network-500 focus:ring-1 focus:ring-network-500 outline-none transition-all"
            />
          </div>

          {/* IPv4 Address */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="ip" className="block text-xs font-semibold text-slate-800">
                Host IPv4 Address <span className="text-rose-500">*</span>
              </label>
              <Tooltip text="The unicast 32-bit IPv4 address assigned to this network interface (RFC 791). Example: 192.168.1.50" />
            </div>
            <input
              id="ip"
              type="text"
              required
              placeholder="e.g. 192.168.1.50"
              value={formData.ip}
              onChange={(e) => handleChange('ip', e.target.value)}
              onBlur={() => handleBlur('ip')}
              className={`w-full px-3.5 py-2 text-sm font-mono rounded-lg border ${
                touched.ip && (!formData.ip || !ipValidation.isValid)
                  ? 'border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-300 bg-white focus:border-network-500 focus:ring-network-500'
              } outline-none transition-all`}
            />
            {touched.ip && !formData.ip && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Host IPv4 address is required.
              </p>
            )}
            {touched.ip && formData.ip && !ipValidation.isValid && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {ipValidation.error}
              </p>
            )}
          </div>

          {/* Subnet Mask */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="mask" className="block text-xs font-semibold text-slate-800">
                Subnet Mask <span className="text-rose-500">*</span>
              </label>
              <Tooltip text="Defines the network boundary. Must have contiguous 1s followed by 0s (e.g., 255.255.255.0 for /24)." />
            </div>
            <input
              id="mask"
              type="text"
              required
              placeholder="e.g. 255.255.255.0"
              value={formData.mask}
              onChange={(e) => handleChange('mask', e.target.value)}
              onBlur={() => handleBlur('mask')}
              className={`w-full px-3.5 py-2 text-sm font-mono rounded-lg border ${
                touched.mask && (!formData.mask || !maskValidation.isValid)
                  ? 'border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-300 bg-white focus:border-network-500 focus:ring-network-500'
              } outline-none transition-all`}
            />
            {touched.mask && formData.mask && !maskValidation.isValid && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {maskValidation.error}
              </p>
            )}

            {/* Quick CIDR buttons */}
            <div className="flex items-center space-x-1.5 mt-2">
              <span className="text-[11px] text-slate-400 font-medium">Quick CIDR:</span>
              {[
                { cidr: 24, label: '/24' },
                { cidr: 16, label: '/16' },
                { cidr: 8, label: '/8' },
                { cidr: 28, label: '/28' },
                { cidr: 30, label: '/30' },
                { cidr: 31, label: '/31' },
              ].map((c) => (
                <button
                  key={c.cidr}
                  type="button"
                  onClick={() => handleQuickCIDR(c.cidr)}
                  className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-100 hover:bg-network-100 hover:text-network-800 text-slate-600 transition-colors"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Default Gateway */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="gateway" className="block text-xs font-semibold text-slate-800">
                Default Gateway <span className="text-slate-400 font-normal">(Router IP)</span>
              </label>
              <Tooltip text="The local router interface IP used to forward packets outside this local subnet (e.g. 192.168.1.1)." />
            </div>
            <input
              id="gateway"
              type="text"
              placeholder="e.g. 192.168.1.1"
              value={formData.gateway}
              onChange={(e) => handleChange('gateway', e.target.value)}
              onBlur={() => handleBlur('gateway')}
              className={`w-full px-3.5 py-2 text-sm font-mono rounded-lg border ${
                touched.gateway && formData.gateway && !gwValidation.isValid
                  ? 'border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-300 bg-white focus:border-network-500 focus:ring-network-500'
              } outline-none transition-all`}
            />
            {touched.gateway && formData.gateway && !gwValidation.isValid && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {gwValidation.error}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: DNS Resolvers */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          <Server className="w-4 h-4 text-network-600" />
          <span>2. DNS Resolvers (Domain Name System)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary DNS */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="primaryDns" className="block text-xs font-semibold text-slate-800">
                Primary DNS Server
              </label>
              <Tooltip text="Nameserver queried first for resolving hostnames (e.g. 8.8.8.8, 1.1.1.1, or router IP)." />
            </div>
            <input
              id="primaryDns"
              type="text"
              placeholder="e.g. 8.8.8.8 or 192.168.1.1"
              value={formData.primaryDns}
              onChange={(e) => handleChange('primaryDns', e.target.value)}
              onBlur={() => handleBlur('primaryDns')}
              className={`w-full px-3.5 py-2 text-sm font-mono rounded-lg border ${
                touched.primaryDns && formData.primaryDns && !dns1Validation.isValid
                  ? 'border-rose-300 bg-rose-50/40'
                  : 'border-slate-300 bg-white'
              } focus:border-network-500 focus:ring-network-500 outline-none transition-all`}
            />
            {touched.primaryDns && formData.primaryDns && !dns1Validation.isValid && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {dns1Validation.error}
              </p>
            )}
          </div>

          {/* Secondary DNS */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="secondaryDns" className="block text-xs font-semibold text-slate-800">
                Secondary DNS Server <span className="text-slate-400 font-normal">(Optional Backup)</span>
              </label>
              <Tooltip text="Fallback resolver queried when primary DNS times out (e.g. 8.8.4.4, 1.0.0.1)." />
            </div>
            <input
              id="secondaryDns"
              type="text"
              placeholder="e.g. 1.1.1.1 or 8.8.4.4"
              value={formData.secondaryDns}
              onChange={(e) => handleChange('secondaryDns', e.target.value)}
              onBlur={() => handleBlur('secondaryDns')}
              className={`w-full px-3.5 py-2 text-sm font-mono rounded-lg border ${
                touched.secondaryDns && formData.secondaryDns && !dns2Validation.isValid
                  ? 'border-rose-300 bg-rose-50/40'
                  : 'border-slate-300 bg-white'
              } focus:border-network-500 focus:ring-network-500 outline-none transition-all`}
            />
            {touched.secondaryDns && formData.secondaryDns && !dns2Validation.isValid && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {dns2Validation.error}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Target Test Destination (Optional) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          <Globe className="w-4 h-4 text-network-600" />
          <span>3. Target Destination (Routing & DNS Locality Analysis)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="destinationIp" className="block text-xs font-semibold text-slate-800">
                Destination IPv4 Address <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <Tooltip text="Used to test whether target is in local subnet (Layer 2 ARP) or remote (requires gateway)." />
            </div>
            <input
              id="destinationIp"
              type="text"
              placeholder="e.g. 142.250.190.46 or 192.168.1.100"
              value={formData.destinationIp}
              onChange={(e) => handleChange('destinationIp', e.target.value)}
              onBlur={() => handleBlur('destinationIp')}
              className={`w-full px-3.5 py-2 text-sm font-mono rounded-lg border ${
                touched.destinationIp && formData.destinationIp && !destIpValidation.isValid
                  ? 'border-rose-300 bg-rose-50/40'
                  : 'border-slate-300 bg-white'
              } focus:border-network-500 focus:ring-network-500 outline-none transition-all`}
            />
            {touched.destinationIp && formData.destinationIp && !destIpValidation.isValid && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {destIpValidation.error}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="destinationHostname" className="block text-xs font-semibold text-slate-800">
                Destination Hostname / FQDN <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <Tooltip text="Target domain name used to verify whether DNS resolution is necessary (e.g. google.com)." />
            </div>
            <input
              id="destinationHostname"
              type="text"
              placeholder="e.g. google.com, portal.company.local"
              value={formData.destinationHostname}
              onChange={(e) => handleChange('destinationHostname', e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:border-network-500 focus:ring-network-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Diagnostic Observations (User Observations) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-network-600" />
            <span>4. Diagnostic Connectivity Observations</span>
          </div>
          <span className="text-xs text-slate-500">Select results if you executed local commands</span>
        </div>

        <p className="text-xs text-slate-500">
          Mark the results observed when pinging or browsing on your device. Any observation left as <strong>Not Tested</strong> will not be treated as a failure.
        </p>

        <div className="space-y-3 pt-1">
          <ObservationField
            id="obs-gw"
            label="Can reach the local gateway? (e.g., ping 192.168.1.1)"
            description="Verifies basic Layer 1/2 physical and data-link connectivity to your router."
            value={formData.observations.canReachGateway}
            onChange={(val) => handleObservationChange('canReachGateway', val)}
          />

          <ObservationField
            id="obs-ext-ip"
            label="Can reach an external IP? (e.g., ping 8.8.8.8)"
            description="Verifies Layer 3 IP routing, NAT, and upstream Internet gateway functionality."
            value={formData.observations.canReachExternalIp}
            onChange={(val) => handleObservationChange('canReachExternalIp', val)}
          />

          <ObservationField
            id="obs-dns"
            label="Can resolve a domain name? (e.g., nslookup google.com)"
            description="Verifies Layer 7 DNS resolver queries over UDP/TCP port 53."
            value={formData.observations.canResolveDomain}
            onChange={(val) => handleObservationChange('canResolveDomain', val)}
          />

          <ObservationField
            id="obs-web"
            label="Can access web pages in a browser? (HTTP/HTTPS)"
            description="Verifies Layer 4 TCP port 80/443 handshake and Layer 7 HTTP/TLS processing."
            value={formData.observations.canAccessWeb}
            onChange={(val) => handleObservationChange('canAccessWeb', val)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleReset}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-medium transition-colors"
        >
          Reset Form
        </button>

        <button
          type="submit"
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-network-600 hover:bg-network-500 text-white text-sm font-semibold shadow-md shadow-network-600/20 active:scale-95 transition-all"
        >
          <span>Run Diagnosis Engine</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
