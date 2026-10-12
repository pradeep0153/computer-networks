/**
 * Subnet Mask Validation and IPv4 CIDR Subnetting Calculations
 * Adheres to standard RFC 791, RFC 4632 (CIDR), and RFC 3021 (/31 Point-to-Point).
 */

import { validateIPv4, ipv4ToUint32, uint32ToIPv4 } from './ipv4.js';

/**
 * Valid subnet mask values in any single octet.
 */
const VALID_MASK_OCTETS = [255, 254, 252, 248, 240, 224, 192, 128, 0];

/**
 * Validates a subnet mask. Must be dotted decimal with contiguous 1s followed by contiguous 0s.
 * @param {string} mask - e.g. "255.255.255.0"
 * @returns {{ isValid: boolean, error?: string, cidr?: number, maskUint32?: number }}
 */
export function validateSubnetMask(mask) {
  const ipCheck = validateIPv4(mask);
  if (!ipCheck.isValid) {
    return {
      isValid: false,
      error: `Invalid subnet mask format: ${ipCheck.error}`,
    };
  }

  const octets = ipCheck.octets;

  // Check each octet against allowed values
  for (let i = 0; i < 4; i++) {
    if (!VALID_MASK_OCTETS.includes(octets[i])) {
      return {
        isValid: false,
        error: `Octet ${i + 1} (${octets[i]}) is not a valid subnet mask octet. Valid octet values are: 255, 254, 252, 248, 240, 224, 192, 128, 0.`,
      };
    }
  }

  const maskUint32 = ipv4ToUint32(mask);

  // Check contiguity in binary: A contiguous mask inverted and plus 1 must be a power of 2
  // Or binary string check: starts with 1* then 0*
  const binaryStr = (maskUint32 >>> 0).toString(2).padStart(32, '0');
  const contiguousRegex = /^1*0*$/;
  if (!contiguousRegex.test(binaryStr)) {
    return {
      isValid: false,
      error: 'Subnet mask bits must be contiguous (consecutive ones followed by consecutive zeros). Non-contiguous wildcard masks are not standard subnet masks.',
    };
  }

  // Count leading 1s to determine CIDR
  const cidr = binaryStr.indexOf('0') === -1 ? 32 : binaryStr.indexOf('0');

  return {
    isValid: true,
    cidr,
    maskUint32,
  };
}

/**
 * Converts a CIDR prefix (0-32) to dotted-decimal subnet mask string.
 * @param {number} cidr
 * @returns {string}
 */
export function cidrToMask(cidr) {
  if (typeof cidr !== 'number' || cidr < 0 || cidr > 32 || !Number.isInteger(cidr)) {
    throw new Error('CIDR prefix must be an integer between 0 and 32.');
  }

  if (cidr === 0) return '0.0.0.0';
  const maskUint = ((0xffffffff << (32 - cidr)) >>> 0);
  return uint32ToIPv4(maskUint);
}

/**
 * Converts dotted-decimal subnet mask to CIDR prefix number.
 * @param {string} mask
 * @returns {number|null}
 */
export function maskToCIDR(mask) {
  const result = validateSubnetMask(mask);
  return result.isValid ? result.cidr : null;
}

/**
 * Calculates complete subnet details for an IP and subnet mask.
 * @param {string} ip
 * @param {string} mask
 * @returns {object|null} Subnet calculation results or null if invalid inputs
 */
export function calculateSubnetDetails(ip, mask) {
  const ipCheck = validateIPv4(ip);
  const maskCheck = validateSubnetMask(mask);

  if (!ipCheck.isValid || !maskCheck.isValid) {
    return null;
  }

  const ipUint = ipv4ToUint32(ip);
  const maskUint = maskCheck.maskUint32;
  const cidr = maskCheck.cidr;

  // Unsigned bitwise AND for network address
  const networkUint = (ipUint & maskUint) >>> 0;
  const networkAddress = uint32ToIPv4(networkUint);

  // Wildcard mask = ~maskUint >>> 0
  const wildcardUint = (~maskUint) >>> 0;
  const wildcardMask = uint32ToIPv4(wildcardUint);

  // Broadcast address = networkUint | wildcardUint
  const broadcastUint = (networkUint | wildcardUint) >>> 0;
  const broadcastAddress = uint32ToIPv4(broadcastUint);

  const totalAddresses = Math.pow(2, 32 - cidr);

  let usableHostsCount = 0;
  let firstUsableHost = null;
  let lastUsableHost = null;
  let specialCaseType = 'Standard';
  let specialCaseExplanation = '';

  if (cidr === 32) {
    // Single host route / Loopback
    specialCaseType = 'Host Route (/32)';
    usableHostsCount = 1;
    firstUsableHost = ip;
    lastUsableHost = ip;
    specialCaseExplanation =
      'A /32 prefix designates a single host route or loopback address. There are no separate network or broadcast addresses on this link.';
  } else if (cidr === 31) {
    // RFC 3021 Point-to-Point Link
    specialCaseType = 'Point-to-Point Link (/31, RFC 3021)';
    usableHostsCount = 2;
    firstUsableHost = networkAddress;
    lastUsableHost = broadcastAddress;
    specialCaseExplanation =
      'RFC 3021 enables /31 subnets on point-to-point router links. Both addresses (network and broadcast in standard notation) are usable host endpoints, conserving IPv4 space.';
  } else if (cidr === 0) {
    // Default Route / Entire IPv4 Space
    specialCaseType = 'Default Route (/0)';
    usableHostsCount = 4294967294; // 2^32 - 2
    firstUsableHost = '0.0.0.1';
    lastUsableHost = '255.255.255.254';
    specialCaseExplanation =
      'A /0 mask matches all IPv4 addresses (0.0.0.0/0). Used for default gateway routing across the entire Internet.';
  } else {
    // Standard subnet /1 to /30
    usableHostsCount = Math.max(0, totalAddresses - 2);
    firstUsableHost = uint32ToIPv4((networkUint + 1) >>> 0);
    lastUsableHost = uint32ToIPv4((broadcastUint - 1) >>> 0);
    specialCaseExplanation = `Standard subnet accommodating up to ${usableHostsCount.toLocaleString()} usable host interfaces (excluding network ID ${networkAddress} and broadcast ${broadcastAddress}).`;
  }

  // Check if IP is equal to network address or broadcast address
  const isNetworkAddress = (ipUint === networkUint);
  const isBroadcastAddress = (cidr < 31 && ipUint === broadcastUint);

  return {
    ip,
    mask,
    cidr,
    cidrNotation: `/${cidr}`,
    fullCidrNotation: `${networkAddress}/${cidr}`,
    networkAddress,
    broadcastAddress: cidr === 32 ? networkAddress : broadcastAddress,
    wildcardMask,
    totalAddresses,
    usableHostsCount,
    firstUsableHost,
    lastUsableHost,
    usableRange: usableHostsCount > 0 ? `${firstUsableHost} – ${lastUsableHost}` : 'N/A',
    isNetworkAddress,
    isBroadcastAddress,
    specialCaseType,
    specialCaseExplanation,
    binaryMask: (maskUint >>> 0).toString(2).padStart(32, '0').match(/.{8}/g).join('.'),
    binaryIp: (ipUint >>> 0).toString(2).padStart(32, '0').match(/.{8}/g).join('.'),
    binaryNetwork: (networkUint >>> 0).toString(2).padStart(32, '0').match(/.{8}/g).join('.'),
  };
}

/**
 * Determines whether two IPv4 addresses are in the same subnet given a subnet mask.
 * Uses exact unsigned integer arithmetic.
 * @param {string} ip1
 * @param {string} mask
 * @param {string} ip2
 * @returns {boolean}
 */
export function areInSameSubnet(ip1, mask, ip2) {
  const ip1Check = validateIPv4(ip1);
  const ip2Check = validateIPv4(ip2);
  const maskCheck = validateSubnetMask(mask);

  if (!ip1Check.isValid || !ip2Check.isValid || !maskCheck.isValid) {
    return false;
  }

  const u1 = ipv4ToUint32(ip1);
  const u2 = ipv4ToUint32(ip2);
  const m = maskCheck.maskUint32;

  return ((u1 & m) >>> 0) === ((u2 & m) >>> 0);
}

/**
 * Determines whether destination IP is local to the source IP according to the source's subnet mask.
 * @param {string} sourceIp
 * @param {string} mask
 * @param {string} destinationIp
 * @returns {{ isLocal: boolean, sourceNetwork: string, destNetwork: string, cidr: number }}
 */
export function classifyDestinationLocality(sourceIp, mask, destinationIp) {
  const isLocal = areInSameSubnet(sourceIp, mask, destinationIp);
  const maskCheck = validateSubnetMask(mask);
  const m = maskCheck.isValid ? maskCheck.maskUint32 : 0;
  const cidr = maskCheck.isValid ? maskCheck.cidr : 0;

  const srcU = ipv4ToUint32(sourceIp);
  const dstU = ipv4ToUint32(destinationIp);

  const sourceNetwork = srcU !== null && maskCheck.isValid ? uint32ToIPv4((srcU & m) >>> 0) : 'Unknown';
  const destNetwork = dstU !== null && maskCheck.isValid ? uint32ToIPv4((dstU & m) >>> 0) : 'Unknown';

  return {
    isLocal,
    sourceNetwork,
    destNetwork,
    cidr,
    description: isLocal
      ? `Local Subnet (${sourceNetwork}/${cidr}): Frames can be sent directly via Layer 2 Ethernet (ARP resolution).`
      : `Remote Network (${destNetwork}/${cidr}): Packets must be routed through the Default Gateway (Layer 3 forwarding).`,
  };
}
