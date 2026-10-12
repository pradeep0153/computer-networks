/**
 * Default Gateway Analysis Utility
 * Analyzes gateway syntax, subnet locality, routing implications, and reachability caveats.
 */

import { validateIPv4 } from './ipv4.js';
import { validateSubnetMask, areInSameSubnet, calculateSubnetDetails } from './subnet.js';

/**
 * Analyzes the default gateway in relation to the host IP, subnet mask, and destination.
 * @param {object} params
 * @param {string} params.ip - Host device IP
 * @param {string} params.mask - Subnet mask
 * @param {string} params.gateway - Default gateway IP
 * @param {string} [params.destinationIp] - Optional target IP
 * @returns {object} Analysis findings and metadata
 */
export function analyzeDefaultGateway({ ip, mask, gateway, destinationIp }) {
  const issues = [];
  const notes = [];

  // 1. Missing gateway check
  if (!gateway || gateway.trim() === '') {
    return {
      isValid: false,
      isConfigured: false,
      issues: [
        {
          code: 'GATEWAY_MISSING',
          title: 'Default Gateway Not Configured',
          severity: destinationIp ? 'High' : 'Medium',
          explanation:
            'No default gateway IP address has been specified. A gateway is essential for any outbound packet targeted outside the local broadcast domain.',
          recommendation:
            'If this host needs access to external networks or the Internet, configure the IPv4 address of the local router/gateway interface.',
        },
      ],
      notes: [
        'Hosts without a default gateway can only communicate with other machines residing on the exact same local subnet.',
      ],
      isSameSubnet: false,
    };
  }

  const trimmedGateway = gateway.trim();

  // 2. Format validation
  const gwValidation = validateIPv4(trimmedGateway);
  if (!gwValidation.isValid) {
    return {
      isValid: false,
      isConfigured: true,
      issues: [
        {
          code: 'GATEWAY_INVALID_FORMAT',
          title: 'Invalid Gateway IPv4 Address Format',
          severity: 'Critical',
          explanation: `The configured gateway address "${trimmedGateway}" is not a valid IPv4 address: ${gwValidation.error}`,
          recommendation:
            'Enter a valid dotted-decimal IPv4 address in the range 0.0.0.0 to 255.255.255.255 for the gateway.',
        },
      ],
      notes: [],
      isSameSubnet: false,
    };
  }

  // 3. Gateway equals device IP
  if (ip && ip.trim() === trimmedGateway) {
    issues.push({
      code: 'GATEWAY_EQUALS_HOST_IP',
      title: 'Gateway Address Identical to Host IP',
      severity: 'Critical',
      explanation: `The default gateway (${trimmedGateway}) is set to the host's own IPv4 address. A host cannot act as its own default gateway unless running complex virtual routing/forwarding on separate interfaces.`,
      recommendation:
        'Update the default gateway to the IP address of your upstream router (typically .1 or .254 in small LANs).',
    });
  }

  // 4. Subnet containment check
  let isSameSubnet = false;
  const ipValidation = validateIPv4(ip);
  const maskValidation = validateSubnetMask(mask);

  if (ipValidation.isValid && maskValidation.isValid) {
    isSameSubnet = areInSameSubnet(ip, mask, trimmedGateway);
    const subnetInfo = calculateSubnetDetails(ip, mask);

    if (!isSameSubnet) {
      issues.push({
        code: 'GATEWAY_OUTSIDE_LOCAL_SUBNET',
        title: 'Gateway Outside Configured Local Subnet',
        severity: 'Critical',
        explanation: `The gateway (${trimmedGateway}) is not in the host's local subnet (${subnetInfo ? subnetInfo.fullCidrNotation : 'unknown'}). For standard broadcast networks (Ethernet/Wi-Fi), a host cannot reach an off-subnet gateway without an existing route, creating an ARP resolution catch-22.`,
        recommendation:
          `Ensure the gateway shares the same network prefix (${subnetInfo ? subnetInfo.networkAddress : ''}) or correct the host subnet mask.`,
      });
    } else {
      // Gateway is in same subnet
      // Check if gateway is equal to network ID or broadcast ID
      if (subnetInfo) {
        if (trimmedGateway === subnetInfo.networkAddress && subnetInfo.cidr < 31) {
          issues.push({
            code: 'GATEWAY_IS_NETWORK_ADDRESS',
            title: 'Gateway Address Matches Subnet Network ID',
            severity: 'High',
            explanation: `The gateway address (${trimmedGateway}) is the network identifier for ${subnetInfo.fullCidrNotation}, which is generally unusable as a host or router interface in standard subnets.`,
            recommendation: 'Assign a valid host IP from within the usable subnet range.',
          });
        } else if (trimmedGateway === subnetInfo.broadcastAddress && subnetInfo.cidr < 31) {
          issues.push({
            code: 'GATEWAY_IS_BROADCAST_ADDRESS',
            title: 'Gateway Address Matches Subnet Broadcast ID',
            severity: 'High',
            explanation: `The gateway address (${trimmedGateway}) matches the directed broadcast address for ${subnetInfo.fullCidrNotation}. Directed broadcast addresses cannot be assigned to host or router interfaces.`,
            recommendation: 'Configure the gateway with a valid host IP from the usable subnet range.',
          });
        }
      }
    }
  }

  // Add academic caveat note
  notes.push(
    'Important Networking Principle: Even when the default gateway is mathematically inside the local subnet, this does not guarantee physical or Layer-2 reachability. The router must be powered on, physically cabled, and responding to ARP requests.'
  );

  return {
    isValid: issues.filter((i) => i.severity === 'Critical').length === 0,
    isConfigured: true,
    gateway: trimmedGateway,
    isSameSubnet,
    issues,
    notes,
  };
}
