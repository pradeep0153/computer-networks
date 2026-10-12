/**
 * Deterministic Rule-Based Troubleshooting Engine for Computer Networks
 * Analyzes device IPv4 configuration, subnet parameters, gateway routing,
 * DNS setup, and diagnostic observations across OSI Layers 1–7.
 */

import { validateIPv4, classifyIPv4Address } from './ipv4.js';
import { validateSubnetMask, calculateSubnetDetails, areInSameSubnet, classifyDestinationLocality } from './subnet.js';
import { analyzeDefaultGateway } from './gateway.js';
import { analyzeDNSConfiguration, isValidHostname } from './dns.js';

/**
 * Runs complete diagnostic rules against configuration and observations.
 * @param {object} input
 * @param {string} input.deviceName
 * @param {string} input.ip - Device IPv4
 * @param {string} input.mask - Subnet Mask
 * @param {string} input.gateway - Default Gateway IPv4
 * @param {string} [input.primaryDns] - Primary DNS Server
 * @param {string} [input.secondaryDns] - Secondary DNS Server
 * @param {string} [input.destinationIp] - Target destination IP for connectivity test
 * @param {string} [input.destinationHostname] - Target domain name
 * @param {object} [input.observations] - { canReachGateway, canReachExternalIp, canResolveDomain, canAccessWeb }
 * @param {string} [input.sourceMode] - 'Configuration analysis' | 'User observation' | 'Simulated test' | 'Actual test'
 * @returns {object} Diagnosis output with findings, subnet info, status, checklist
 */
export function runDiagnosis(input) {
  const {
    deviceName = 'Host Device',
    ip = '',
    mask = '',
    gateway = '',
    primaryDns = '',
    secondaryDns = '',
    destinationIp = '',
    destinationHostname = '',
    observations = {},
    sourceMode = 'Configuration analysis',
  } = input;

  const findings = [];
  const checklist = [];

  // Determine observation values: 'yes' | 'no' | 'untested'
  const obs = {
    canReachGateway: observations.canReachGateway || 'untested',
    canReachExternalIp: observations.canReachExternalIp || 'untested',
    canResolveDomain: observations.canResolveDomain || 'untested',
    canAccessWeb: observations.canAccessWeb || 'untested',
  };

  const hasAnyObservation = Object.values(obs).some((v) => v === 'yes' || v === 'no');
  const diagnosticBasis = hasAnyObservation
    ? (sourceMode === 'Simulated test' ? 'Simulated test' : 'User observation')
    : sourceMode;

  // Track validity of core parameters
  const ipValidation = validateIPv4(ip);
  const maskValidation = validateSubnetMask(mask);
  let subnetInfo = null;

  // --------------------------------------------------------------------------
  // Rule 13: Incomplete Configuration
  // --------------------------------------------------------------------------
  const missingCoreFields = [];
  if (!ip.trim()) missingCoreFields.push('IPv4 Address');
  if (!mask.trim()) missingCoreFields.push('Subnet Mask');

  if (missingCoreFields.length > 0) {
    findings.push({
      id: 'ERR_INCOMPLETE_CONFIG',
      title: 'Incomplete Network Configuration',
      severity: 'Critical',
      category: 'IP Addressing',
      explanation: `Core network parameters are missing (${missingCoreFields.join(', ')}). A network interface cannot participate in IP communications without a valid IP address and subnet mask.`,
      evidence: `Missing fields: ${missingCoreFields.join(', ')}`,
      recommendedFix: 'Provide a valid IPv4 address and subnet mask for the interface.',
      concept: 'RFC 791 Internet Protocol Architecture (Interface Initialization)',
      confidence: 'High (Definite input absence)',
      basis: 'Configuration analysis',
    });
  }

  // --------------------------------------------------------------------------
  // Rule 1: Invalid Local IPv4 Address
  // --------------------------------------------------------------------------
  if (ip.trim() && !ipValidation.isValid) {
    findings.push({
      id: 'ERR_INVALID_IPV4',
      title: 'Invalid Local IPv4 Address Syntax',
      severity: 'Critical',
      category: 'IP Addressing',
      explanation: `The configured IPv4 address "${ip}" is malformed or invalid: ${ipValidation.error}. IPv4 addresses must follow standard dotted-decimal notation (four octets between 0 and 255).`,
      evidence: `Provided IP: "${ip}" | Error: ${ipValidation.error}`,
      recommendedFix: 'Correct the device IP address to follow standard dotted-decimal formatting (e.g., 192.168.1.50).',
      concept: 'RFC 791 / RFC 1122 Dotted-Decimal IPv4 Specification',
      confidence: 'High (Syntax validation failure)',
      basis: 'Configuration analysis',
    });
  } else if (ipValidation.isValid) {
    // Check address classification anomalies
    const classification = classifyIPv4Address(ip);

    if (ip.startsWith('127.')) {
      findings.push({
        id: 'ERR_IPV4_LOOPBACK_ASSIGNED',
        title: 'Loopback Address Configured on Physical/VLAN Interface',
        severity: 'Critical',
        category: 'IP Addressing',
        explanation: `The configured IP "${ip}" belongs to the 127.0.0.0/8 loopback block. Loopback addresses are reserved strictly for internal host-only communication and cannot be routed across an external physical or virtual network interface.`,
        evidence: `IP: ${ip} (Classified as ${classification.type})`,
        recommendedFix: 'Change the interface IP to a routable unicast address within your local network range (such as RFC 1918 private address).',
        concept: 'RFC 1122 Section 3.2.1.3 Loopback Network Designation',
        confidence: 'High (RFC 1122 Reserved Range)',
        basis: 'Configuration analysis',
      });
    } else if (ip.startsWith('169.254.')) {
      findings.push({
        id: 'WARN_APIPA_ADDRESS',
        title: 'Automatic Private IP Addressing (APIPA / Link-Local) Detected',
        severity: 'High',
        category: 'IP Addressing',
        explanation: `The IP "${ip}" falls in the 169.254.0.0/16 range. This strongly indicates that the host attempted DHCP discovery but failed to receive a DHCP Offer from a DHCP server. While hosts on the same physical link can communicate, Internet access is impossible without a routable address.`,
        evidence: `IP: ${ip} (APIPA Range 169.254.0.0/16)`,
        recommendedFix: 'Check physical cable/Wi-Fi connection, verify that the local DHCP server/router is active, or configure a static IP with your administrator.',
        concept: 'RFC 3927 Dynamic Configuration of IPv4 Link-Local Addresses',
        confidence: 'High (Deterministic APIPA Range)',
        basis: 'Configuration analysis',
      });
    } else if (classification.type.includes('Multicast')) {
      findings.push({
        id: 'ERR_IPV4_MULTICAST_ASSIGNED',
        title: 'Multicast Address Assigned as Unicast Host IP',
        severity: 'Critical',
        category: 'IP Addressing',
        explanation: `The IP "${ip}" is within the 224.0.0.0/4 Class D multicast space. Multicast addresses cannot be configured as source host addresses on a network interface.`,
        evidence: `IP: ${ip} (Class D Multicast)`,
        recommendedFix: 'Assign a valid unicast IPv4 host address.',
        concept: 'RFC 5771 IANA IPv4 Multicast Guidelines',
        confidence: 'High (Reserved Multicast Block)',
        basis: 'Configuration analysis',
      });
    }
  }

  // --------------------------------------------------------------------------
  // Rule 2: Invalid Subnet Mask
  // --------------------------------------------------------------------------
  if (mask.trim() && !maskValidation.isValid) {
    findings.push({
      id: 'ERR_INVALID_SUBNET_MASK',
      title: 'Invalid Subnet Mask',
      severity: 'Critical',
      category: 'Subnetting',
      explanation: `The subnet mask "${mask}" is invalid: ${maskValidation.error}. In IPv4, subnet masks must consist of contiguous binary ones followed by contiguous zeros.`,
      evidence: `Provided Subnet Mask: "${mask}" | Error: ${maskValidation.error}`,
      recommendedFix: 'Specify a standard contiguous subnet mask such as 255.255.255.0 (/24), 255.255.0.0 (/16), or 255.0.0.0 (/8).',
      concept: 'RFC 4632 Classless Inter-Domain Routing (CIDR) Subnet Masks',
      confidence: 'High (Mathematical bit-contiguity violation)',
      basis: 'Configuration analysis',
    });
  }

  // If both IP and Mask are valid, perform in-depth subnet checks
  if (ipValidation.isValid && maskValidation.isValid) {
    subnetInfo = calculateSubnetDetails(ip, mask);

    if (subnetInfo) {
      // Check if IP is equal to Network Address or Directed Broadcast Address
      if (subnetInfo.isNetworkAddress && subnetInfo.cidr < 31) {
        findings.push({
          id: 'ERR_IP_IS_NETWORK_ADDRESS',
          title: 'Host IP Matches Subnet Network Identifier',
          severity: 'Critical',
          category: 'Subnetting',
          explanation: `The host IP "${ip}" is the Subnet Network Identifier for ${subnetInfo.fullCidrNotation}. The network address represents the entire wire/segment and cannot be assigned to an individual host interface.`,
          evidence: `Device IP: ${ip} | Subnet Network ID: ${subnetInfo.networkAddress}`,
          recommendedFix: `Assign an IP address in the usable host range: ${subnetInfo.usableRange}.`,
          concept: 'RFC 791 / RFC 1122 Special IPv4 Address Designations',
          confidence: 'High (Exact match with calculated network ID)',
          basis: 'Configuration analysis',
        });
      } else if (subnetInfo.isBroadcastAddress && subnetInfo.cidr < 31) {
        findings.push({
          id: 'ERR_IP_IS_BROADCAST_ADDRESS',
          title: 'Host IP Matches Subnet Directed Broadcast Address',
          severity: 'Critical',
          category: 'Subnetting',
          explanation: `The host IP "${ip}" is the directed broadcast address for ${subnetInfo.fullCidrNotation}. Frames sent to this address are flooded to all hosts on the segment and cannot identify a unique interface.`,
          evidence: `Device IP: ${ip} | Directed Broadcast: ${subnetInfo.broadcastAddress}`,
          recommendedFix: `Assign an IP address in the usable host range: ${subnetInfo.usableRange}.`,
          concept: 'RFC 919 / RFC 922 Broadcasting Internet Datagrams',
          confidence: 'High (Exact match with broadcast ID)',
          basis: 'Configuration analysis',
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // Rule 3, 4: Default Gateway Analysis
  // --------------------------------------------------------------------------
  const gwAnalysis = analyzeDefaultGateway({
    ip,
    mask,
    gateway,
    destinationIp,
  });

  gwAnalysis.issues.forEach((issue) => {
    findings.push({
      id: issue.code,
      title: issue.title,
      severity: issue.severity,
      category: 'Routing / Gateway',
      explanation: issue.explanation,
      evidence: `Host IP: ${ip || 'N/A'}, Mask: ${mask || 'N/A'}, Gateway: ${gateway || 'Not configured'}`,
      recommendedFix: issue.recommendation,
      concept: 'Default Route & Next Hop Gateway Forwarding (Layer 3)',
      confidence: 'High (Subnet boundary calculation)',
      basis: 'Configuration analysis',
    });
  });

  // --------------------------------------------------------------------------
  // Rule 5, 6, 7: Destination Locality & Gateway Requirement
  // --------------------------------------------------------------------------
  let destLocality = null;
  if (destinationIp && destinationIp.trim()) {
    const destVal = validateIPv4(destinationIp.trim());
    if (!destVal.isValid) {
      findings.push({
        id: 'ERR_DESTINATION_IP_INVALID',
        title: 'Invalid Destination IPv4 Address Format',
        severity: 'Medium',
        category: 'Diagnostic Input',
        explanation: `The destination IP "${destinationIp}" is not a valid IPv4 address: ${destVal.error}`,
        evidence: `Destination IP: "${destinationIp}"`,
        recommendedFix: 'Correct the destination IP address to a valid dotted-decimal format.',
        concept: 'IPv4 Destination Addressing',
        confidence: 'High (Validation error)',
        basis: 'Configuration analysis',
      });
    } else if (ipValidation.isValid && maskValidation.isValid) {
      destLocality = classifyDestinationLocality(ip, mask, destinationIp.trim());

      if (destLocality.isLocal) {
        // Rule 6: Destination in the local subnet
        findings.push({
          id: 'INFO_DESTINATION_LOCAL',
          title: 'Destination Located in Local Subnet (Direct Delivery)',
          severity: 'Informational',
          category: 'Routing / Gateway',
          explanation: `The destination IP ${destinationIp} is in the same local subnet (${destLocality.sourceNetwork}/${destLocality.cidr}) as the host. Traffic to this destination does NOT pass through the default gateway; it is delivered directly at Layer 2 using ARP (Address Resolution Protocol) cache lookup and MAC framing.`,
          evidence: `Host: ${ip}, Destination: ${destinationIp}, Subnet: ${destLocality.sourceNetwork}/${destLocality.cidr}`,
          recommendedFix: 'For local communication issues, verify Layer 2 connectivity, local ARP resolution, and host firewall rules.',
          concept: 'Direct vs. Indirect Delivery (RFC 1122 Sec 3.3.1)',
          confidence: 'High (Bitwise subnet equality match)',
          basis: 'Configuration analysis',
        });
      } else {
        // Rule 7: Destination outside the local subnet
        findings.push({
          id: 'INFO_DESTINATION_REMOTE',
          title: 'Destination Located on Remote Network (Indirect Routing)',
          severity: 'Informational',
          category: 'Routing / Gateway',
          explanation: `The destination IP ${destinationIp} is outside the local subnet (${destLocality.sourceNetwork}/${destLocality.cidr}). The host must encapsulate datagrams inside Layer 2 frames addressed to the default gateway's MAC address for routing.`,
          evidence: `Host Subnet: ${destLocality.sourceNetwork}/${destLocality.cidr} != Destination Subnet: ${destLocality.destNetwork}/${destLocality.cidr}`,
          recommendedFix: 'Ensure a reachable, working default gateway is configured.',
          concept: 'Next-Hop Forwarding and Hop-by-Hop Routing',
          confidence: 'High (Bitwise subnet inequality match)',
          basis: 'Configuration analysis',
        });

        // Rule 5: Missing gateway for remote destination
        if (!gateway || !gateway.trim()) {
          findings.push({
            id: 'ERR_MISSING_GATEWAY_FOR_REMOTE',
            title: 'Missing Default Gateway for Remote Communication',
            severity: 'Critical',
            category: 'Routing / Gateway',
            explanation: `The destination ${destinationIp} is on a remote subnet, but no default gateway is configured. The host operating system kernel routing table will return "Network is unreachable" (ENETUNREACH) because it has no default route (0.0.0.0/0) to forward packets off-link.`,
            evidence: `Destination: ${destinationIp} is remote, Gateway field is empty`,
            recommendedFix: 'Configure the IP address of your local router as the default gateway.',
            concept: 'Default Route (0.0.0.0/0) and Next-Hop Resolution',
            confidence: 'High (Deterministic routing requirement)',
            basis: 'Configuration analysis',
          });
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // Rule 12: Missing DNS when Hostname Access is Required
  // --------------------------------------------------------------------------
  if (destinationHostname && destinationHostname.trim()) {
    if (!isValidHostname(destinationHostname.trim())) {
      findings.push({
        id: 'WARN_INVALID_HOSTNAME_FORMAT',
        title: 'Suspicious or Malformed Destination Hostname',
        severity: 'Low',
        category: 'DNS Resolution',
        explanation: `The hostname "${destinationHostname}" contains unusual formatting or characters not standard in RFC 1123 DNS labels.`,
        evidence: `Provided hostname: "${destinationHostname}"`,
        recommendedFix: 'Use standard FQDN or hostname notation (e.g., example.com, gateway.corp.local).',
        concept: 'RFC 1123 Requirements for Internet Hosts — Application and Support',
        confidence: 'Medium (Format inspection)',
        basis: 'Configuration analysis',
      });
    }
  }

  // DNS Analysis
  const dnsAnalysis = analyzeDNSConfiguration({
    primaryDns,
    secondaryDns,
    destinationHostname,
    observations: obs,
  });

  dnsAnalysis.issues.forEach((issue) => {
    findings.push({
      id: issue.code,
      title: issue.title,
      severity: issue.severity,
      category: 'DNS Resolution',
      explanation: issue.explanation,
      evidence: `Primary DNS: "${primaryDns || 'None'}", Hostname: "${destinationHostname || 'None'}", Can Resolve: ${obs.canResolveDomain}`,
      recommendedFix: issue.recommendation,
      concept: 'Domain Name System (RFC 1034 / RFC 1035)',
      confidence: issue.basis === 'Configuration analysis' ? 'High' : 'High (Reported user observation)',
      basis: issue.basis,
    });
  });

  dnsAnalysis.recommendations.forEach((rec) => {
    findings.push({
      id: rec.code,
      title: rec.title,
      severity: rec.severity,
      category: 'DNS Resolution',
      explanation: rec.explanation,
      evidence: `Primary: ${primaryDns || 'None'}, Secondary: ${secondaryDns || 'None'}`,
      recommendedFix: rec.recommendation,
      concept: 'DNS Resolver Architecture and High Availability',
      confidence: 'High',
      basis: rec.basis,
    });
  });

  // --------------------------------------------------------------------------
  // Rule 10: Local Gateway Reported Unreachable
  // --------------------------------------------------------------------------
  if (obs.canReachGateway === 'no') {
    findings.push({
      id: 'ERR_GATEWAY_UNREACHABLE_OBSERVED',
      title: 'Local Default Gateway Unreachable (Layer 1/2 Failure)',
      severity: 'Critical',
      category: 'Physical / Data Link',
      explanation:
        'The host reported that it cannot reach (ping/ARP) the local default gateway. If the local gateway is unreachable, no traffic can traverse beyond the local broadcast domain. This typically indicates a disconnected Ethernet cable, inactive Wi-Fi association, incorrect VLAN, IP address conflict, or the router being powered off.',
      evidence: `Can Reach Gateway Observation: NO | Configured Gateway: ${gateway || 'None'}`,
      recommendedFix:
        '1. Verify physical link (link lights on NIC/switch, Wi-Fi SSID connected).\n2. Run `arp -a` to inspect if the router MAC address is resolving.\n3. Verify whether the gateway router interface is online and responding.\n4. Check for IP address collisions on the LAN.',
      concept: 'OSI Layer 1 (Physical) & Layer 2 (Data Link / ARP) Connectivity',
      confidence: 'High (Direct user observation)',
      basis: 'User observation',
    });
  }

  // --------------------------------------------------------------------------
  // Rule 11: IP connectivity works but website is inaccessible
  // --------------------------------------------------------------------------
  if (obs.canReachExternalIp === 'yes' && obs.canAccessWeb === 'no') {
    findings.push({
      id: 'ERR_WEB_ACCESS_FAILURE_WITH_IP_OK',
      title: 'HTTP/HTTPS Web Inaccessible Despite Active IP Routing',
      severity: 'High',
      category: 'Application Layer',
      explanation:
        'External IP communication is functional, but web browsing (HTTP port 80 / HTTPS port 443) fails. Because lower-layer routing (Layers 1-3) works, this isolates the issue to Layer 4 (firewall port filtering/TCP reset) or Layer 7 (TLS certificate mismatch, corporate proxy, captive portal, or web server outage).',
      evidence: `Can Reach External IP: YES | Can Access Website: NO`,
      recommendedFix:
        '1. Check whether a firewall or security software blocks outbound TCP ports 80/443.\n2. Verify if a proxy or captive portal requires authentication.\n3. Test the web server directly with `curl -v https://<target>` or `Test-NetConnection -Port 443`.\n4. Check if DNS resolution is failing for that specific web domain.',
      concept: 'OSI Layer 4 (Transport / TCP Port 80/443) and Layer 7 (Application)',
      confidence: 'High (Decoupled Layer 3 vs Layer 7 observation)',
      basis: 'User observation',
    });
  }

  // --------------------------------------------------------------------------
  // Rule 14: No Obvious Configuration Error Detected
  // --------------------------------------------------------------------------
  const criticalCount = findings.filter((f) => f.severity === 'Critical').length;
  const highCount = findings.filter((f) => f.severity === 'High').length;
  const mediumCount = findings.filter((f) => f.severity === 'Medium').length;

  if (findings.length === 0 || (criticalCount === 0 && highCount === 0 && mediumCount === 0)) {
    findings.unshift({
      id: 'STATUS_ALL_CHECKS_PASSED',
      title: 'No Obvious Configuration Errors Detected',
      severity: 'Informational',
      category: 'Overall Assessment',
      explanation:
        'The supplied IPv4 address, subnet mask, default gateway, and DNS configuration appear syntactically and logically consistent. Subnet containment and routing rules are mathematically valid.',
      evidence: `IP: ${ip}, Mask: ${mask}, Gateway: ${gateway || 'Not set'}, DNS: ${primaryDns || 'Not set'}`,
      recommendedFix:
        'Configuration parameters are sound. If real-world issues persist, inspect physical wiring, upstream ISP connection, router NAT tables, or firewall filtering.',
      concept: 'End-to-End IPv4 Parameter Validation',
      confidence: 'High (Rule engine verification)',
      basis: 'Configuration analysis',
    });
  }

  // Deduplicate findings by id
  const uniqueFindings = [];
  const seenIds = new Set();
  for (const f of findings) {
    if (!seenIds.has(f.id)) {
      seenIds.add(f.id);
      uniqueFindings.push(f);
    }
  }

  // Determine overall status
  let overallStatus = 'Healthy';
  if (criticalCount > 0) {
    overallStatus = 'Critical';
  } else if (highCount > 0) {
    overallStatus = 'Warning';
  } else if (mediumCount > 0) {
    overallStatus = 'Needs Attention';
  } else if (missingCoreFields.length > 0) {
    overallStatus = 'Incomplete';
  }

  // Generate actionable troubleshooting checklist
  uniqueFindings
    .filter((f) => f.severity === 'Critical' || f.severity === 'High' || f.severity === 'Medium')
    .forEach((f, idx) => {
      checklist.push({
        step: idx + 1,
        title: f.title,
        severity: f.severity,
        action: f.recommendedFix,
        completed: false,
      });
    });

  if (checklist.length === 0) {
    checklist.push({
      step: 1,
      title: 'Verify Physical Link & Upstream Status',
      severity: 'Informational',
      action: 'Confirm network cables/Wi-Fi signal and test ping to a known public IP (e.g. 8.8.8.8).',
      completed: false,
    });
  }

  return {
    id: `diag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    deviceName: deviceName.trim() || 'Host Device',
    inputConfig: {
      ip,
      mask,
      gateway,
      primaryDns,
      secondaryDns,
      destinationIp,
      destinationHostname,
      observations: obs,
      sourceMode,
    },
    diagnosticBasis,
    overallStatus,
    stats: {
      total: uniqueFindings.length,
      critical: uniqueFindings.filter((f) => f.severity === 'Critical').length,
      high: uniqueFindings.filter((f) => f.severity === 'High').length,
      medium: uniqueFindings.filter((f) => f.severity === 'Medium').length,
      low: uniqueFindings.filter((f) => f.severity === 'Low').length,
      informational: uniqueFindings.filter((f) => f.severity === 'Informational').length,
    },
    subnetInfo,
    destLocality,
    findings: uniqueFindings,
    checklist,
  };
}
