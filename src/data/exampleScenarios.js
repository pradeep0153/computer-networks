/**
 * Built-In Diagnostic Example Scenarios
 * Realistic network configurations that feed into the diagnostic engine.
 */

export const EXAMPLE_SCENARIOS = [
  {
    id: 'scenario-correct',
    title: '1. Correctly Configured Network',
    badge: 'Baseline / Healthy',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description:
      'Standard private LAN device configured with valid class C IPv4, /24 subnet mask, on-subnet gateway, reliable public DNS, and successful connectivity.',
    expectedOutcome:
      'Engine reports "No Obvious Configuration Errors Detected", healthy status, direct/indirect route calculations valid.',
    data: {
      deviceName: 'Engineering Workstation 01',
      ip: '192.168.1.45',
      mask: '255.255.255.0',
      gateway: '192.168.1.1',
      primaryDns: '8.8.8.8',
      secondaryDns: '1.1.1.1',
      destinationIp: '142.250.190.46',
      destinationHostname: 'google.com',
      observations: {
        canReachGateway: 'yes',
        canReachExternalIp: 'yes',
        canResolveDomain: 'yes',
        canAccessWeb: 'yes',
      },
      sourceMode: 'Simulated test',
    },
  },
  {
    id: 'scenario-invalid-ip',
    title: '2. Invalid IPv4 Address Format',
    badge: 'Syntax Error',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    description:
      'A typographical error in the host IP address where an octet exceeds the 0-255 boundary (e.g., 192.168.1.300) and contains leading zeroes.',
    expectedOutcome:
      'Flagged as Critical: Octet out of bounds (0-255). Subnet calculations safely halted until valid IP is supplied.',
    data: {
      deviceName: 'Lab PC - Desk 4',
      ip: '192.168.1.300',
      mask: '255.255.255.0',
      gateway: '192.168.1.1',
      primaryDns: '8.8.8.8',
      secondaryDns: '',
      destinationIp: '8.8.8.8',
      destinationHostname: '',
      observations: {
        canReachGateway: 'no',
        canReachExternalIp: 'no',
        canResolveDomain: 'untested',
        canAccessWeb: 'untested',
      },
      sourceMode: 'Simulated test',
    },
  },
  {
    id: 'scenario-bad-mask',
    title: '3. Incorrect / Non-Contiguous Subnet Mask',
    badge: 'Subnet Error',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    description:
      'A student accidentally typed 255.255.240.128 as a subnet mask, resulting in non-contiguous 1s and 0s in the binary representation.',
    expectedOutcome:
      'Flagged as Critical: Mask bits must be contiguous ones followed by zeros. Explains mathematical subnet mask rules.',
    data: {
      deviceName: 'Student Laptop (Wi-Fi)',
      ip: '10.0.5.22',
      mask: '255.255.240.128',
      gateway: '10.0.5.1',
      primaryDns: '10.0.0.2',
      secondaryDns: '10.0.0.3',
      destinationIp: '10.0.5.100',
      destinationHostname: 'intranet.local',
      observations: {
        canReachGateway: 'no',
        canReachExternalIp: 'untested',
        canResolveDomain: 'untested',
        canAccessWeb: 'untested',
      },
      sourceMode: 'Simulated test',
    },
  },
  {
    id: 'scenario-offsubnet-gw',
    title: '4. Gateway Outside the Expected Subnet',
    badge: 'Routing Mismatch',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    description:
      'The host IP is configured as 192.168.1.50/24, but the default gateway is set to 192.168.2.1. In a conventional LAN, the host cannot ARP for an off-subnet gateway.',
    expectedOutcome:
      'Flagged as Critical/High: Gateway outside local subnet (192.168.1.0/24 vs 192.168.2.0/24). Highlights Layer 2 ARP next-hop principle.',
    data: {
      deviceName: 'Sales Department Desktop',
      ip: '192.168.1.50',
      mask: '255.255.255.0',
      gateway: '192.168.2.1',
      primaryDns: '1.1.1.1',
      secondaryDns: '8.8.8.8',
      destinationIp: '93.184.216.34',
      destinationHostname: 'example.com',
      observations: {
        canReachGateway: 'no',
        canReachExternalIp: 'no',
        canResolveDomain: 'no',
        canAccessWeb: 'no',
      },
      sourceMode: 'Simulated test',
    },
  },
  {
    id: 'scenario-dns-failure',
    title: '5. DNS Failure While External IP Connectivity Works',
    badge: 'Layer 7 DNS Isolation',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description:
      'The host can ping 8.8.8.8 and external servers, but cannot resolve any domain names (e.g. google.com). Primary DNS is either unreachable or misconfigured.',
    expectedOutcome:
      'High finding: Decoupled IP routing vs. DNS resolution. Recommends testing with nslookup/dig, verifying port 53, or changing DNS server.',
    data: {
      deviceName: 'Development Server VM',
      ip: '172.16.10.80',
      mask: '255.255.255.0',
      gateway: '172.16.10.1',
      primaryDns: '192.0.2.53', // Documentation test IP / unreachable
      secondaryDns: '',
      destinationIp: '8.8.8.8',
      destinationHostname: 'github.com',
      observations: {
        canReachGateway: 'yes',
        canReachExternalIp: 'yes',
        canResolveDomain: 'no',
        canAccessWeb: 'no',
      },
      sourceMode: 'Simulated test',
    },
  },
  {
    id: 'scenario-gateway-unreachable',
    title: '6. Gateway Unreachable & External Connectivity Down',
    badge: 'Layer 1/2 Physical/Link Issue',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    description:
      'Valid IP, mask, and gateway settings, but user cannot ping the default gateway or reach anything external. Demonstrates that valid math != working physical wire.',
    expectedOutcome:
      'Critical finding: Local gateway unreachable. Isolates root cause to Layer 1/2 (unplugged cable, Wi-Fi disassociation, router offline, or ARP failure).',
    data: {
      deviceName: 'Accounting Terminal',
      ip: '10.10.20.15',
      mask: '255.255.255.0',
      gateway: '10.10.20.1',
      primaryDns: '10.10.20.1',
      secondaryDns: '8.8.8.8',
      destinationIp: '1.1.1.1',
      destinationHostname: 'portal.company.com',
      observations: {
        canReachGateway: 'no',
        canReachExternalIp: 'no',
        canResolveDomain: 'no',
        canAccessWeb: 'no',
      },
      sourceMode: 'Simulated test',
    },
  },
  {
    id: 'scenario-point-to-point',
    title: '7. Point-to-Point /31 Link (RFC 3021 Special Case)',
    badge: 'Advanced Subnetting',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    description:
      'Point-to-point router interconnection using a 31-bit subnet mask (/31, 255.255.255.254), where traditional network and broadcast addresses do not exist.',
    expectedOutcome:
      'Recognized as RFC 3021 Point-to-Point link. Accurately calculates 2 usable endpoints without erroneously flagging network/broadcast collision.',
    data: {
      deviceName: 'Core Router Interface Gi0/0/1',
      ip: '198.51.100.14',
      mask: '255.255.255.254',
      gateway: '198.51.100.15',
      primaryDns: '1.1.1.1',
      secondaryDns: '8.8.8.8',
      destinationIp: '198.51.100.15',
      destinationHostname: '',
      observations: {
        canReachGateway: 'yes',
        canReachExternalIp: 'yes',
        canResolveDomain: 'untested',
        canAccessWeb: 'untested',
      },
      sourceMode: 'Simulated test',
    },
  },
  {
    id: 'scenario-web-blocked',
    title: '8. Web Inaccessible (Port 80/443 Blocked) While IP & DNS Work',
    badge: 'Layer 4/7 Filtering',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
    description:
      'Host can reach the gateway, ping external IPs, and resolve domains, but loading the webpage fails. Indicates firewall port filtering, proxy, or captive portal.',
    expectedOutcome:
      'High finding: Application layer or transport port block. Isolates lower layers as healthy and guides user to check firewall, proxy, or TLS.',
    data: {
      deviceName: 'Guest Laptop',
      ip: '192.168.50.112',
      mask: '255.255.255.0',
      gateway: '192.168.50.1',
      primaryDns: '192.168.50.1',
      secondaryDns: '8.8.4.4',
      destinationIp: '142.250.190.78',
      destinationHostname: 'captive.wifi.org',
      observations: {
        canReachGateway: 'yes',
        canReachExternalIp: 'yes',
        canResolveDomain: 'yes',
        canAccessWeb: 'no',
      },
      sourceMode: 'Simulated test',
    },
  },
];
