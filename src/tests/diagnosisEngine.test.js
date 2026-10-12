import { describe, it, expect, beforeEach } from 'vitest';
import { runDiagnosis } from '../utils/diagnosisEngine.js';
import { analyzeDefaultGateway } from '../utils/gateway.js';
import { escapeCsvField, generateDiagnosisCSV } from '../utils/reportExport.js';
import {
  getDiagnosisHistory,
  saveDiagnosis,
  deleteDiagnosis,
  clearDiagnosisHistory,
} from '../utils/storage.js';

describe('Diagnostic Troubleshooting Engine & Platform Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Rule-Based Diagnostics', () => {
    it('Scenario 1: Evaluates correctly configured network with zero critical/high errors', () => {
      const result = runDiagnosis({
        deviceName: 'Host-01',
        ip: '192.168.1.50',
        mask: '255.255.255.0',
        gateway: '192.168.1.1',
        primaryDns: '8.8.8.8',
        destinationIp: '8.8.4.4',
        observations: {
          canReachGateway: 'yes',
          canReachExternalIp: 'yes',
          canResolveDomain: 'yes',
          canAccessWeb: 'yes',
        },
      });

      expect(result.overallStatus).toBe('Healthy');
      expect(result.stats.critical).toBe(0);
      expect(result.stats.high).toBe(0);
      expect(result.findings.some((f) => f.id === 'STATUS_ALL_CHECKS_PASSED')).toBe(true);
      expect(result.destLocality.isLocal).toBe(false); // 8.8.4.4 is remote from 192.168.1.0/24
    });

    it('Scenario 2: Detects invalid local IPv4 address and halts invalid calculations', () => {
      const result = runDiagnosis({
        ip: '192.168.1.300',
        mask: '255.255.255.0',
        gateway: '192.168.1.1',
      });

      expect(result.stats.critical).toBeGreaterThan(0);
      expect(result.findings.some((f) => f.id === 'ERR_INVALID_IPV4')).toBe(true);
      expect(result.subnetInfo).toBeNull();
    });

    it('Scenario 3: Detects invalid / non-contiguous subnet mask', () => {
      const result = runDiagnosis({
        ip: '10.0.0.5',
        mask: '255.255.240.128',
        gateway: '10.0.0.1',
      });

      expect(result.findings.some((f) => f.id === 'ERR_INVALID_SUBNET_MASK')).toBe(true);
      expect(result.overallStatus).toBe('Critical');
    });

    it('Scenario 4: Detects gateway outside expected local subnet', () => {
      const result = runDiagnosis({
        ip: '192.168.1.50',
        mask: '255.255.255.0',
        gateway: '192.168.2.1', // Different subnet!
      });

      expect(result.findings.some((f) => f.id === 'GATEWAY_OUTSIDE_LOCAL_SUBNET')).toBe(true);
    });

    it('Scenario 5: Detects missing gateway when remote destination is specified', () => {
      const result = runDiagnosis({
        ip: '192.168.1.50',
        mask: '255.255.255.0',
        gateway: '',
        destinationIp: '93.184.216.34', // Remote IP
      });

      expect(result.findings.some((f) => f.id === 'ERR_MISSING_GATEWAY_FOR_REMOTE')).toBe(true);
    });

    it('Scenario 6: Correctly distinguishes local destination without requiring gateway', () => {
      const result = runDiagnosis({
        ip: '192.168.1.50',
        mask: '255.255.255.0',
        gateway: '', // Missing, but target is local
        destinationIp: '192.168.1.60', // Same subnet!
      });

      expect(result.findings.some((f) => f.id === 'INFO_DESTINATION_LOCAL')).toBe(true);
      expect(result.findings.some((f) => f.id === 'ERR_MISSING_GATEWAY_FOR_REMOTE')).toBe(false);
    });

    it('Scenario 7: Isolates DNS failure when IP routing works', () => {
      const result = runDiagnosis({
        ip: '192.168.1.50',
        mask: '255.255.255.0',
        gateway: '192.168.1.1',
        primaryDns: '8.8.8.8',
        destinationHostname: 'google.com',
        observations: {
          canReachExternalIp: 'yes',
          canResolveDomain: 'no',
        },
      });

      expect(result.findings.some((f) => f.id === 'DNS_RESOLUTION_FAILURE_WITH_IP_OK')).toBe(true);
      expect(result.findings.some((f) => f.id === 'GENERAL_EXTERNAL_CONNECTIVITY_DOWN')).toBe(false);
    });

    it('Scenario 8: Identifies general network / upstream failure when both IP and DNS fail', () => {
      const result = runDiagnosis({
        ip: '192.168.1.50',
        mask: '255.255.255.0',
        gateway: '192.168.1.1',
        primaryDns: '8.8.8.8',
        observations: {
          canReachExternalIp: 'no',
          canResolveDomain: 'no',
        },
      });

      expect(result.findings.some((f) => f.id === 'GENERAL_EXTERNAL_CONNECTIVITY_DOWN')).toBe(true);
    });

    it('Scenario 9: Flags local gateway unreachable as physical/data link failure', () => {
      const result = runDiagnosis({
        ip: '192.168.1.50',
        mask: '255.255.255.0',
        gateway: '192.168.1.1',
        observations: {
          canReachGateway: 'no',
        },
      });

      expect(result.findings.some((f) => f.id === 'ERR_GATEWAY_UNREACHABLE_OBSERVED')).toBe(true);
      expect(result.overallStatus).toBe('Critical');
    });

    it('Scenario 10: Isolates web access failure when IP routing is functional', () => {
      const result = runDiagnosis({
        ip: '192.168.1.50',
        mask: '255.255.255.0',
        gateway: '192.168.1.1',
        observations: {
          canReachExternalIp: 'yes',
          canAccessWeb: 'no',
        },
      });

      expect(result.findings.some((f) => f.id === 'ERR_WEB_ACCESS_FAILURE_WITH_IP_OK')).toBe(true);
    });

    it('Scenario 11: Does NOT treat "untested" observation as a failed test', () => {
      const result = runDiagnosis({
        ip: '192.168.1.50',
        mask: '255.255.255.0',
        gateway: '192.168.1.1',
        primaryDns: '8.8.8.8',
        observations: {
          canReachGateway: 'untested',
          canReachExternalIp: 'untested',
          canResolveDomain: 'untested',
          canAccessWeb: 'untested',
        },
      });

      // No test failed, so should be healthy configuration
      expect(result.overallStatus).toBe('Healthy');
      expect(result.findings.some((f) => f.id === 'ERR_GATEWAY_UNREACHABLE_OBSERVED')).toBe(false);
      expect(result.findings.some((f) => f.id === 'DNS_RESOLUTION_FAILURE_WITH_IP_OK')).toBe(false);
    });

    it('Scenario 12: Handles multiple simultaneous findings without duplicates', () => {
      const result = runDiagnosis({
        ip: '169.254.10.20', // APIPA!
        mask: '255.255.255.0',
        gateway: '192.168.1.1', // Gateway outside subnet!
        primaryDns: 'invalid.dns', // Bad DNS format!
        destinationIp: '8.8.8.8',
        observations: {
          canReachGateway: 'no',
        },
      });

      expect(result.findings.length).toBeGreaterThanOrEqual(4);
      const ids = result.findings.map((f) => f.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size); // Zero duplicate finding IDs
    });
  });

  describe('Default Gateway Analysis Utilities', () => {
    it('detects gateway equal to host IP', () => {
      const gw = analyzeDefaultGateway({
        ip: '192.168.1.1',
        mask: '255.255.255.0',
        gateway: '192.168.1.1',
      });

      expect(gw.issues.some((i) => i.code === 'GATEWAY_EQUALS_HOST_IP')).toBe(true);
    });
  });

  describe('LocalStorage Error Tolerance', () => {
    it('recovers gracefully from corrupted JSON in localStorage', () => {
      localStorage.setItem('netpulse_diagnosis_history', '{ corrupt json syntax !@#');
      const history = getDiagnosisHistory();
      expect(history).toEqual([]);
    });

    it('saves and caps diagnosis history to maximum 20 records', () => {
      for (let i = 1; i <= 25; i++) {
        saveDiagnosis({
          id: `diag_${i}`,
          timestamp: new Date().toISOString(),
          deviceName: `Device ${i}`,
          overallStatus: 'Healthy',
          findings: [],
        });
      }

      const history = getDiagnosisHistory();
      expect(history.length).toBe(20);
      expect(history[0].id).toBe('diag_25'); // Most recent first
    });

    it('deletes an individual diagnosis record', () => {
      saveDiagnosis({ id: 'd1', deviceName: 'Dev 1' });
      saveDiagnosis({ id: 'd2', deviceName: 'Dev 2' });

      deleteDiagnosis('d1');
      const history = getDiagnosisHistory();
      expect(history.length).toBe(1);
      expect(history[0].id).toBe('d2');
    });
  });

  describe('CSV Escaping and Report Exporting', () => {
    it('escapes quotes, commas, and newlines per RFC 4180', () => {
      expect(escapeCsvField('simple')).toBe('simple');
      expect(escapeCsvField('hello, world')).toBe('"hello, world"');
      expect(escapeCsvField('quote "test"')).toBe('"quote ""test"""');
      expect(escapeCsvField('multi\nline')).toBe('"multi\nline"');
      expect(escapeCsvField(null)).toBe('""');
    });

    it('generates compliant CSV with proper headers and row quoting', () => {
      const diagnosis = runDiagnosis({
        ip: '192.168.1.1',
        mask: '255.255.255.0',
        gateway: '192.168.1.1', // Gateway equal to host
      });

      const csv = generateDiagnosisCSV(diagnosis);
      expect(csv).toContain('Diagnosis ID');
      expect(csv).toContain('Severity');
      expect(csv).toContain('GATEWAY_EQUALS_HOST_IP');
    });
  });
});
