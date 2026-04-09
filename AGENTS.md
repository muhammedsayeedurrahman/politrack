<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PolitiTrace Architecture

## AI Agent System

### Stack
- **LLM Providers**: Gemini 2.0 Flash (primary), Groq Llama-3.3-70B (fallback), with auto rate-limit fallback
- **Agent Framework**: LangGraph.js StateGraphs with LangChain tool calling
- **Tools**: 20+ Zod-validated tools in `src/lib/ai/tools/`
- **Audit**: Append-only audit trail in `src/lib/ai/audit.ts`

### Agent Architecture
```
src/lib/ai/
├── providers.ts              # LLM provider chain (free tier cascade)
├── audit.ts                  # Immutable audit trail
├── agents/
│   ├── supervisor.ts         # Query routing + copilot orchestration
│   ├── triage-agent.ts       # Alert classification (escalate/investigate/monitor/dismiss)
│   ├── investigation-agent.ts # Deep-dive case analysis with LLM + rule fallback
│   ├── network-agent.ts      # Graph pattern detection + node explanation
│   └── report-agent.ts       # Threat briefings + copilot responses
└── tools/
    ├── alert-tools.ts        # query_alerts, get_alert_details, count_alerts
    ├── entity-tools.ts       # query_entities, get_entity_details, get_high_risk
    ├── case-tools.ts         # query_cases, get_case_details
    ├── graph-tools.ts        # get_node, get_connections, find_path
    ├── graph-analysis-tools.ts # detect_communities, calculate_centrality, detect_hubs
    ├── risk-tools.ts         # calculate_entity_risk
    ├── timeline-tools.ts     # build_entity_timeline, build_case_timeline
    └── pattern-tools.ts      # shell_companies, bid_rigging, conflict_of_interest, kickbacks
```

### Key Design Decisions
- Every agent has **graceful fallback** to rule-based analysis when LLM is unavailable
- All tool calls use **Zod schemas** for input validation
- Every agent action is logged to the **audit trail**
- **No database required** — in-memory data layer with mock data

### UI Design System
- **iOS Liquid Glass**: `glass-card`, `glass-panel`, `glass-header`, `glass-copilot` CSS classes
- **Motion**: framer-motion spring animations with design tokens
- **Agent Visualization**: `AgentActivity` component shows real-time agent reasoning steps

### Environment Variables
```
GOOGLE_GENERATIVE_AI_API_KEY  # Primary (free)
GROQ_API_KEY                   # Fallback (free)
```
