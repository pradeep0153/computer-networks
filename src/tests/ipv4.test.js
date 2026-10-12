import { describe, it, expect } from 'vitest';
import {
  validateIPv4,
  isValidIPv4,
  ipv4ToUint32,
  uint32ToIPv4,
  classifyIPv4Address,
} from '../utils/ipv4.js';

describe('IPv4 Address Validation and Utilities', () => {
  describe('validateIPv4', () => {
    it('accepts standard dotted-decimal IPv4 addresses', () => {
      expect(validateIPv4('192.168.1.1').isValid).toBe(true);
      expect(validateIPv4('10.0.0.1').isValid).toBe(true);
      expect(validateIPv4('172.16.254.1').isValid).toBe(true);
      expect(validateIPv4('0.0.0.0').isValid).toBe(true);
      expect(validateIPv4('255.255.255.255').isValid).toBe(true);
    });

    it('rejects incomplete addresses (less than 4 octets)', () => {
      expect(validateIPv4('192.168.1').isValid).toBe(false);
      expect(validateIPv4('10.0').isValid).toBe(false);
      expect(validateIPv4('172').isValid).toBe(false);
      expect(validateIPv4('192.168.1.').isValid).toBe(false);
    });

    it('rejects addresses with more than 4 octets', () => {
      expect(validateIPv4('192.168.1.1.1').isValid).toBe(false);
    });

    it('rejects octets out of range 0–255', () => {
      expect(validateIPv4('256.0.0.1').isValid).toBe(false);
      expect(validateIPv4('192.168.1.300').isValid).toBe(false);
      expect(validateIPv4('192.168.-1.1').isValid).toBe(false);
    });

    it('rejects non-numeric characters and symbols', () => {
      expect(validateIPv4('192.168.1.abc').isValid).toBe(false);
      expect(validateIPv4('192.168.1.1a').isValid).toBe(false);
      expect(validateIPv4('192.168..1').isValid).toBe(false);
      expect(validateIPv4('192.168.1. 1').isValid).toBe(false);
    });

    it('rejects leading zeros to prevent octal ambiguity', () => {
      expect(validateIPv4('192.168.01.1').isValid).toBe(false);
      expect(validateIPv4('010.0.0.1').isValid).toBe(false);
      expect(validateIPv4('192.168.1.00').isValid).toBe(false);
      // Valid single zero is permitted
      expect(validateIPv4('192.168.0.1').isValid).toBe(true);
    });

    it('rejects empty and whitespace inputs', () => {
      expect(validateIPv4('').isValid).toBe(false);
      expect(validateIPv4('   ').isValid).toBe(false);
      expect(validateIPv4(null).isValid).toBe(false);
    });
  });

  describe('ipv4ToUint32 and uint32ToIPv4', () => {
    it('converts correctly and avoids signed integer overflow', () => {
      // 255.255.255.255 as unsigned 32-bit should be 4294967295, not -1
      const uint = ipv4ToUint32('255.255.255.255');
      expect(uint).toBe(4294967295);
      expect(uint32ToIPv4(uint)).toBe('255.255.255.255');

      const u0 = ipv4ToUint32('0.0.0.0');
      expect(u0).toBe(0);
      expect(uint32ToIPv4(u0)).toBe('0.0.0.0');

      const u192 = ipv4ToUint32('192.168.1.1');
      expect(uint32ToIPv4(u192)).toBe('192.168.1.1');
    });
  });

  describe('classifyIPv4Address', () => {
    it('identifies RFC 1918 private classes', () => {
      expect(classifyIPv4Address('10.5.20.1').type).toContain('Private');
      expect(classifyIPv4Address('172.20.1.1').type).toContain('Private');
      expect(classifyIPv4Address('192.168.1.50').type).toContain('Private');
    });

    it('identifies Loopback', () => {
      expect(classifyIPv4Address('127.0.0.1').type).toBe('Loopback');
    });

    it('identifies APIPA / Link-Local', () => {
      expect(classifyIPv4Address('169.254.12.34').type).toContain('Link-Local / APIPA');
    });

    it('identifies Multicast and Public addresses', () => {
      expect(classifyIPv4Address('224.0.0.1').type).toContain('Multicast');
      expect(classifyIPv4Address('8.8.8.8').type).toContain('Public');
      expect(classifyIPv4Address('1.1.1.1').type).toContain('Public');
    });
  });
});
