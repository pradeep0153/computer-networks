/**
 * IPv4 Address Validation and Manipulation Utilities
 * Safe unsigned 32-bit arithmetic, RFC compliance, and address classification.
 */

/**
 * Validates a dotted-decimal IPv4 address string.
 * @param {string} ip - The IPv4 string to validate.
 * @returns {{ isValid: boolean, error?: string, octets?: number[] }}
 */
export function validateIPv4(ip) {
  if (typeof ip !== 'string') {
    return { isValid: false, error: 'IPv4 address must be a string.' };
  }

  const trimmed = ip.trim();
  if (!trimmed) {
    return { isValid: false, error: 'IPv4 address cannot be empty.' };
  }

  // Check for invalid characters or whitespace
  if (/\s/.test(trimmed)) {
    return { isValid: false, error: 'IPv4 address cannot contain whitespace.' };
  }

  const parts = trimmed.split('.');
  if (parts.length !== 4) {
    return {
      isValid: false,
      error: `IPv4 address must contain exactly 4 octets separated by dots (found ${parts.length}).`,
    };
  }

  const octets = [];
  for (let i = 0; i < 4; i++) {
    const part = parts[i];

    if (part === '') {
      return { isValid: false, error: `Octet ${i + 1} is empty.` };
    }

    // Check if it's purely digits
    if (!/^\d+$/.test(part)) {
      return { isValid: false, error: `Octet ${i + 1} ("${part}") contains non-numeric characters.` };
    }

    // Reject leading zeros (e.g. "01", "007") to prevent ambiguous octal interpretation
    if (part.length > 1 && part.startsWith('0')) {
      return {
        isValid: false,
        error: `Octet ${i + 1} ("${part}") has leading zeros. Dotted-decimal octets cannot have leading zeros.`,
      };
    }

    const num = Number(part);
    if (!Number.isInteger(num) || num < 0 || num > 255) {
      return {
        isValid: false,
        error: `Octet ${i + 1} ("${part}") is out of valid range (0-255).`,
      };
    }

    octets.push(num);
  }

  return { isValid: true, octets };
}

/**
 * Helper returning boolean for simple checks.
 */
export function isValidIPv4(ip) {
  return validateIPv4(ip).isValid;
}

/**
 * Converts a validated IPv4 string into an unsigned 32-bit integer.
 * Avoids JavaScript signed 32-bit bitwise overflow by using unsigned right shift `>>> 0`.
 * @param {string} ip
 * @returns {number|null} Unsigned 32-bit integer or null if invalid
 */
export function ipv4ToUint32(ip) {
  const validation = validateIPv4(ip);
  if (!validation.isValid) return null;

  const [a, b, c, d] = validation.octets;
  // Use >>> 0 at the end to guarantee an unsigned 32-bit number
  return (((a << 24) | (b << 16) | (c << 8) | d) >>> 0);
}

/**
 * Converts an unsigned 32-bit integer back to a dotted-decimal IPv4 string.
 * @param {number} uint32
 * @returns {string}
 */
export function uint32ToIPv4(uint32) {
  if (typeof uint32 !== 'number' || isNaN(uint32) || uint32 < 0 || uint32 > 0xffffffff) {
    throw new Error('Invalid unsigned 32-bit integer for IPv4 conversion.');
  }

  const u = uint32 >>> 0;
  const a = (u >>> 24) & 255;
  const b = (u >>> 16) & 255;
  const c = (u >>> 8) & 255;
  const d = u & 255;

  return `${a}.${b}.${c}.${d}`;
}

/**
 * Classifies an IPv4 address according to IANA / RFC specifications.
 * @param {string} ip
 * @returns {{ type: string, description: string, isRoutable: boolean }}
 */
export function classifyIPv4Address(ip) {
  const u = ipv4ToUint32(ip);
  if (u === null) {
    return { type: 'Invalid', description: 'Invalid IPv4 address format', isRoutable: false };
  }

  const [a, b] = validateIPv4(ip).octets;

  // 0.0.0.0/8 - Unspecified / "This network" (RFC 1122)
  if (a === 0) {
    return {
      type: 'Unspecified / Default Route',
      description: 'Used as source address during initialization (DHCP) or default route indicator.',
      isRoutable: false,
    };
  }

  // 127.0.0.0/8 - Loopback (RFC 1122)
  if (a === 127) {
    return {
      type: 'Loopback',
      description: 'Internal host loopback address (e.g. localhost). Packets never leave the host NIC.',
      isRoutable: false,
    };
  }

  // 169.254.0.0/16 - Link-Local / APIPA (RFC 3927)
  if (a === 169 && b === 254) {
    return {
      type: 'Link-Local / APIPA',
      description: 'Automatic Private IP Addressing. Typically assigned when a DHCP server fails to respond.',
      isRoutable: false,
    };
  }

  // 10.0.0.0/8 - Private Class A (RFC 1918)
  if (a === 10) {
    return {
      type: 'Private (RFC 1918)',
      description: 'Class A Private network range, not routable on the public Internet.',
      isRoutable: true,
    };
  }

  // 172.16.0.0/12 - Private Class B (RFC 1918)
  if (a === 172 && b >= 16 && b <= 31) {
    return {
      type: 'Private (RFC 1918)',
      description: 'Class B Private network range, not routable on the public Internet.',
      isRoutable: true,
    };
  }

  // 192.168.0.0/16 - Private Class C (RFC 1918)
  if (a === 192 && b === 168) {
    return {
      type: 'Private (RFC 1918)',
      description: 'Class C Private network range commonly used in home and office LANs.',
      isRoutable: true,
    };
  }

  // 224.0.0.0/4 - Multicast (RFC 5771)
  if (a >= 224 && a <= 239) {
    return {
      type: 'Multicast (Class D)',
      description: 'Reserved for IPv4 multicast group communication.',
      isRoutable: false,
    };
  }

  // 240.0.0.0/4 - Reserved (Class E)
  if (a >= 240 && a <= 255) {
    if (ip === '255.255.255.255') {
      return {
        type: 'Limited Broadcast',
        description: 'Broadcast address for the current local network.',
        isRoutable: false,
      };
    }
    return {
      type: 'Reserved (Class E)',
      description: 'Reserved for experimental use / future purposes.',
      isRoutable: false,
    };
  }

  // Public IP
  return {
    type: 'Public (Globally Routable)',
    description: 'Public Internet IPv4 address routable across global Autonomous Systems.',
    isRoutable: true,
  };
}
