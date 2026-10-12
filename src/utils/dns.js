/**
 * DNS Configuration Analysis Utility
 * Analyzes DNS address formats, resolution requirements, and user diagnostic observations.
 */

import { validateIPv4 } from './ipv4.js';

/**
 * Validates a hostname format (RFC 1123).
 * @param {string} hostname
 * @returns {boolean}
 */
export function isValidHostname(hostname) {
  if (typeof hostname !== 'string') return false;
  const trimmed = hostname.trim();
  if (!trimmed || trimmed.length > 253) return false;

  // Basic RFC 1123 check
  const labelRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
  const parts = trimmed.split('.');
  return parts.every((p) => labelRegex.test(p));
}

/**
 * Analyzes DNS configuration and diagnostic observations.
 * @param {object} params
 * @param {string} params.primaryDns
 * @param {string} [params.secondaryDns]
 * @param {string} [params.destinationHostname]
 * @param {object} [params.observations]
 * @returns {object}
 */
export function analyzeDNSConfiguration({
  primaryDns,
  secondaryDns,
  destinationHostname,
  observations = {},
}) {
  const issues = [];
  const recommendations = [];

  const hasPrimary = Boolean(primaryDns && primaryDns.trim());
  const hasSecondary = Boolean(secondaryDns && secondaryDns.trim());
  const hasHostname = Boolean(destinationHostname && destinationHostname.trim());

  // 1. Primary DNS validity
  if (hasPrimary) {
    const val = validateIPv4(primaryDns.trim());
    if (!val.isValid) {
      issues.push({
        code: 'DNS_PRIMARY_INVALID',
        title: 'Invalid Primary DNS Server IPv4 Address',
        severity: 'High',
        explanation: `The Primary DNS IP "${primaryDns}" is not a valid IPv4 address: ${val.error}`,
        recommendation:
          'Provide a valid DNS server IP address (e.g., 8.8.8.8 [Google DNS], 1.1.1.1 [Cloudflare], or your ISP/LAN router DNS IP).',
        basis: 'Configuration analysis',
      });
    } else if (primaryDns.trim() === '127.0.0.1') {
      recommendations.push({
        code: 'DNS_PRIMARY_LOCALHOST',
        title: 'Primary DNS Points to Localhost',
        severity: 'Low',
        explanation: 'Primary DNS is configured as 127.0.0.1 (loopback). This is only valid if a local DNS resolver/stub (like systemd-resolved or BIND) is running on this device.',
        recommendation: 'Verify that a local caching DNS service is active on port 53.',
        basis: 'Configuration analysis',
      });
    }
  } else {
    // Primary DNS missing
    if (hasHostname || observations.canResolveDomain === 'no' || observations.canAccessWeb === 'no') {
      issues.push({
        code: 'DNS_MISSING_FOR_HOSTNAME',
        title: 'Missing Primary DNS Server',
        severity: 'High',
        explanation:
          'A destination hostname or web test was specified, but no Primary DNS server is configured. Hostname resolution will fail because the operating system resolver has no nameserver to query.',
        recommendation:
          'Configure a Primary DNS server such as your default gateway IP or a public resolver (8.8.8.8, 1.1.1.1).',
        basis: 'Configuration analysis',
      });
    } else {
      recommendations.push({
        code: 'DNS_NOT_CONFIGURED',
        title: 'No DNS Server Configured',
        severity: 'Informational',
        explanation: 'No DNS servers are set. While direct IP-to-IP communication can work, all domain name lookups (e.g. google.com) will fail.',
        recommendation: 'Configure at least one DNS server for normal Internet usage.',
        basis: 'Configuration analysis',
      });
    }
  }

  // 2. Secondary DNS validity
  if (hasSecondary) {
    const val = validateIPv4(secondaryDns.trim());
    if (!val.isValid) {
      issues.push({
        code: 'DNS_SECONDARY_INVALID',
        title: 'Invalid Secondary DNS Server IPv4 Address',
        severity: 'Medium',
        explanation: `The Secondary DNS IP "${secondaryDns}" is not a valid IPv4 address: ${val.error}`,
        recommendation: 'Correct the Secondary DNS IP or remove it if not needed.',
        basis: 'Configuration analysis',
      });
    } else if (hasPrimary && primaryDns.trim() === secondaryDns.trim()) {
      recommendations.push({
        code: 'DNS_DUPLICATE_SERVERS',
        title: 'Redundant DNS Configuration',
        severity: 'Low',
        explanation: 'The Primary and Secondary DNS addresses are identical. This provides zero redundancy if that specific nameserver fails.',
        recommendation: 'Set a different secondary resolver IP (e.g., 8.8.4.4 or 1.0.0.1) for fallback resilience.',
        basis: 'Configuration analysis',
      });
    }
  }

  // 3. Observations-based analysis
  const canReachExtIp = observations.canReachExternalIp;
  const canResolve = observations.canResolveDomain;
  const canAccessWeb = observations.canAccessWeb;

  if (canReachExtIp === 'yes' && canResolve === 'no') {
    issues.push({
      code: 'DNS_RESOLUTION_FAILURE_WITH_IP_OK',
      title: 'DNS Resolution Failure While IP Routing Functions',
      severity: 'High',
      explanation:
        'The host can reach external IPv4 addresses directly (indicating valid routing, gateway, and NAT), but domain name resolution fails. This specifically isolates the problem to the DNS subsystem (Layer 7 resolution or UDP port 53 blocking).',
      recommendation:
        '1. Check DNS server IP address.\n2. Test resolver response using `nslookup google.com <DNS_IP>` or `dig @<DNS_IP> google.com`.\n3. Verify whether outbound UDP/TCP port 53 is blocked by a firewall.\n4. Flush local OS DNS cache (`ipconfig /flushdns` or `resolvectl flush-caches`).',
      basis: 'User observation',
    });
  } else if (canReachExtIp === 'no' && canResolve === 'no') {
    issues.push({
      code: 'GENERAL_EXTERNAL_CONNECTIVITY_DOWN',
      title: 'Both External IP Routing and DNS Resolution Failed',
      severity: 'Critical',
      explanation:
        'The device cannot reach external IP addresses, and DNS queries also fail. Because DNS queries to external servers depend on underlying IP routing, the root cause is almost certainly upstream link/gateway routing or physical disconnection rather than a standalone DNS issue.',
      recommendation:
        'Focus troubleshooting on Layer 1-3 connectivity: verify physical cable/Wi-Fi connection, local gateway reachability, and ISP modem/ONT status first.',
      basis: 'User observation',
    });
  }

  return {
    hasPrimary,
    hasSecondary,
    issues,
    recommendations,
  };
}
