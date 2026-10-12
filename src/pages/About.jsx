import React from 'react';
import {
  ShieldAlert,
  BookOpen,
  Layers,
  Network,
  Cpu,
  Server,
  Globe,
  Radio,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export function About() {
  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-network-50 text-network-700 text-xs font-semibold border border-network-200 mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Academic Computer Networks Documentation</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          About NetPulse & Diagnostic Methodology
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Theoretical concepts, RFC standards, diagnostic classification taxonomy, and technical scope limitations.
        </p>
      </div>

      {/* Critical Limitations and Academic Scope Section */}
      <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-rose-700 font-bold text-sm">
          <ShieldAlert className="w-5 h-5" />
          <span>System Scope, Methodology & Technical Limitations</span>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed">
          NetPulse is designed to teach and demonstrate genuine <strong>Computer Networks</strong> engineering principles. In accordance with rigorous scientific honesty, it distinguishes between four distinct diagnostic categories:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">1. Configuration Validation</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Analyzes whether supplied parameters (IP, mask, gateway, DNS) are syntactically and mathematically valid according to IETF RFC standards. Fully evaluated in-browser.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">2. User Observation-Based Diagnosis</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Correlates connectivity outcomes (gateway reachability, DNS lookups, HTTP access) reported by the user to isolate the responsible OSI layer.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">3. Simulated Diagnosis</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Employs curated benchmark network topologies and known failure modes to illustrate diagnostic reasoning and expected results.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">4. Actual Operating-System Testing</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Requires native OS socket permissions to transmit ICMP echo requests (ping) or UDP port 53 packets. Browser JavaScript cannot forge raw layer-3 packets.
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-100 text-xs text-rose-900 leading-relaxed space-y-1.5">
          <p className="font-bold">Why the Browser Cannot Run Native Ping or Traceroute:</p>
          <p>
            Modern web browser security sandboxes (Chromium, Gecko, WebKit) intentionally forbid JavaScript from opening raw POSIX sockets (<code className="font-mono">SOCK_RAW</code>) or generating raw ICMP/IP packets to prevent malicious website port scanning and denial-of-service attacks.
          </p>
          <p>
            Therefore, <strong>NetPulse never fabricates live ping statistics or claims to test remote servers directly from the browser window</strong>. All reachability deductions rely on deterministic mathematical proof and user-supplied diagnostic observations.
          </p>
        </div>
      </div>

      {/* Networking Concepts Covered */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Networking Concepts Demonstrated in this Project
        </h2>

        <div className="space-y-4 text-xs text-slate-700">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Network className="w-4 h-4 text-network-600" />
              <span>1. IPv4 Addressing & Octal Ambiguity (RFC 791 / RFC 1122)</span>
            </h3>
            <p className="mt-1 leading-relaxed text-slate-600">
              An IPv4 address consists of 32 bits arranged into four 8-bit octets (0-255). NetPulse enforces strict validation, rejecting incomplete addresses, out-of-bounds octets, and leading zeros (such as 192.168.01.1). In historical BSD socket implementations, leading zeros caused strings to be interpreted in base-8 octal notation, creating severe configuration vulnerabilities.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-network-600" />
              <span>2. Contiguous Subnet Masking & CIDR (RFC 4632)</span>
            </h3>
            <p className="mt-1 leading-relaxed text-slate-600">
              A valid subnet mask must comprise a continuous block of binary ones followed by a continuous block of zeros. NetPulse converts addresses to unsigned 32-bit integers (<code className="font-mono">uint &gt;&gt;&gt; 0</code>), safely preventing JavaScript signed bitwise integer overflow errors, and calculates the exact network address, broadcast address, and host capacities.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Radio className="w-4 h-4 text-network-600" />
              <span>3. Point-to-Point Links (/31) & Host Routes (/32)</span>
            </h3>
            <p className="mt-1 leading-relaxed text-slate-600">
              While conventional subnets require 2 reserved addresses (Network ID and Directed Broadcast), RFC 3021 permits 31-bit prefixes (/31) on point-to-point router links, treating both addresses as usable endpoints. NetPulse recognizes /31 and /32 as special cases rather than misclassifying them as invalid conventional LANs.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-network-600" />
              <span>4. Default Gateway Routing & Layer 2 ARP Resolution (RFC 826)</span>
            </h3>
            <p className="mt-1 leading-relaxed text-slate-600">
              For a host on an Ethernet or Wi-Fi broadcast domain to send an IP datagram to its default gateway, it must first resolve the gateway's Layer 2 MAC address using ARP (Address Resolution Protocol). If the configured default gateway does not reside within the local subnet, the host cannot ARP for it on the local wire, causing routing to fail immediately.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Server className="w-4 h-4 text-network-600" />
              <span>5. DNS Layer Decoupling (RFC 1034 / RFC 1035)</span>
            </h3>
            <p className="mt-1 leading-relaxed text-slate-600">
              A classic troubleshooting puzzle occurs when a host can ping external IPs (e.g., 8.8.8.8) but cannot open websites by domain name (e.g., google.com). NetPulse demonstrates that Layer 3 IP forwarding is fully functional, isolating the problem specifically to Layer 7 DNS resolver configuration or UDP/TCP port 53 filtering.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3 text-xs">
        <h2 className="text-base font-bold text-slate-900">Project Architecture & Technology Stack</h2>
        <ul className="list-disc list-inside space-y-1.5 text-slate-600 leading-relaxed">
          <li><strong>Frontend:</strong> React.js 18 with Vite build tool</li>
          <li><strong>Styling:</strong> Tailwind CSS with custom network engineering theme palette</li>
          <li><strong>Icons:</strong> Lucide React</li>
          <li><strong>Routing:</strong> React Router v6</li>
          <li><strong>Networking Engine:</strong> Pure modular ES6 utilities (safe unsigned 32-bit math, RFC rule engine)</li>
          <li><strong>Persistence:</strong> Browser <code className="font-mono">localStorage</code> with corruption recovery & 20-record capacity limit</li>
          <li><strong>Testing:</strong> Vitest & React Testing Library (100% pass across 40 unit and integration tests)</li>
        </ul>
      </div>
    </div>
  );
}
