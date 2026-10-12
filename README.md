# NetPulse — Network Connectivity Troubleshooting Assistant

A comprehensive, deterministic, browser-based web application and educational laboratory tool designed to diagnose IPv4 network configuration errors, calculate subnet boundaries, analyze default gateway reachability caveats, isolate DNS resolution failures across OSI Layers 1–7, and provide actionable troubleshooting recommendations.

---

## 1. Project Overview & Problem Statement

### Problem Statement
In computer networking education and system administration, misconfigurations at Layer 2, Layer 3, and Layer 7 are frequent causes of connectivity failure:
- Typographical mistakes in IPv4 addresses (octets > 255 or misleading leading zeros).
- Non-contiguous subnet masks entered due to misunderstandings of binary CIDR math.
- Default gateways placed outside the local broadcast domain, triggering an ARP resolution failure.
- Decoupled failures where low-level IP routing functions, but domain name resolution (DNS UDP port 53) fails.
- Host configuration errors (assigning network IDs or broadcast addresses directly to host NICs).

Novice students and engineers often struggle to isolate which layer in the OSI stack has failed, frequently conflating physical disconnections with DNS server downtime or IP routing faults.

### Objective
**NetPulse** provides a structured, rule-based diagnostic engine and interactive visualizer that:
1. Validates IPv4 configuration syntax and logical subnet containment deterministically without guesswork.
2. Correlates user-observed connectivity diagnostics (gateway ping, external IP ping, DNS lookup, HTTP web browsing) to isolate the responsible OSI layer.
3. Offers immediate corrective actions, academic concept references, and downloadable lab reports in JSON, CSV, and text formats.

---

## 2. Computer Networks Concepts Demonstrated

| Concept | RFC Standards | Real-World Application in NetPulse |
| :--- | :--- | :--- |
| **IPv4 Address Validation** | RFC 791, RFC 1122 | Dotted-decimal parsing, 0–255 bounds checking, and strict rejection of leading zeros to eliminate ambiguous octal parsing in legacy BSD socket libraries. |
| **CIDR & Subnet Calculations** | RFC 4632, RFC 1519 | Validates binary bit contiguity ($1^*0^*$). Safe unsigned 32-bit math (`>>> 0`) prevents JavaScript signed integer overflow. Calculates network ID, broadcast ID, usable host range, and host capacities. |
| **Point-to-Point Links (/31)** | RFC 3021 | Handles 31-bit prefixes where traditional network and broadcast IDs do not exist, allocating 2 valid host endpoints for router interconnections. |
| **Host Routes (/32) & Default (/0)** | RFC 4632 | Special-case routing rules for single-host routes and default quad-zero (`0.0.0.0/0`) gateways. |
| **Layer 2 ARP & Gateway Locality** | RFC 826, RFC 1122 | Determines if a target is in the local subnet (delivered directly via ARP frame broadcast) or remote (forwarded to the default gateway's MAC address). Flags off-subnet gateways as a Layer 2 fatal configuration error. |
| **DNS Layer Decoupling** | RFC 1034, RFC 1035 | Distinguishes between Layer 3 routing success (e.g. pinging `8.8.8.8`) and Layer 7 resolution failure (failing to resolve `google.com`), isolating nameserver unreachable errors from physical link down states. |
| **Transport / App Filtering** | RFC 793, RFC 9110 | Isolates cases where IP ping and DNS queries succeed, but HTTP (port 80) or HTTPS (port 443) fails due to firewall port blocking, captive portals, or web server outages. |

---

## 3. Technology Stack

- **Frontend Framework:** React.js 18 with Vite build tool
- **Language:** JavaScript (ES6+ with safe unsigned 32-bit bitwise arithmetic)
- **Styling:** Tailwind CSS (custom network administration dark/navy palette)
- **Icons:** Lucide React
- **Routing:** React Router v6
- **Persistence:** Browser `localStorage` (fault-tolerant, resilient against corrupt JSON, capped at 20 records)
- **Testing Suite:** Vitest and React Testing Library (100% automated test coverage across 40 unit and integration tests)

---

## 4. Architecture & Data Flow

```
                      [ User Input / Lab Scenario ]
                                    │
                     ┌──────────────┴──────────────┐
                     ▼                             ▼
           [ IPv4 Syntax Engine ]       [ Diagnostic Observations ]
             (Range, Contiguity,          (Gateway, IP, DNS, Web:
             APIPA, Loopback, /31)          Yes / No / Not Tested)
                     │                             │
                     └──────────────┬──────────────┘
                                    ▼
                     [ Rule-Based Diagnosis Engine ]
                      (14+ Deterministic RFC Rules)
                                    │
     ┌──────────────────────┬───────┴──────────────┬──────────────────────┐
     ▼                      ▼                      ▼                      ▼
[ Overall Status ]  [ Subnet Geometry ]  [ Severity Findings ]  [ Action Checklist ]
 (Healthy /          (32-Bit Bit-Bar,      (Categorized,          (Prioritized steps,
  Critical /          Network, Bcast,       Evidence, Concept,     Progress tracker)
  Warning)            Usable Range)         RFC Reference)
                            │                      │
                            ▼                      ▼
                     [ Persistence ]        [ Report Export ]
                     (localStorage)         (JSON, RFC 4180 CSV,
                                             Plain Text, Print)
```

---

## 5. Project Folder Structure

```
c:/Users/prade/OneDrive/Desktop/Computer networks/
├── index.html                        # Application HTML template with Google Fonts
├── package.json                      # Dependencies and npm scripts
├── postcss.config.js                 # PostCSS Tailwind plugins
├── tailwind.config.js                # Custom network admin theme palette
├── vite.config.js                    # Vite bundler & Vitest test configuration
├── public/
│   └── network-icon.svg              # NetPulse SVG brand favicon
└── src/
    ├── main.jsx                      # React 18 DOM root mount
    ├── App.jsx                       # Client-side router layout
    ├── index.css                     # Tailwind directives & custom utilities
    ├── components/
    │   ├── common/
    │   │   ├── Badge.jsx             # Severity & Diagnostic Basis indicators
    │   │   ├── Modal.jsx             # Accessible modal dialogue
    │   │   ├── StatCard.jsx          # Dashboard KPI metric cards
    │   │   ├── Toast.jsx             # Action notifications
    │   │   └── Tooltip.jsx           # Inline networking term explainers
    │   ├── diagnosis/
    │   │   ├── DiagnosticWorkflow.jsx# 6-Stage guided troubleshooting wizard
    │   │   ├── FindingCard.jsx       # Expandable findings with RFC concepts
    │   │   ├── LocalityCard.jsx      # Layer 2 ARP vs Layer 3 gateway card
    │   │   └── SubnetVisualizer.jsx  # Interactive 32-bit network/host bit bar
    │   ├── forms/
    │   │   ├── NetworkConfigForm.jsx # Core IPv4 parameter input form
    │   │   ├── ObservationField.jsx  # Yes/No/Untested diagnostic toggles
    │   │   └── ScenarioPickerModal.jsx# Benchmark scenario selector
    │   ├── layout/
    │   │   ├── Footer.jsx            # Academic attribution & privacy notice
    │   │   ├── Layout.jsx            # Shell layout wrapper
    │   │   ├── Navbar.jsx            # Top navigation bar
    │   │   └── Sidebar.jsx           # Responsive sidebar with OSI model guide
    │   └── reports/
    │       ├── ActionChecklist.jsx   # Interactive troubleshooting checklist
    │       └── ExportModal.jsx       # JSON, RFC 4180 CSV, TXT & Print export
    ├── data/
    │   └── exampleScenarios.js       # 8 Realistic academic lab scenarios
    ├── pages/
    │   ├── About.jsx                 # Academic concepts & browser limitations
    │   ├── Dashboard.jsx             # KPI metrics, capabilities, recent history
    │   ├── DiagnosisResults.jsx      # Findings breakdown, subnet analysis
    │   ├── History.jsx               # LocalStorage management and search
    │   ├── NewDiagnosis.jsx          # Diagnosis launcher (Form & Wizard modes)
    │   └── ScenariosPage.jsx         # Dedicated scenario lab explorer
    ├── tests/
    │   ├── setup.js                  # Vitest DOM matchers setup
    │   ├── ipv4.test.js              # IPv4 validation unit tests
    │   ├── subnet.test.js            # Subnet calculations & CIDR tests
    │   └── diagnosisEngine.test.js   # 14 diagnostic rules, CSV & storage tests
    └── utils/
        ├── diagnosisEngine.js        # Core deterministic troubleshooting rules
        ├── dns.js                    # DNS format and observation analyzer
        ├── gateway.js                # Default gateway containment analyzer
        ├── ipv4.js                   # Safe unsigned 32-bit IPv4 math
        ├── reportExport.js           # RFC 4180 CSV, JSON, and text generator
        ├── storage.js                # LocalStorage persistence & error safety
        └── subnet.js                 # Subnet masks, CIDR, and /31 point-to-point
```

---

## 6. Installation & Setup Instructions

### Prerequisites
- **Node.js**: v18.0.0 or later (Tested on Node.js v22.17.0)
- **npm**: v9.0.0 or later (Tested on npm 10.9.2)

### Step-by-Step Setup
1. Clone or extract the project repository:
   ```bash
   cd "Computer networks"
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```
   Open your browser to the local address displayed (typically `http://localhost:5173`).

4. Build for production:
   ```bash
   npm run build
   ```
   The compiled bundle will be generated in `dist/`.

5. Preview the production build:
   ```bash
   npm run preview
   ```

---

## 7. Automated Testing Instructions

NetPulse contains a comprehensive automated test suite testing:
- Dotted-decimal IPv4 address validation, bounds (0–255), incomplete inputs, and leading zero rejection.
- Unsigned 32-bit integer conversion without signed integer overflow.
- Subnet mask bit-contiguity validation ($1^*0^*$), CIDR conversions, and wildcard masks.
- Network ID, directed broadcast ID, and usable host range calculations.
- Special cases: RFC 3021 /31 point-to-point links and /32 host routes.
- Same-subnet comparisons without string comparison flaws.
- Default gateway containment and self-assignment checks.
- DNS failure isolation vs general network outages.
- Handling of "Not Tested" observations (ensuring untested is not marked as failed).
- Multiple simultaneous findings without duplicates.
- Graceful recovery from corrupted JSON in browser `localStorage`.
- RFC 4180 compliant CSV escaping for quotes, commas, and line breaks.

To execute all tests with Vitest:
```bash
npm test
```

### Test Results Summary
```
 ✓ src/tests/ipv4.test.js (12 tests)
 ✓ src/tests/subnet.test.js (10 tests)
 ✓ src/tests/diagnosisEngine.test.js (18 tests)

 Test Files  3 passed (3)
      Tests  40 passed (40)
```

---

## 8. Built-In Example Scenarios

| # | Scenario Name | Primary Issue Tested | Expected Outcome |
| :- | :--- | :--- | :--- |
| **1** | **Correctly Configured Network** | Baseline healthy LAN | All parameters valid, 0 critical issues, direct ARP & indirect routing confirmed. |
| **2** | **Invalid IPv4 Address Format** | Syntax error (`192.168.1.300`) | Critical finding: Octet 4 is out of bounds (0-255). Subnet math halted safely. |
| **3** | **Incorrect Subnet Mask** | Non-contiguous mask (`255.255.240.128`) | Critical finding: Subnet mask bits must be contiguous ones followed by zeros. |
| **4** | **Gateway Outside Expected Subnet** | Routing boundary mismatch | Critical finding: Gateway `192.168.2.1` is not in host subnet `192.168.1.0/24`. Host cannot ARP for gateway. |
| **5** | **DNS Failure With IP Routing Working** | Layer 7 vs Layer 3 decoupling | High finding: Raw IP routing works (`8.8.8.8` ping ok), but domain lookup fails. Isolates problem to DNS resolver or UDP port 53. |
| **6** | **Gateway Unreachable & Network Down** | Physical / Data Link outage | Critical finding: Local gateway unreachable. Isolates root cause to unplugged cable, Wi-Fi disassociation, or router offline. |
| **7** | **Point-to-Point /31 Link** | RFC 3021 special subnet | Evaluates `/31` link with 2 usable endpoints without erroneously flagging network/broadcast ID collision. |
| **8** | **Web Access Inaccessible** | Layer 4 / Layer 7 filtering | High finding: Gateway and DNS work, but web browsing fails. Recommends checking outbound ports 80/443, proxy, or TLS. |

---

## 9. Academic Scope & Limitations

1. **Configuration Validation:** Checks whether supplied IP and subnet values are mathematically and syntactically consistent.
2. **Observation-Based Diagnosis:** Uses real connectivity symptoms reported by the user to pinpoint the failed layer.
3. **Simulated Diagnosis:** Uses predefined lab scenarios to teach troubleshooting methodology.
4. **Browser Security Sandboxing:** Web browsers intentionally restrict client-side JavaScript from sending raw ICMP echo requests (ping) or crafting raw TCP/IP packets. NetPulse honestly identifies its findings as configuration- or observation-based and never fakes live ping metrics.
5. **Physical Link State:** Mathematically valid parameters do not prove that physical cables, switch ports, or ISP fiber lines are operational.

---

## 10. Future Enhancements

- **Optional Local Node.js Agent:** A lightweight helper utility allowing users to opt-in to execute sanitized OS-level `ping` and `traceroute` commands locally.
- **IPv6 Addressing Support:** Dual-stack analysis covering IPv6 /64 prefix subnets and SLAAC / DHCPv6 configuration.
- **Visual Packet Tracer Animation:** Graphical animation tracing Layer 2 Ethernet frame ARP broadcasting and Layer 3 router hop-by-hop forwarding.
