/**
 * Report Export Utility
 * Generates downloadable JSON, RFC 4180 compliant CSV, and human-readable text reports.
 */

/**
 * Escapes a field for RFC 4180 CSV compliance.
 * Handles commas, double quotes, line breaks, and null/undefined values.
 * @param {any} value
 * @returns {string}
 */
export function escapeCsvField(value) {
  if (value === null || value === undefined) {
    return '""';
  }

  const stringVal = String(value);
  // If the value contains commas, quotes, carriage returns, or newlines, quote it
  if (stringVal.includes('"') || stringVal.includes(',') || stringVal.includes('\n') || stringVal.includes('\r')) {
    return `"${stringVal.replace(/"/g, '""')}"`;
  }

  return stringVal;
}

/**
 * Generates an RFC 4180 compliant CSV string from diagnosis data.
 * @param {object} diagnosis
 * @returns {string}
 */
export function generateDiagnosisCSV(diagnosis) {
  const headers = [
    'Diagnosis ID',
    'Timestamp',
    'Device Name',
    'Overall Status',
    'Diagnostic Basis',
    'Host IPv4',
    'Subnet Mask',
    'CIDR Prefix',
    'Network Address',
    'Broadcast Address',
    'Usable Host Range',
    'Default Gateway',
    'Primary DNS',
    'Secondary DNS',
    'Finding ID',
    'Severity',
    'Category',
    'Issue Title',
    'Explanation',
    'Evidence',
    'Recommended Fix',
    'Networking Concept',
  ];

  const rows = [];
  const subnet = diagnosis.subnetInfo || {};
  const cfg = diagnosis.inputConfig || {};

  if (!diagnosis.findings || diagnosis.findings.length === 0) {
    rows.push([
      diagnosis.id,
      diagnosis.timestamp,
      diagnosis.deviceName,
      diagnosis.overallStatus,
      diagnosis.diagnosticBasis,
      cfg.ip || 'N/A',
      cfg.mask || 'N/A',
      subnet.cidrNotation || 'N/A',
      subnet.networkAddress || 'N/A',
      subnet.broadcastAddress || 'N/A',
      subnet.usableRange || 'N/A',
      cfg.gateway || 'N/A',
      cfg.primaryDns || 'N/A',
      cfg.secondaryDns || 'N/A',
      'NONE',
      'None',
      'General',
      'No Issues Found',
      'Configuration passed all standard validation rules.',
      'All inputs validated successfully.',
      'No actions needed.',
      'Standard IPv4 Networking',
    ]);
  } else {
    for (const f of diagnosis.findings) {
      rows.push([
        diagnosis.id,
        diagnosis.timestamp,
        diagnosis.deviceName,
        diagnosis.overallStatus,
        diagnosis.diagnosticBasis,
        cfg.ip || 'N/A',
        cfg.mask || 'N/A',
        subnet.cidrNotation || 'N/A',
        subnet.networkAddress || 'N/A',
        subnet.broadcastAddress || 'N/A',
        subnet.usableRange || 'N/A',
        cfg.gateway || 'N/A',
        cfg.primaryDns || 'N/A',
        cfg.secondaryDns || 'N/A',
        f.id,
        f.severity,
        f.category,
        f.title,
        f.explanation,
        f.evidence,
        f.recommendedFix,
        f.concept,
      ]);
    }
  }

  const csvContent = [
    headers.map(escapeCsvField).join(','),
    ...rows.map((row) => row.map(escapeCsvField).join(',')),
  ].join('\r\n');

  return csvContent;
}

/**
 * Generates a clean, readable ASCII text report.
 * @param {object} diagnosis
 * @returns {string}
 */
export function generateDiagnosisText(diagnosis) {
  const cfg = diagnosis.inputConfig || {};
  const subnet = diagnosis.subnetInfo || {};
  const obs = cfg.observations || {};

  const lines = [
    '================================================================================',
    '              NETWORK CONNECTIVITY TROUBLESHOOTING ASSISTANT REPORT              ',
    '================================================================================',
    `Report ID        : ${diagnosis.id}`,
    `Generated On     : ${new Date(diagnosis.timestamp).toLocaleString()}`,
    `Device Name      : ${diagnosis.deviceName}`,
    `Overall Status   : ${diagnosis.overallStatus.toUpperCase()}`,
    `Diagnostic Basis : ${diagnosis.diagnosticBasis}`,
    '--------------------------------------------------------------------------------',
    '1. CONFIGURED NETWORK PARAMETERS',
    '--------------------------------------------------------------------------------',
    `  Host IPv4 Address  : ${cfg.ip || 'Not provided'}`,
    `  Subnet Mask        : ${cfg.mask || 'Not provided'} ${subnet.cidrNotation ? `(${subnet.cidrNotation})` : ''}`,
    `  Default Gateway    : ${cfg.gateway || 'Not configured'}`,
    `  Primary DNS Server : ${cfg.primaryDns || 'Not configured'}`,
    `  Secondary DNS      : ${cfg.secondaryDns || 'Not configured'}`,
    `  Target Destination : IP: ${cfg.destinationIp || 'None'}, Hostname: ${cfg.destinationHostname || 'None'}`,
    '',
    '--------------------------------------------------------------------------------',
    '2. MATHEMATICAL SUBNET ANALYSIS',
    '--------------------------------------------------------------------------------',
  ];

  if (subnet && subnet.networkAddress) {
    lines.push(
      `  Network Address    : ${subnet.networkAddress}`,
      `  Broadcast Address  : ${subnet.broadcastAddress}`,
      `  Subnet Prefix      : /${subnet.cidr}`,
      `  Usable Host Range  : ${subnet.usableRange}`,
      `  Total Capacity     : ${subnet.usableHostsCount.toLocaleString()} usable hosts`,
      `  Subnet Sub-type    : ${subnet.specialCaseType}`,
      `  Technical Note     : ${subnet.specialCaseExplanation}`
    );
  } else {
    lines.push('  Subnet calculations could not be performed due to invalid IP or mask.');
  }

  lines.push(
    '',
    '--------------------------------------------------------------------------------',
    '3. DIAGNOSTIC OBSERVATIONS (USER / SIMULATED)',
    '--------------------------------------------------------------------------------',
    `  Can Reach Local Gateway?     : ${obs.canReachGateway ? obs.canReachGateway.toUpperCase() : 'UNTESTED'}`,
    `  Can Reach External IP?       : ${obs.canReachExternalIp ? obs.canReachExternalIp.toUpperCase() : 'UNTESTED'}`,
    `  Can Resolve Domain Names?    : ${obs.canResolveDomain ? obs.canResolveDomain.toUpperCase() : 'UNTESTED'}`,
    `  Can Access Web Page?         : ${obs.canAccessWeb ? obs.canAccessWeb.toUpperCase() : 'UNTESTED'}`,
    '',
    '--------------------------------------------------------------------------------',
    `4. DETECTED FINDINGS & ISSUES (${diagnosis.findings.length} Finding${diagnosis.findings.length === 1 ? '' : 's'})`,
    '--------------------------------------------------------------------------------'
  );

  diagnosis.findings.forEach((f, idx) => {
    lines.push(
      `[#${idx + 1}] [${f.severity.toUpperCase()}] ${f.title}`,
      `      Category : ${f.category}`,
      `      Basis    : ${f.basis || diagnosis.diagnosticBasis}`,
      `      Evidence : ${f.evidence}`,
      `      Analysis : ${f.explanation}`,
      `      Concept  : ${f.concept}`,
      `      Action   : ${f.recommendedFix.replace(/\n/g, '\n                 ')}`,
      ''
    );
  });

  lines.push(
    '--------------------------------------------------------------------------------',
    '5. RECOMMENDED ACTION CHECKLIST',
    '--------------------------------------------------------------------------------'
  );

  if (diagnosis.checklist && diagnosis.checklist.length > 0) {
    diagnosis.checklist.forEach((item) => {
      lines.push(`  [ ] Step ${item.step}: ${item.title}`);
      lines.push(`      Action: ${item.action.replace(/\n/g, '\n              ')}`);
    });
  } else {
    lines.push('  [ ] No corrective actions required.');
  }

  lines.push(
    '',
    '================================================================================',
    'DISCLAIMER: Analysis is based on configuration logic and user observations.',
    'No physical packets were sent by the browser. See About page for full details.',
    '================================================================================'
  );

  return lines.join('\n');
}

/**
 * Triggers a browser download of a given blob content.
 * @param {string} content
 * @param {string} filename
 * @param {string} mimeType
 */
export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports diagnosis as JSON file.
 * @param {object} diagnosis
 */
export function exportAsJSON(diagnosis) {
  const json = JSON.stringify(diagnosis, null, 2);
  const filename = `NetPulse_Diagnosis_${diagnosis.id}.json`;
  downloadFile(json, filename, 'application/json');
}

/**
 * Exports diagnosis as CSV file.
 * @param {object} diagnosis
 */
export function exportAsCSV(diagnosis) {
  const csv = generateDiagnosisCSV(diagnosis);
  const filename = `NetPulse_Diagnosis_${diagnosis.id}.csv`;
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Exports diagnosis as Plain Text report.
 * @param {object} diagnosis
 */
export function exportAsText(diagnosis) {
  const text = generateDiagnosisText(diagnosis);
  const filename = `NetPulse_Diagnosis_${diagnosis.id}.txt`;
  downloadFile(text, filename, 'text/plain;charset=utf-8;');
}
