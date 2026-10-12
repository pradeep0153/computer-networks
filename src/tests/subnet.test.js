import { describe, it, expect } from 'vitest';
import {
  validateSubnetMask,
  cidrToMask,
  maskToCIDR,
  calculateSubnetDetails,
  areInSameSubnet,
  classifyDestinationLocality,
} from '../utils/subnet.js';

describe('Subnet Mask Calculations and CIDR Utilities', () => {
  describe('validateSubnetMask', () => {
    it('accepts valid contiguous subnet masks', () => {
      expect(validateSubnetMask('255.255.255.0').isValid).toBe(true);
      expect(validateSubnetMask('255.255.0.0').isValid).toBe(true);
      expect(validateSubnetMask('255.0.0.0').isValid).toBe(true);
      expect(validateSubnetMask('255.255.255.128').isValid).toBe(true);
      expect(validateSubnetMask('255.255.255.252').isValid).toBe(true);
      expect(validateSubnetMask('255.255.255.254').isValid).toBe(true);
      expect(validateSubnetMask('255.255.255.255').isValid).toBe(true);
      expect(validateSubnetMask('0.0.0.0').isValid).toBe(true);
    });

    it('rejects non-contiguous masks (wildcards or invalid bit patterns)', () => {
      expect(validateSubnetMask('255.255.240.128').isValid).toBe(false);
      expect(validateSubnetMask('255.0.255.0').isValid).toBe(false);
      expect(validateSubnetMask('255.255.255.1').isValid).toBe(false);
      expect(validateSubnetMask('255.255.255.253').isValid).toBe(false);
    });

    it('correctly maps masks to CIDR prefixes', () => {
      expect(validateSubnetMask('255.255.255.0').cidr).toBe(24);
      expect(validateSubnetMask('255.255.255.192').cidr).toBe(26);
      expect(validateSubnetMask('255.255.255.254').cidr).toBe(31);
      expect(validateSubnetMask('255.255.255.255').cidr).toBe(32);
      expect(validateSubnetMask('0.0.0.0').cidr).toBe(0);
    });
  });

  describe('cidrToMask', () => {
    it('generates accurate dotted-decimal masks for CIDR ranges', () => {
      expect(cidrToMask(24)).toBe('255.255.255.0');
      expect(cidrToMask(16)).toBe('255.255.0.0');
      expect(cidrToMask(8)).toBe('255.0.0.0');
      expect(cidrToMask(30)).toBe('255.255.255.252');
      expect(cidrToMask(31)).toBe('255.255.255.254');
      expect(cidrToMask(32)).toBe('255.255.255.255');
      expect(cidrToMask(0)).toBe('0.0.0.0');
    });
  });

  describe('calculateSubnetDetails', () => {
    it('calculates standard /24 subnet properties correctly', () => {
      const result = calculateSubnetDetails('192.168.1.55', '255.255.255.0');
      expect(result).not.toBeNull();
      expect(result.networkAddress).toBe('192.168.1.0');
      expect(result.broadcastAddress).toBe('192.168.1.255');
      expect(result.usableHostsCount).toBe(254);
      expect(result.firstUsableHost).toBe('192.168.1.1');
      expect(result.lastUsableHost).toBe('192.168.1.254');
      expect(result.cidr).toBe(24);
      expect(result.isNetworkAddress).toBe(false);
      expect(result.isBroadcastAddress).toBe(false);
    });

    it('identifies when an IP is the network address or broadcast address', () => {
      const net = calculateSubnetDetails('192.168.1.0', '255.255.255.0');
      expect(net.isNetworkAddress).toBe(true);
      expect(net.isBroadcastAddress).toBe(false);

      const bcast = calculateSubnetDetails('192.168.1.255', '255.255.255.0');
      expect(bcast.isNetworkAddress).toBe(false);
      expect(bcast.isBroadcastAddress).toBe(true);
    });

    it('correctly handles RFC 3021 /31 point-to-point subnets', () => {
      const p2p = calculateSubnetDetails('198.51.100.14', '255.255.255.254');
      expect(p2p.cidr).toBe(31);
      expect(p2p.specialCaseType).toContain('Point-to-Point');
      expect(p2p.usableHostsCount).toBe(2);
      expect(p2p.firstUsableHost).toBe('198.51.100.14');
      expect(p2p.lastUsableHost).toBe('198.51.100.15');
    });

    it('correctly handles /32 host routes', () => {
      const hostRoute = calculateSubnetDetails('10.0.0.1', '255.255.255.255');
      expect(hostRoute.cidr).toBe(32);
      expect(hostRoute.specialCaseType).toContain('Host Route');
      expect(hostRoute.usableHostsCount).toBe(1);
      expect(hostRoute.networkAddress).toBe('10.0.0.1');
    });
  });

  describe('areInSameSubnet & classifyDestinationLocality', () => {
    it('accurately tests same-subnet membership without string comparison flaws', () => {
      // 192.168.1.10 and 192.168.1.250 on /24
      expect(areInSameSubnet('192.168.1.10', '255.255.255.0', '192.168.1.250')).toBe(true);

      // 192.168.1.10 and 192.168.2.10 on /24
      expect(areInSameSubnet('192.168.1.10', '255.255.255.0', '192.168.2.10')).toBe(false);

      // 10.0.0.1 and 10.0.128.5 on /16 -> same
      expect(areInSameSubnet('10.0.0.1', '255.255.0.0', '10.0.128.5')).toBe(true);

      // 10.0.0.1 and 10.0.128.5 on /24 -> different
      expect(areInSameSubnet('10.0.0.1', '255.255.255.0', '10.0.128.5')).toBe(false);
    });

    it('classifies direct Layer 2 vs indirect Layer 3 routing locality', () => {
      const local = classifyDestinationLocality('192.168.1.5', '255.255.255.0', '192.168.1.100');
      expect(local.isLocal).toBe(true);
      expect(local.description).toContain('Local Subnet');

      const remote = classifyDestinationLocality('192.168.1.5', '255.255.255.0', '8.8.8.8');
      expect(remote.isLocal).toBe(false);
      expect(remote.description).toContain('Remote Network');
    });
  });
});
