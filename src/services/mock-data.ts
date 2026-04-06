import {
  Alert,
  AlertPriority,
  Entity,
  EntityType,
  EntityStatus,
  Case,
  CaseStatus,
  Evidence,
  Activity,
  GraphNode,
  GraphEdge,
} from '@/types';

// ---------------------------------------------------------------------------
// Seeded PRNG (Mulberry32) for deterministic data generation
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20260331);

function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickN<T>(arr: readonly T[], n: number): T[] {
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, n);
}

function uuid(): string {
  const hex = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 32; i++) {
    if (i === 8 || i === 12 || i === 16 || i === 20) id += '-';
    id += hex[Math.floor(rng() * 16)];
  }
  return id;
}

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

const FIRST_NAMES = [
  'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram',
  'Anita', 'Suresh', 'Kavita', 'Deepak', 'Meera',
  'Arun', 'Lakshmi', 'Rahul', 'Nandini', 'Manoj',
  'Sarita', 'Ashok', 'Rekha', 'Sanjay', 'Pooja',
] as const;

const LAST_NAMES = [
  'Sharma', 'Patel', 'Kumar', 'Singh', 'Reddy',
  'Nair', 'Gupta', 'Mehta', 'Joshi', 'Verma',
  'Iyer', 'Desai', 'Rao', 'Mishra', 'Chatterjee',
] as const;

const COMPANIES = [
  'Bharati Infra Ltd',
  'Golden Bridge Constructions',
  'Sunrise Realty Group',
  'Metro Development Corp',
  'National Builders Alliance',
  'PrimeSteel Industries',
  'Ganga Port Services',
  'Indus Mining Corp',
  'Deccan Pharmaceuticals',
  'Saffron Tech Solutions',
] as const;

const DEPARTMENTS = [
  'Ministry of Finance',
  'Ministry of Urban Development',
  'Public Works Department',
  'Municipal Corporation',
  'Ministry of Railways',
  'Ministry of Defence',
  'Ministry of Health',
  'Central Vigilance Commission',
  'Ministry of Road Transport',
  'Ministry of Housing',
  'Ministry of Agriculture',
  'National Highway Authority',
  'Ministry of Coal',
  'Ministry of Petroleum',
  'Ministry of Water Resources',
] as const;

const DESIGNATIONS = [
  'Joint Secretary',
  'Director',
  'Under Secretary',
  'Commissioner',
  'Additional Secretary',
  'Deputy Director',
  'Chief Engineer',
  'Superintendent Engineer',
  'Executive Engineer',
  'District Collector',
  'Municipal Commissioner',
  'Chief Accounts Officer',
] as const;

const CITIES: readonly { name: string; lat: number; lng: number }[] = [
  { name: 'Delhi', lat: 28.6139, lng: 77.209 },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
] as const;

const ALERT_CATEGORIES = [
  'Unusual Transaction Pattern',
  'Conflict of Interest',
  'Bid Rigging Suspected',
  'Asset Disproportionate to Income',
  'Shell Company Activity',
  'Benami Property Detected',
  'Procurement Irregularity',
  'Fund Diversion',
  'Nepotism in Appointments',
  'Contract Splitting',
  'Suspicious Cash Flow',
  'Regulatory Non-Compliance',
] as const;

const ALERT_SOURCES = [
  'Transaction Monitor',
  'AI Risk Engine',
  'Whistleblower Report',
  'Audit System',
  'Public Grievance Portal',
  'Media Scanner',
  'Financial Intelligence Unit',
  'RTI Analysis',
  'Procurement Watch',
  'Asset Verification System',
] as const;

const EDGE_LABELS = [
  'awarded contract to',
  'received payment from',
  'approved tender for',
  'related to director of',
  'shares address with',
  'co-signatory with',
  'transferred funds to',
  'nominated by',
  'spouse of director at',
  'former employee of',
  'subcontracted to',
  'holds shares in',
  'filed joint returns with',
  'guarantor for',
  'approved grant for',
] as const;

const EVIDENCE_TITLES = [
  'Bank Transaction Records',
  'Property Registration Documents',
  'Tender Evaluation Report',
  'RTI Response Documents',
  'Audit Findings Report',
  'Company Registration Filings',
  'Income Tax Returns',
  'Land Revenue Records',
  'Meeting Minutes',
  'Email Correspondence',
  'Phone Call Records',
  'Travel Expense Claims',
] as const;

const TAGS = [
  'infrastructure', 'healthcare', 'defence', 'real-estate', 'mining',
  'procurement', 'benami', 'shell-company', 'land-grab', 'kickback',
  'nepotism', 'tender-fraud', 'money-laundering', 'tax-evasion',
] as const;

// ---------------------------------------------------------------------------
// Helper: generate a date within last N days
// ---------------------------------------------------------------------------

function daysAgo(n: number): string {
  const now = new Date('2026-03-31T12:00:00Z');
  const offset = rng() * n * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() - offset).toISOString();
}

function jitter(lat: number, lng: number): { lat: number; lng: number } {
  return {
    lat: lat + (rng() - 0.5) * 0.1,
    lng: lng + (rng() - 0.5) * 0.1,
  };
}

// ---------------------------------------------------------------------------
// Entity generation (50 entities)
// ---------------------------------------------------------------------------

function generateEntities(): Entity[] {
  const entities: Entity[] = [];
  const statusOptions: EntityStatus[] = ['active', 'flagged', 'cleared', 'under_investigation'];

  // 15 persons
  for (let i = 0; i < 15; i++) {
    const city = pick(CITIES);
    entities.push({
      id: `ent-person-${String(i + 1).padStart(3, '0')}`,
      name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      type: 'person',
      riskScore: randInt(10, 95),
      connectionCount: randInt(2, 20),
      lastActivity: daysAgo(30),
      status: pick(statusOptions),
      metadata: {
        city: city.name,
        aadhaarLast4: String(randInt(1000, 9999)),
        panPrefix: pick(['A', 'B', 'C', 'D', 'E']) + pick(['A', 'B', 'C', 'D', 'E']) + 'PP',
      },
      location: jitter(city.lat, city.lng),
    });
  }

  // 10 companies
  for (let i = 0; i < 10; i++) {
    const city = pick(CITIES);
    entities.push({
      id: `ent-company-${String(i + 1).padStart(3, '0')}`,
      name: COMPANIES[i],
      type: 'company',
      riskScore: randInt(15, 90),
      connectionCount: randInt(5, 30),
      lastActivity: daysAgo(30),
      status: pick(statusOptions),
      metadata: {
        cin: `U${randInt(10000, 99999)}MH2020PLC${randInt(100000, 999999)}`,
        city: city.name,
        sector: pick(['Infrastructure', 'Real Estate', 'Mining', 'Pharma', 'Technology', 'Port Services']),
        incorporationYear: String(randInt(2005, 2022)),
      },
      location: jitter(city.lat, city.lng),
    });
  }

  // 15 officials
  for (let i = 0; i < 15; i++) {
    const city = pick(CITIES);
    const dept = pick(DEPARTMENTS);
    const desig = pick(DESIGNATIONS);
    entities.push({
      id: `ent-official-${String(i + 1).padStart(3, '0')}`,
      name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      type: 'official',
      riskScore: randInt(5, 98),
      connectionCount: randInt(3, 25),
      lastActivity: daysAgo(30),
      status: pick(statusOptions),
      metadata: {
        city: city.name,
        department: dept,
        batchYear: String(randInt(1990, 2015)),
      },
      location: jitter(city.lat, city.lng),
      department: dept,
      designation: desig,
    });
  }

  // 10 contracts
  for (let i = 0; i < 10; i++) {
    const city = pick(CITIES);
    const value = randInt(5, 500) * 10; // in lakhs
    entities.push({
      id: `ent-contract-${String(i + 1).padStart(3, '0')}`,
      name: `${pick([
        'Road Construction', 'Bridge Development', 'Hospital Equipment',
        'School Building', 'Water Supply', 'Smart City', 'Railway Station',
        'Flyover Construction', 'Sewage Treatment', 'Power Grid',
      ])} - ${city.name} (${value}L)`,
      type: 'contract',
      riskScore: randInt(20, 85),
      connectionCount: randInt(2, 10),
      lastActivity: daysAgo(30),
      status: pick(statusOptions),
      metadata: {
        city: city.name,
        tenderNumber: `TEND-${randInt(2024, 2026)}-${randInt(10000, 99999)}`,
        valueLakhs: String(value),
        awardDate: daysAgo(180),
      },
      location: jitter(city.lat, city.lng),
    });
  }

  return entities;
}

// ---------------------------------------------------------------------------
// Alert generation (100 alerts)
// ---------------------------------------------------------------------------

function generateAlerts(entities: Entity[]): Alert[] {
  const alerts: Alert[] = [];

  // Priority distribution: 5% critical, 15% high, 50% medium, 30% low
  const priorityPool: AlertPriority[] = [];
  for (let i = 0; i < 5; i++) priorityPool.push('critical');
  for (let i = 0; i < 15; i++) priorityPool.push('high');
  for (let i = 0; i < 50; i++) priorityPool.push('medium');
  for (let i = 0; i < 30; i++) priorityPool.push('low');

  for (let i = 0; i < 100; i++) {
    const entity = pick(entities);
    const priority = priorityPool[i];
    const category = pick(ALERT_CATEGORIES);
    const city = pick(CITIES);

    alerts.push({
      id: `alert-${String(i + 1).padStart(4, '0')}`,
      title: `${category} — ${entity.name}`,
      description: generateAlertDescription(category, entity.name, entity.type),
      priority,
      entityId: entity.id,
      entityName: entity.name,
      entityType: entity.type,
      riskScore: priority === 'critical' ? randInt(85, 99)
        : priority === 'high' ? randInt(65, 84)
        : priority === 'medium' ? randInt(35, 64)
        : randInt(10, 34),
      timestamp: daysAgo(30),
      isRead: rng() < 0.4,
      isDismissed: rng() < 0.1,
      source: pick(ALERT_SOURCES),
      location: jitter(city.lat, city.lng),
      category,
    });
  }

  return alerts;
}

function generateAlertDescription(
  category: string,
  entityName: string,
  entityType: EntityType,
): string {
  const descriptions: Record<string, string[]> = {
    'Unusual Transaction Pattern': [
      `Multiple high-value transactions detected for ${entityName} exceeding normal thresholds by 300%. Transactions routed through 4 intermediary accounts across different states.`,
      `${entityName} shows a series of round-tripping transactions totalling INR 2.3 Cr over the past 45 days, with amounts structured just below reporting limits.`,
    ],
    'Conflict of Interest': [
      `${entityName} identified as having direct familial connection to the contract-awarding authority. Spouse holds 26% stake in the beneficiary company.`,
      `Analysis reveals ${entityName} served on the tender evaluation committee while simultaneously holding an advisory role at the bidding firm.`,
    ],
    'Bid Rigging Suspected': [
      `Statistical anomaly detected in bidding pattern: ${entityName} and 3 related entities submitted bids within 0.5% of each other across 7 consecutive tenders.`,
      `${entityName} consistently wins contracts with a bid price exactly 2% below the next competitor, suggesting information asymmetry.`,
    ],
    'Asset Disproportionate to Income': [
      `${entityName} declared assets worth INR 15 Cr against a cumulative income of INR 1.8 Cr over the last 10 years. Property acquisitions in premium locations flagged.`,
      `Disproportionate asset growth of 450% detected for ${entityName} during the tenure as ${entityType === 'official' ? 'public servant' : 'contractor'}. Benami holdings suspected.`,
    ],
    'Shell Company Activity': [
      `${entityName} linked to 3 entities with no operational activity, zero employees, and registered at the same address. INR 8.5 Cr moved through these entities in the past quarter.`,
      `Company registry analysis shows ${entityName} is a common director across 5 recently incorporated firms, all receiving government subcontracts.`,
    ],
    'Benami Property Detected': [
      `Property worth INR 4.2 Cr registered under an associate of ${entityName}. Funding trail indicates the real beneficial owner is ${entityName}.`,
      `Land records indicate ${entityName} facilitated purchase of 12 acres of commercial land through a proxy buyer, circumventing LARR Act provisions.`,
    ],
    'Procurement Irregularity': [
      `Tender specifications for ${entityName}'s contract appear tailored to exclude all but one bidder. Pre-qualification criteria changed 48 hours before submission deadline.`,
      `${entityName} received direct procurement approval bypassing competitive bidding for an order worth INR 3.7 Cr, citing false urgency.`,
    ],
    'Fund Diversion': [
      `INR 12 Cr allocated for rural infrastructure under ${entityName}'s jurisdiction shows only 30% utilisation with 100% fund release. Satellite imagery confirms no construction at 6 of 10 project sites.`,
      `Funds disbursed to ${entityName} for welfare scheme implementation were redirected to personal accounts via shell entities within 72 hours of release.`,
    ],
    'Nepotism in Appointments': [
      `${entityName} appointed 4 close relatives to key project management positions within the last 6 months, bypassing standard recruitment processes.`,
      `Analysis of appointment records reveals ${entityName}'s family members hold positions in 3 departments that regularly award contracts to a common set of firms.`,
    ],
    'Contract Splitting': [
      `${entityName} split a single contract worth INR 5.5 Cr into 11 sub-contracts of INR 49.9 L each to stay below the competitive bidding threshold.`,
      `Pattern analysis shows ${entityName} awarded 8 consecutive contracts to the same vendor, each just under the tender committee review limit.`,
    ],
    'Suspicious Cash Flow': [
      `${entityName} received INR 3.8 Cr in cash deposits across 14 bank accounts in a 30-day window, immediately followed by outward remittances to overseas accounts.`,
      `Cash withdrawal pattern for ${entityName} correlates with major contract award dates, suggesting systematic kickback payments.`,
    ],
    'Regulatory Non-Compliance': [
      `${entityName} has failed to file mandatory compliance reports for 3 consecutive quarters. Environmental clearances obtained appear to contain falsified data.`,
      `Audit reveals ${entityName} bypassed mandatory approvals from the Central Vigilance Commission for 4 high-value procurement decisions.`,
    ],
  };

  const options = descriptions[category] ?? [
    `Suspicious activity detected involving ${entityName}. Further investigation recommended.`,
  ];

  return pick(options);
}

// ---------------------------------------------------------------------------
// Case generation (20 cases)
// ---------------------------------------------------------------------------

function generateCases(entities: Entity[], alerts: Alert[]): Case[] {
  const cases: Case[] = [];
  const statusOptions: CaseStatus[] = ['new', 'in_progress', 'pending', 'closed'];
  const priorityOptions: AlertPriority[] = ['critical', 'high', 'medium', 'low'];
  const investigators = [
    'Inspector R. Krishnamurthy', 'ACP Meena Sharma', 'DySP Arvind Rao',
    'Superintendent K. Nair', 'Inspector P. Chatterjee', 'ACP Sunita Verma',
    'DySP Manoj Tiwari', 'Inspector L. Deshmukh',
  ];

  const caseTitles = [
    'Highway Construction Bid Rigging Network',
    'Municipal Fund Diversion Scheme',
    'Shell Company Nexus — Infrastructure Sector',
    'Disproportionate Assets — Senior Official',
    'Benami Property Holdings Investigation',
    'Tender Manipulation — Smart City Project',
    'Kickback Ring — Medical Procurement',
    'Land Acquisition Irregularities',
    'Defence Procurement Fraud',
    'Railway Modernization Fund Misuse',
    'Rural Development Fund Embezzlement',
    'Port Authority Contract Cartel',
    'Pharma Procurement Price Fixing',
    'IT Infrastructure Vendor Favouritism',
    'Water Supply Project Ghost Contractors',
    'Education Fund Siphoning Scheme',
    'Coal Block Allocation Irregularities',
    'Real Estate Regulatory Bypass',
    'Public Housing Beneficiary Fraud',
    'Bridge Construction Quality Fraud',
  ];

  for (let i = 0; i < 20; i++) {
    const linkedEntities = pickN(entities, randInt(2, 6));
    const linkedAlerts = pickN(alerts, randInt(1, 5));
    const status = pick(statusOptions);
    const priority = pick(priorityOptions);
    const createdAt = daysAgo(90);
    const updatedAt = daysAgo(10);

    const evidence: Evidence[] = [];
    const evidenceCount = randInt(1, 5);
    for (let e = 0; e < evidenceCount; e++) {
      evidence.push({
        id: `ev-${uuid().slice(0, 8)}`,
        type: pick(['document', 'transaction', 'communication', 'report']),
        title: pick(EVIDENCE_TITLES),
        description: `Evidence collected during investigation of ${caseTitles[i]}.`,
        source: pick(['CBI', 'ED', 'Income Tax Dept', 'CAG', 'Lokpal', 'ACB']),
        timestamp: daysAgo(60),
        metadata: {
          fileSize: `${randInt(100, 5000)}KB`,
          pages: String(randInt(1, 200)),
        },
      });
    }

    const activityTypes: Activity['type'][] = [
      'created', 'updated', 'escalated', 'comment', 'evidence_added', 'status_changed',
    ];
    const activities: Activity[] = [];
    const activityCount = randInt(3, 8);
    for (let a = 0; a < activityCount; a++) {
      activities.push({
        id: `act-${uuid().slice(0, 8)}`,
        type: pick(activityTypes),
        description: pick([
          'Case file created and assigned to investigation team.',
          'New evidence documents uploaded from audit report.',
          'Case escalated to senior investigation officer.',
          'Preliminary findings shared with oversight committee.',
          'Witness statement recorded and added to case file.',
          'Status updated based on field investigation report.',
          'Cross-referenced with Financial Intelligence Unit data.',
          'Requested additional information from state revenue department.',
        ]),
        user: pick(investigators),
        timestamp: daysAgo(45),
      });
    }

    cases.push({
      id: `case-${String(i + 1).padStart(3, '0')}`,
      title: caseTitles[i],
      status,
      priority,
      assignee: pick(investigators),
      entityIds: linkedEntities.map((e) => e.id),
      alertIds: linkedAlerts.map((a) => a.id),
      summary: generateCaseSummary(caseTitles[i], linkedEntities),
      riskScore: priority === 'critical' ? randInt(80, 99)
        : priority === 'high' ? randInt(60, 79)
        : priority === 'medium' ? randInt(35, 59)
        : randInt(10, 34),
      createdAt,
      updatedAt,
      evidence,
      activities,
      tags: pickN(TAGS, randInt(2, 5)),
    });
  }

  return cases;
}

function generateCaseSummary(title: string, entities: Entity[]): string {
  const entityNames = entities.slice(0, 3).map((e) => e.name).join(', ');
  const remaining = entities.length > 3 ? ` and ${entities.length - 3} others` : '';
  return (
    `Investigation into ${title.toLowerCase()} involving ${entityNames}${remaining}. ` +
    `Preliminary analysis indicates a coordinated network with potential violations of the Prevention of Corruption Act. ` +
    `Multiple financial trails and documentary evidence have been identified for further forensic examination.`
  );
}

// ---------------------------------------------------------------------------
// Graph generation (~200 edges)
// ---------------------------------------------------------------------------

function generateGraphData(entities: Entity[]): {
  nodes: GraphNode[];
  edges: GraphEdge[];
} {
  const nodes: GraphNode[] = entities.map((e) => ({
    data: {
      id: e.id,
      label: e.name,
      type: e.type,
      riskScore: e.riskScore,
      connectionCount: e.connectionCount,
      status: e.status,
    },
  }));

  const edges: GraphEdge[] = [];
  const edgeTypes: GraphEdge['data']['type'][] = [
    'financial', 'organizational', 'familial', 'contractual',
  ];
  const existingPairs = new Set<string>();

  // Ensure every entity has at least 1 connection
  for (let i = 1; i < entities.length; i++) {
    const source = entities[i].id;
    const target = entities[randInt(0, i - 1)].id;
    const pairKey = [source, target].sort().join('|');
    if (!existingPairs.has(pairKey)) {
      existingPairs.add(pairKey);
      edges.push({
        data: {
          id: `edge-${uuid().slice(0, 8)}`,
          source,
          target,
          label: pick(EDGE_LABELS),
          confidence: randInt(40, 99) / 100,
          type: pick(edgeTypes),
          isInferred: rng() < 0.25,
        },
      });
    }
  }

  // Add more edges to reach ~200
  const targetEdgeCount = 200;
  let attempts = 0;
  while (edges.length < targetEdgeCount && attempts < 1000) {
    attempts++;
    const source = pick(entities).id;
    const target = pick(entities).id;
    if (source === target) continue;

    const pairKey = [source, target].sort().join('|');
    if (existingPairs.has(pairKey)) continue;

    existingPairs.add(pairKey);
    edges.push({
      data: {
        id: `edge-${uuid().slice(0, 8)}`,
        source,
        target,
        label: pick(EDGE_LABELS),
        confidence: randInt(25, 99) / 100,
        type: pick(edgeTypes),
        isInferred: rng() < 0.3,
      },
    });
  }

  return { nodes, edges };
}

// ---------------------------------------------------------------------------
// Generate and export all mock data
// ---------------------------------------------------------------------------

export const mockEntities: Entity[] = generateEntities();
export const mockAlerts: Alert[] = generateAlerts(mockEntities);
export const mockCases: Case[] = generateCases(mockEntities, mockAlerts);

const graphData = generateGraphData(mockEntities);
export const mockGraphNodes: GraphNode[] = graphData.nodes;
export const mockGraphEdges: GraphEdge[] = graphData.edges;

// ---------------------------------------------------------------------------
// Real-time alert simulation
// ---------------------------------------------------------------------------

let alertCounter = mockAlerts.length;

export function generateNewAlert(): Alert {
  alertCounter++;
  const entity = pick(mockEntities);
  const category = pick(ALERT_CATEGORIES);
  const city = pick(CITIES);
  const priorityRoll = rng();
  const priority: AlertPriority =
    priorityRoll < 0.05 ? 'critical'
    : priorityRoll < 0.20 ? 'high'
    : priorityRoll < 0.70 ? 'medium'
    : 'low';

  return {
    id: `alert-${String(alertCounter).padStart(4, '0')}`,
    title: `${category} — ${entity.name}`,
    description: generateAlertDescription(category, entity.name, entity.type),
    priority,
    entityId: entity.id,
    entityName: entity.name,
    entityType: entity.type,
    riskScore: priority === 'critical' ? randInt(85, 99)
      : priority === 'high' ? randInt(65, 84)
      : priority === 'medium' ? randInt(35, 64)
      : randInt(10, 34),
    timestamp: new Date().toISOString(),
    isRead: false,
    isDismissed: false,
    source: pick(ALERT_SOURCES),
    location: jitter(city.lat, city.lng),
    category,
  };
}
