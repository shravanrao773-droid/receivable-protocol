import { useState, useEffect, useRef } from "react";

// ─── ARCHITECTURE DATA ────────────────────────────────────────────────────────

const LAYERS = [
  {
    id: "clients",
    label: "CLIENT LAYER",
    sublabel: "External Actors & Interfaces",
    color: "#38bdf8",
    y: 0,
    nodes: [
      { id: "web", label: "Web Browser", icon: "🌐", sub: "Next.js 14 SSR", x: 0 },
      { id: "mobile", label: "Mobile App", icon: "📱", sub: "iOS / Android", x: 1 },
      { id: "erp_sap", label: "SAP S/4HANA", icon: "🏭", sub: "ERP Client", x: 2 },
      { id: "erp_oracle", label: "Oracle ERP", icon: "🔷", sub: "ERP Client", x: 3 },
      { id: "edi", label: "EDI Partner", icon: "📡", sub: "X12 / EDIFACT", x: 4 },
      { id: "webhook", label: "Webhook Consumer", icon: "🔗", sub: "Real-time push", x: 5 },
    ],
  },
  {
    id: "edge",
    label: "EDGE & SECURITY LAYER",
    sublabel: "DDoS protection · WAF · CDN · TLS 1.3",
    color: "#f87171",
    y: 1,
    nodes: [
      { id: "cloudflare", label: "Cloudflare", icon: "☁️", sub: "WAF · DDoS · DNS", x: 1 },
      { id: "cdn", label: "CloudFront CDN", icon: "⚡", sub: "AWS CDN · Static assets", x: 2.5 },
      { id: "waf", label: "AWS WAF", icon: "🛡", sub: "Web App Firewall", x: 4 },
    ],
  },
  {
    id: "gateway",
    label: "API GATEWAY & AUTH LAYER",
    sublabel: "OAuth 2.0 · JWT · Rate limiting · HMAC signing",
    color: "#fbbf24",
    y: 2,
    nodes: [
      { id: "kong", label: "Kong API Gateway", icon: "🔀", sub: "Rate limit · Route · Log", x: 1 },
      { id: "auth0", label: "Auth0", icon: "🔑", sub: "Identity · MFA · SSO", x: 2.5 },
      { id: "socketio", label: "Socket.io Server", icon: "⚡", sub: "Real-time events", x: 4 },
    ],
  },
  {
    id: "platform",
    label: "CRITEX PLATFORM CORE",
    sublabel: "Node.js Fastify microservices · Docker · Kubernetes (EKS)",
    color: "#22d3ee",
    y: 3,
    nodes: [
      { id: "kyc_svc", label: "KYC Engine", icon: "🔐", sub: "Identity · GPS · Tax ID", x: 0 },
      { id: "pricing_svc", label: "Pricing Engine", icon: "📈", sub: "LME · Margin · Quote", x: 1 },
      { id: "escrow_svc", label: "Escrow Manager", icon: "🔒", sub: "Milestone · Release", x: 2 },
      { id: "doc_svc", label: "Document Engine", icon: "📄", sub: "Invoice · BL · DPP", x: 3 },
      { id: "track_svc", label: "Tracking Service", icon: "🚢", sub: "AIS · Container ETA", x: 4 },
      { id: "compliance_svc", label: "Compliance Engine", icon: "✅", sub: "OFAC · AML · CBAM", x: 5 },
    ],
  },
  {
    id: "queue",
    label: "ASYNC PROCESSING LAYER",
    sublabel: "Background jobs · Event bus · Scheduled tasks",
    color: "#a78bfa",
    y: 4,
    nodes: [
      { id: "bull", label: "Bull Queue", icon: "⚙️", sub: "Redis-backed jobs", x: 1 },
      { id: "cron", label: "Cron Scheduler", icon: "🕐", sub: "LME refresh · Alerts", x: 2.5 },
      { id: "events", label: "Event Bus", icon: "📨", sub: "Webhooks · Notifications", x: 4 },
    ],
  },
  {
    id: "data",
    label: "DATA LAYER",
    sublabel: "Encrypted at rest (AES-256 · AWS KMS) · Multi-region",
    color: "#4ade80",
    y: 5,
    nodes: [
      { id: "postgres", label: "PostgreSQL 16", icon: "🐘", sub: "Primary · Trade data", x: 0 },
      { id: "redis", label: "Redis", icon: "🔴", sub: "Cache · Sessions", x: 1 },
      { id: "mongo", label: "MongoDB", icon: "🍃", sub: "DPP · Certs · Docs", x: 2 },
      { id: "s3", label: "AWS S3", icon: "🗄", sub: "Files · PDFs · Images", x: 3 },
      { id: "elastic", label: "Elasticsearch", icon: "🔍", sub: "Search · Matching", x: 4 },
      { id: "snowflake", label: "Snowflake", icon: "❄️", sub: "Analytics · BI", x: 5 },
    ],
  },
  {
    id: "integrations",
    label: "EXTERNAL INTEGRATIONS",
    sublabel: "Third-party APIs · Verified data sources · Payment rails",
    color: "#fb923c",
    y: 6,
    nodes: [
      { id: "lme", label: "LME / Fastmarkets", icon: "💹", sub: "Live metal prices", x: 0 },
      { id: "sumsub", label: "Sumsub KYC", icon: "👤", sub: "Identity · Biometric", x: 1 },
      { id: "sgs_api", label: "SGS / BV / Intertek", icon: "🧪", sub: "Cert verification API", x: 2 },
      { id: "transpact", label: "Transpact Escrow", icon: "💰", sub: "Fund custody · Release", x: 3 },
      { id: "marinetraffic", label: "Marine Traffic", icon: "🛳", sub: "AIS vessel tracking", x: 4 },
      { id: "tax_db", label: "Tax DBs (GST/VAT)", icon: "🏛", sub: "ACRA · IRAS · VIES", x: 5 },
    ],
  },
  {
    id: "infra",
    label: "INFRASTRUCTURE LAYER",
    sublabel: "AWS Multi-region · IaC · CI/CD · Observability",
    color: "#64748b",
    y: 7,
    nodes: [
      { id: "eks", label: "AWS EKS", icon: "☸️", sub: "Kubernetes cluster", x: 1 },
      { id: "github", label: "GitHub Actions", icon: "⚙️", sub: "CI/CD pipeline", x: 2.5 },
      { id: "datadog", label: "Datadog", icon: "📊", sub: "APM · Logs · Alerts", x: 4 },
    ],
  },
];

const NODE_DETAIL = {
  web: { tech: ["Next.js 14 (SSR + App Router)", "React 18 + Zustand", "TanStack Query", "Tailwind CSS + DM Mono"], security: ["TLS 1.3", "CSP Headers", "CSRF protection"], note: "Renders server-side for SEO. Client hydration for real-time price updates via Socket.io." },
  mobile: { tech: ["React Native (iOS + Android)", "Phase 2 deliverable", "Offline-first with sync"], security: ["Device fingerprint", "Biometric auth", "Certificate pinning"], note: "Phase 2. Shares API layer with web. Critical for seller GPS-authenticated listing creation." },
  erp_sap: { tech: ["SAP Integration Suite", "SAP API Management", "BAPI/RFC connector", "IDoc format support"], security: ["mTLS", "OAuth 2.0 machine-to-machine", "IP allowlist"], note: "Tier-1 buyer ERP connection. Pushes POs, Invoices, BLs, shipment events directly into SAP." },
  erp_oracle: { tech: ["Oracle Integration Cloud (OIC)", "REST + SOAP adapter", "Oracle ERP Cloud API"], security: ["OAuth 2.0", "mTLS", "Payload signing"], note: "Alternative to SAP for buyers running Oracle. Same event model, different connector." },
  edi: { tech: ["EDI X12 (US standard)", "EDIFACT (international)", "AS2 / SFTP transport", "850/810/856/214 docs"], security: ["AS2 MDN receipts", "PGP encryption", "AS2 certificates"], note: "For legacy ERP buyers who cannot use REST APIs. Auto-translates CRITEX events to EDI transactions." },
  webhook: { tech: ["HMAC-SHA256 signed payloads", "Retry with exponential backoff", "Event schema: JSON-LD", "Dead letter queue"], security: ["Signature verification", "TLS delivery only", "IP allowlist option"], note: "Pushes: listing.created, offer.accepted, escrow.funded, milestone.released, shipment.arrived, dpp.ready" },
  cloudflare: { tech: ["Cloudflare CDN (global PoPs)", "DDoS mitigation (L3/L4/L7)", "DNS over HTTPS", "Bot management"], security: ["Rate limiting by IP/UA", "Geo-blocking for OFAC countries", "Challenge pages for suspicious traffic"], note: "First line of defence. All traffic passes through Cloudflare before reaching AWS. OFAC-listed country IPs auto-blocked at edge." },
  cdn: { tech: ["AWS CloudFront (450+ PoPs)", "S3 origin for static assets", "Lambda@Edge for auth", "Signed URLs for documents"], security: ["Signed URL expiry (15 min)", "OAC (Origin Access Control)", "Field-level encryption"], note: "Serves all static assets, PDFs, and document downloads. Signed URLs ensure only authenticated users access documents." },
  waf: { tech: ["AWS WAF v2", "OWASP Top 10 ruleset", "SQL injection protection", "XSS filtering"], security: ["Custom rules per endpoint", "IP reputation blocking", "Rate-based rules"], note: "Protects the API Gateway. Custom rules tuned for trade finance patterns — blocks credential stuffing on login endpoints." },
  kong: { tech: ["Kong Gateway (OSS)", "Rate limiting plugin", "Request/response logging", "JWT validation plugin"], security: ["API key management", "mTLS for service-to-service", "Request signing validation"], note: "Central routing for all CRITEX APIs. Enforces rate limits: 100 req/min for clients, 1000 req/min for ERP integrations." },
  auth0: { tech: ["Auth0 (Okta)", "JWT access tokens (15 min)", "Refresh tokens (7 days)", "MFA (TOTP + SMS)", "SSO for enterprise buyers"], security: ["PKCE flow for SPAs", "Refresh token rotation", "Anomaly detection", "Brute force protection"], note: "Handles all authentication. admin@critex.io domain auto-routes to admin role. Client emails route to buyer/seller/third-party roles." },
  socketio: { tech: ["Socket.io v4", "Redis adapter (multi-node)", "Namespaces per role", "Room-based events"], security: ["JWT auth on connection", "Per-room access control", "Rate limiting on emit"], note: "Powers: real-time LME price updates (30s interval), shipment position updates, KYC review notifications, escrow milestone alerts." },
  kyc_svc: { tech: ["Node.js + Fastify", "Sumsub API integration", "GPS metadata parser (EXIF)", "Tax DB API router"], security: ["PII encrypted at field level", "AES-256 key per entity", "Access logged immutably"], note: "Core KYC flow: Device fingerprint → IP geolocation → Sumsub identity verify → Tax ID API call → GPS coordinates capture → Sanctions screening → Trust Score calculation (0-100)." },
  pricing_svc: { tech: ["Node.js + Fastify", "LME WebSocket feed", "Fastmarkets REST API", "Redis price cache (30s TTL)", "Margin calculation engine"], security: ["Price audit log (immutable)", "Calculation hash stored per quote"], note: "Inputs: LME spot, grade factor, seller ask, jurisdiction risk, freight estimate, inspection fee, escrow fee, insurance. Output: CRITEX sell price + breakdown. Recalculates every 30 seconds." },
  escrow_svc: { tech: ["Node.js + Fastify", "Transpact API integration", "Milestone state machine", "PostgreSQL ACID transactions"], security: ["Dual-signature releases", "Compliance officer approval for M5", "All releases time-stamped + hashed"], note: "5-stage milestone FSM: DEAL_CONFIRMED → PRE_SHIP_INSPECT → BL_SUBMITTED → VESSEL_DEPARTED → FINAL_CERT. Fund release only triggers on verified evidence at each stage." },
  doc_svc: { tech: ["Node.js + Fastify", "PDFKit (invoice/BL generation)", "AWS Textract (OCR for uploaded BLs)", "DocuSign API (e-signatures)", "DPP JSON-LD schema builder"], security: ["Document hash (SHA-256) stored immutably", "DocuSign audit trail", "S3 presigned URLs"], note: "Generates: CRITEX Invoice A (seller→CRITEX), Invoice B (CRITEX→buyer), Master BL reference, House BL, Digital Product Passport (DPP v1.2). Symmetry engine validates field parity." },
  track_svc: { tech: ["Marine Traffic API (AIS)", "project44 multimodal API", "Container line APIs (Maersk, MSC, CMA)", "Server-sent events to frontend"], security: ["API key rotation (30 days)", "Tracking data cached (no PII)"], note: "Container number + vessel name extracted from BL via OCR → Marine Traffic AIS activated → ETA calculated → notifications scheduled at T-7d, T-3d, T-1d, arrival." },
  compliance_svc: { tech: ["Node.js + Fastify", "OFAC API (real-time)", "EU Consolidated Sanctions List", "UN Sanctions API", "Elliptic AML (transaction monitoring)", "CBAM calculation engine"], security: ["Every screening logged with timestamp", "STR (suspicious transaction report) trigger", "GDPR-compliant data handling"], note: "Runs on: every KYC event, every transaction creation, every price >$500K. CBAM module calculates embedded carbon per MT and generates EU-compliant declaration XML." },
  bull: { tech: ["Bull (Redis-backed queue)", "Separate queues: kyc, pricing, notifications, dpp", "Concurrency: 10 workers/queue", "Dead letter queue for failures"], security: ["Job payload encrypted in Redis", "Failure alerting via Datadog"], note: "Async heavy lifting: DPP generation (CPU-intensive), batch KYC re-screening, certificate verification polling, SGS API calls, email dispatch." },
  cron: { tech: ["node-cron", "LME price refresh: every 30s", "Sanctions list sync: daily 00:00 UTC", "Listing expiry check: hourly", "KYC re-screen: monthly"], security: ["Cron job logging to Datadog", "Failure alerting on Slack #ops"], note: "Keeps CRITEX data fresh without manual intervention. LME 30s refresh feeds the pricing engine. Sanctions list daily sync ensures no stale screening data." },
  events: { tech: ["Custom event bus (Redis pub/sub)", "Webhook dispatcher (Bull queue)", "Email: AWS SES", "SMS: Twilio (for critical alerts)"], security: ["Webhook HMAC-SHA256 signing", "Email SPF + DKIM + DMARC", "PII redacted from webhook payloads"], note: "All 24 platform events published here: listing lifecycle, KYC outcomes, escrow milestones, shipment updates, DPP generation. External systems subscribe via webhooks or SSE." },
  postgres: { tech: ["PostgreSQL 16 (Primary)", "Read replicas (2×)", "AWS RDS Multi-AZ", "pgcrypto for field-level encryption", "WAL-based PITR backups"], security: ["AES-256 encryption at rest (AWS KMS)", "VPC private subnet only", "No public internet access", "Row-level security (RLS) by tenant"], note: "Stores: Users, entities, listings, transactions, escrow milestones, document metadata, audit log (append-only, no UPDATE/DELETE). 99.99% SLA." },
  redis: { tech: ["Redis 7 (ElastiCache)", "Cluster mode (3 shards)", "AOF persistence", "LRU eviction policy"], security: ["AUTH password", "TLS in-transit", "VPC private only"], note: "Stores: LME price cache (30s TTL), session tokens, rate limit counters, Bull job queues, Socket.io adapter state, price calculation results cache." },
  mongo: { tech: ["MongoDB Atlas (M30 cluster)", "Flexible document schema", "Atlas Search for full-text", "Change streams for real-time sync"], security: ["Field-level encryption (CSFLE)", "IP allowlist", "Atlas audit logs"], note: "Stores: Digital Product Passports (DPP JSON-LD), inspection certificates (variable schema by lab), assay reports, KYC document metadata. Schema flexibility needed here." },
  s3: { tech: ["AWS S3 (3 buckets: docs, public, archive)", "Versioning enabled", "Lifecycle: archive to Glacier after 1 year", "CloudFront origin"], security: ["SSE-KMS encryption", "Bucket policies (no public access)", "Object-level logging to CloudTrail", "Signed URLs (15 min expiry)"], note: "Stores: All uploaded PDFs (certificates, BLs, assays), geo-tagged photos (EXIF metadata preserved), generated DPP PDFs, invoice PDFs, company KYC documents." },
  elastic: { tech: ["Elasticsearch 8 (AWS OpenSearch)", "3-node cluster", "Index: materials, sellers, buyers, listings", "Custom analyzers for metal terminology"], security: ["VPC private", "Fine-grained access control", "TLS in-transit"], note: "Powers: Material search and filtering, buyer-seller matching algorithm, similar listing recommendations, free-text search across platform. Sub-100ms response target." },
  snowflake: { tech: ["Snowflake (Business Critical tier)", "dbt for data transformations", "Fivetran ELT from PostgreSQL", "Metabase for BI dashboards"], security: ["Column-level security", "Dynamic data masking for PII", "IP allowlist", "SOC 2 Type II certified"], note: "Analytics warehouse: transaction analytics, pricing intelligence (real vs LME over time), seller quality trends, buyer demand signals. Future: CRITEX Metal Price Index product." },
  lme: { tech: ["LME REST API (live prices)", "Fastmarkets (Li, Co hydroxide)", "LBMA (Au, Ag, PGM)", "Metal Bulletin indices", "SHFE (Shanghai futures reference)"], security: ["API key rotation", "Rate limit: 1 call/30s", "Fallback to cached price + alert"], note: "The heartbeat of the pricing engine. LME cash prices pulled every 30 seconds. If API down, last known price used with visible 'INDICATIVE' flag shown to all users." },
  sumsub: { tech: ["Sumsub REST API v1", "Webhook for async results", "220+ countries supported", "Liveness check (anti-spoofing)", "PEP/Sanctions integration"], security: ["Data encrypted at Sumsub", "GDPR-compliant EU data residency", "API key per environment"], note: "Handles: document OCR, facial liveness, biometric matching, PEP screening, adverse media scan. Returns risk score 0-100. Triggers KYC status update in CRITEX." },
  sgs_api: { tech: ["SGS Certificate Verification API", "Bureau Veritas (BV) portal API", "Intertek certificate lookup", "OCR fallback (AWS Textract) for non-API certs"], security: ["Certificate number hashed before API call", "Response immutably stored", "HTTPS only"], note: "Certificate number extracted from uploaded PDF → API call to lab portal → VALID/INVALID response + original data → cross-check against CRITEX record → authenticity flag set." },
  transpact: { tech: ["Transpact REST API", "Webhook for milestone events", "Multi-currency (USD, EUR, SGD)", "Fund reconciliation API"], security: ["mTLS with Transpact", "Dual-signature release protocol", "FCA regulated (UK)"], note: "Holds 100% of buyer funds at deal acceptance. Releases in 5 tranches as CRITEX triggers milestones. Fund reversal possible if trade collapses at M1-M4." },
  marinetraffic: { tech: ["Marine Traffic API v2 (AIS data)", "Vessel position (6h update)", "Container line APIs: Maersk, MSC, CMA CGM", "project44 (premium tier, Phase 2)"], security: ["API key per environment", "Vessel data cached (no PII)", "Rate limit: 100 calls/hour"], note: "Activated when BL is uploaded. Vessel name + IMO number → live AIS position. Container # → carrier API event log. ETA dynamically updated and pushed to buyer dashboard." },
  tax_db: { tech: ["Singapore IRAS GST verification API", "UAE FTA TRN verification", "India GST Network (GSTN) API", "EU VIES VAT API (European Commission)", "UK HMRC VAT API", "South Korea NTS business registry"], security: ["No PII stored — verification only", "Result logged (pass/fail + timestamp)", "API keys rotated quarterly"], note: "Called during KYC onboarding for every business entity. Real-time verification that the tax number is valid, active, and matches the registered business name." },
  eks: { tech: ["AWS EKS (Kubernetes 1.29)", "3 node groups: platform, data-jobs, monitoring", "Horizontal Pod Autoscaler", "AWS Fargate for serverless pods"], security: ["OPA (Open Policy Agent) admission control", "Network policies (Calico)", "Secrets from AWS Secrets Manager", "Node IAM roles — least privilege"], note: "Runs all CRITEX microservices. Auto-scales: platform services 2–20 pods, job workers 1–50 pods. Multi-AZ across eu-west-1 (Frankfurt) and ap-southeast-1 (Singapore)." },
  github: { tech: ["GitHub Actions (CI/CD)", "ArgoCD (GitOps delivery)", "Trivy (container security scan)", "Snyk (dependency scan)", "Terraform (IaC)"], security: ["Branch protection (main)", "Required reviews (2+)", "Secrets in GitHub Secrets / AWS SSM", "SARIF security reports"], note: "Push to main → GitHub Actions builds + tests → Trivy + Snyk scan → Docker image push to ECR → ArgoCD detects new image → rolls out to EKS (canary → full)." },
  datadog: { tech: ["Datadog APM (distributed tracing)", "Log Management (30-day retention)", "Infrastructure metrics", "Synthetic monitoring (uptime)", "PagerDuty integration for P0 alerts"], security: ["PII scrubbing in log pipeline", "RBAC on Datadog dashboards", "Audit trail for all admin actions"], note: "Full observability: P99 latency per service, error rates, queue depths, LME API uptime, escrow state machine transitions. On-call rota via PagerDuty for P0/P1 incidents." },
};

const FLOWS = [
  { id: "trade", label: "Trade Flow", color: "#22d3ee", description: "Seller → KYC → Listing → Pricing Engine → Offer → Buyer accepts → Escrow → Milestones → DPP" },
  { id: "kyc", label: "KYC Flow", color: "#f87171", description: "Registration → Device fingerprint → Auth0 → KYC Engine → Sumsub → Tax DB → Sanctions → Trust Score" },
  { id: "payment", label: "Payment Flow", color: "#4ade80", description: "Buyer deposits → Transpact escrow → Milestone verified → Partial releases → Final cert → Full release" },
  { id: "data", label: "Data Flow", color: "#a78bfa", description: "PostgreSQL → Fivetran ELT → Snowflake → dbt → Metabase analytics dashboards" },
];

// ─── NODE BOX ─────────────────────────────────────────────────────────────────
function NodeBox({ node, layerColor, selected, onClick, animated }) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    if (animated) {
      const t = setInterval(() => setPulse(p => !p), 1500 + Math.random() * 2000);
      return () => clearInterval(t);
    }
  }, [animated]);

  return (
    <div
      onClick={() => onClick(node.id)}
      style={{
        position: "relative",
        background: selected ? layerColor + "22" : "rgba(255,255,255,0.03)",
        border: `1px solid ${selected ? layerColor : "rgba(255,255,255,0.1)"}`,
        borderRadius: 8,
        padding: "8px 10px",
        cursor: "pointer",
        transition: "all 0.2s",
        minWidth: 100,
        boxShadow: selected ? `0 0 16px ${layerColor}40` : pulse ? `0 0 8px ${layerColor}20` : "none",
        transform: selected ? "translateY(-2px)" : "none",
      }}
    >
      {/* Top accent */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: selected ? layerColor : layerColor + "40", borderRadius: "8px 8px 0 0" }} />
      <div style={{ fontSize: 16, marginBottom: 4, lineHeight: 1 }}>{node.icon}</div>
      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 10, color: selected ? "white" : "rgba(255,255,255,0.8)", lineHeight: 1.2, marginBottom: 2 }}>{node.label}</div>
      <div style={{ fontSize: 8, color: selected ? layerColor : "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>{node.sub}</div>
      {/* Pulse dot */}
      {animated && (
        <div style={{ position: "absolute", top: 6, right: 6, width: 5, height: 5, borderRadius: "50%", background: layerColor, opacity: pulse ? 1 : 0.3, transition: "opacity 0.5s", boxShadow: `0 0 4px ${layerColor}` }} />
      )}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function CritexArchDiagram() {
  const [selected, setSelected] = useState(null);
  const [activeFlow, setActiveFlow] = useState(null);
  const [viewMode, setViewMode] = useState("full"); // full | layer
  const [activeLayer, setActiveLayer] = useState("platform");
  const detail = selected ? NODE_DETAIL[selected] : null;
  const selectedNode = selected ? LAYERS.flatMap(l => l.nodes).find(n => n.id === selected) : null;
  const selectedLayer = selected ? LAYERS.find(l => l.nodes.some(n => n.id === selected)) : null;

  function handleNodeClick(id) {
    setSelected(selected === id ? null : id);
  }

  return (
    <div style={{ fontFamily: "'DM Mono', 'Courier New', monospace", background: "#060810", minHeight: "100vh", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060810; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
        .tab { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 9px; padding: 5px 12px; border-radius: 5px; border: 1px solid rgba(255,255,255,0.08); cursor: pointer; background: transparent; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; text-transform: uppercase; transition: all 0.12s; white-space: nowrap; }
        .tab.on { border-color: rgba(34,211,238,0.4); color: #22d3ee; background: rgba(34,211,238,0.08); }
        .tab:hover:not(.on) { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); }
        .flow-btn { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 9px; padding: 5px 12px; border-radius: 5px; border: 1px solid; cursor: pointer; background: transparent; letter-spacing: 0.06em; transition: all 0.12s; }
        .connector { position: absolute; pointer-events: none; }
        @keyframes dash { to { stroke-dashoffset: -20; } }
        @keyframes flowPulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
        .fade { animation: fu 0.3s ease forwards; opacity: 0; }
        @keyframes fu { to { opacity: 1; } }
        .layer-card { border-radius: 12px; padding: 16px 18px; margin-bottom: 12px; }
        .grid-overlay { background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 32px 32px; }
      `}</style>

      {/* TOPBAR */}
      <div style={{ background: "rgba(6,8,16,0.97)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 20px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "linear-gradient(135deg,#0891b2,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "Syne", fontWeight: 900, fontSize: 10, color: "white" }}>CX</span>
          </div>
          <div>
            <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 13, color: "white", letterSpacing: "0.1em" }}>CRITEX</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em" }}>SYSTEM ARCHITECTURE · v1.0</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginRight: 4 }}>VIEW:</span>
          <button className={`tab ${viewMode === "full" ? "on" : ""}`} onClick={() => setViewMode("full")}>Full Stack</button>
          <button className={`tab ${viewMode === "layer" ? "on" : ""}`} onClick={() => setViewMode("layer")}>Layer Detail</button>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)", margin: "0 6px" }} />
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>CLICK ANY NODE FOR DETAIL</span>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 52px)" }}>

        {/* ── LEFT: MAIN DIAGRAM ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", minWidth: 0 }} className="grid-overlay">

          {/* Data flow legend */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>DATA FLOWS:</span>
            {FLOWS.map(f => (
              <button
                key={f.id}
                className="flow-btn"
                style={{ borderColor: activeFlow === f.id ? f.color : f.color + "40", color: activeFlow === f.id ? f.color : f.color + "80", background: activeFlow === f.id ? f.color + "15" : "transparent" }}
                onClick={() => setActiveFlow(activeFlow === f.id ? null : f.id)}
              >
                {f.label}
              </button>
            ))}
            {activeFlow && (
              <div style={{ fontSize: 9, color: FLOWS.find(f => f.id === activeFlow)?.color, background: "rgba(0,0,0,0.4)", border: `1px solid ${FLOWS.find(f => f.id === activeFlow)?.color}30`, borderRadius: 5, padding: "4px 10px", maxWidth: 500, lineHeight: 1.5 }}>
                ▶ {FLOWS.find(f => f.id === activeFlow)?.description}
              </div>
            )}
          </div>

          {/* FULL STACK VIEW */}
          {viewMode === "full" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {LAYERS.map((layer, li) => (
                <div key={layer.id} className="fade" style={{ animationDelay: li * 0.05 + "s" }}>
                  {/* Layer header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 3, height: 18, background: layer.color, borderRadius: 2, flexShrink: 0 }} />
                    <div>
                      <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 9, color: layer.color, letterSpacing: "0.14em" }}>{layer.label}</span>
                      <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginLeft: 8 }}>{layer.sublabel}</span>
                    </div>
                  </div>
                  {/* Nodes */}
                  <div style={{ display: "flex", gap: 6, padding: "10px 12px", background: layer.color + "06", border: `1px solid ${layer.color}18`, borderRadius: 10, flexWrap: "wrap" }}>
                    {layer.nodes.map(node => (
                      <NodeBox
                        key={node.id}
                        node={node}
                        layerColor={layer.color}
                        selected={selected === node.id}
                        onClick={handleNodeClick}
                        animated={layer.id === "platform" || layer.id === "integrations"}
                      />
                    ))}
                  </div>
                  {/* Connector arrows between layers */}
                  {li < LAYERS.length - 1 && (
                    <div style={{ display: "flex", justifyContent: "center", padding: "3px 0", gap: 4, alignItems: "center" }}>
                      {[...Array(7)].map((_, i) => (
                        <div key={i} style={{ width: 1, height: 12, background: `linear-gradient(to bottom, ${layer.color}40, ${LAYERS[li + 1].color}40)` }} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* LAYER DETAIL VIEW */}
          {viewMode === "layer" && (
            <div>
              <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {LAYERS.map(l => (
                  <button key={l.id} className={`tab ${activeLayer === l.id ? "on" : ""}`}
                    style={{ borderColor: activeLayer === l.id ? l.color : undefined, color: activeLayer === l.id ? l.color : undefined, background: activeLayer === l.id ? l.color + "10" : undefined }}
                    onClick={() => setActiveLayer(l.id)}
                  >{l.label.split(" ")[0]}</button>
                ))}
              </div>
              {LAYERS.filter(l => l.id === activeLayer).map(layer => (
                <div key={layer.id} className="fade">
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: layer.color, marginBottom: 4 }}>{layer.label}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{layer.sublabel}</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 12 }}>
                    {layer.nodes.map(node => {
                      const d = NODE_DETAIL[node.id];
                      return (
                        <div key={node.id} style={{ background: selected === node.id ? layer.color + "15" : "rgba(255,255,255,0.025)", border: `1px solid ${selected === node.id ? layer.color : "rgba(255,255,255,0.08)"}`, borderRadius: 12, padding: 16, cursor: "pointer", transition: "all 0.2s" }}
                          onClick={() => handleNodeClick(node.id)}>
                          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: layer.color + "18", border: `1px solid ${layer.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{node.icon}</div>
                            <div>
                              <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 13, color: "white" }}>{node.label}</div>
                              <div style={{ fontSize: 9, color: layer.color, marginTop: 1 }}>{node.sub}</div>
                            </div>
                          </div>
                          {d && <>
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Tech Stack</div>
                            {d.tech.slice(0, 3).map((t, i) => <div key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginBottom: 3, display: "flex", gap: 6 }}><span style={{ color: layer.color }}>›</span>{t}</div>)}
                            <div style={{ marginTop: 10, fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, borderTop: `1px solid ${layer.color}15`, paddingTop: 8 }}>{d.note?.slice(0, 100)}…</div>
                          </>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats row */}
          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 8 }}>
            {[
              { l: "Total Layers", v: "8", c: "#22d3ee" },
              { l: "Microservices", v: "6 core", c: "#4ade80" },
              { l: "External APIs", v: "12 integrations", c: "#f59e0b" },
              { l: "Data stores", v: "6 types", c: "#a78bfa" },
              { l: "Cloud regions", v: "3 (SG/EU/US)", c: "#38bdf8" },
              { l: "Target SLA", v: "99.95%", c: "#f472b6" },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{s.l}</div>
                <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 16, color: s.c }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: DETAIL PANEL ── */}
        <div style={{ width: 320, borderLeft: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)", overflowY: "auto", flexShrink: 0 }}>
          {!selected && (
            <div style={{ padding: 20, height: "100%", display: "flex", flexDirection: "column" }}>
              {/* Architecture summary */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 16, color: "white", marginBottom: 6 }}>Architecture Overview</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>Click any node to inspect its tech stack, security model, and role in the CRITEX platform.</div>
              </div>
              {/* Layer legend */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {LAYERS.map(l => (
                  <div key={l.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 10px", background: l.color + "08", border: `1px solid ${l.color}18`, borderRadius: 7 }}>
                    <div style={{ width: 3, height: "100%", minHeight: 28, background: l.color, borderRadius: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 10, color: l.color }}>{l.label}</div>
                      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 1, lineHeight: 1.4 }}>{l.sublabel}</div>
                    </div>
                    <div style={{ marginLeft: "auto", fontSize: 9, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{l.nodes.length} nodes</div>
                  </div>
                ))}
              </div>
              {/* Key design principles */}
              <div style={{ marginTop: "auto" }}>
                <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Design Principles</div>
                {[
                  { icon: "🔒", title: "Zero Trust Security", desc: "Every service authenticates every request. No implicit trust between internal services." },
                  { icon: "🌍", title: "Multi-Region", desc: "Active in SG (ap-southeast-1) and EU (eu-west-1). Data residency enforced for GDPR." },
                  { icon: "📊", title: "Event-Driven", desc: "All platform state changes emit events. External systems subscribe via webhooks or SSE." },
                  { icon: "⚡", title: "Async by Default", desc: "Heavy tasks (DPP gen, KYC, cert verify) run in Bull queues — never blocking the API." },
                ].map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{p.icon}</span>
                    <div>
                      <div style={{ fontFamily: "Syne", fontWeight: 600, fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 2 }}>{p.title}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selected && detail && selectedLayer && (
            <div className="fade" style={{ padding: 20 }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${selectedLayer.color}20` }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: selectedLayer.color + "18", border: `1px solid ${selectedLayer.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {selectedNode?.icon}
                </div>
                <div>
                  <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 16, color: "white", marginBottom: 3 }}>{selectedNode?.label}</div>
                  <div style={{ fontSize: 9, color: selectedLayer.color, letterSpacing: "0.08em" }}>{selectedLayer.label} · {selectedNode?.sub}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>✕</button>
              </div>

              {/* Function note */}
              <div style={{ marginBottom: 16, padding: "12px 14px", background: selectedLayer.color + "08", border: `1px solid ${selectedLayer.color}15`, borderRadius: 8 }}>
                <div style={{ fontSize: 9, color: selectedLayer.color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>What it does</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>{detail.note}</div>
              </div>

              {/* Tech stack */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Tech Stack</div>
                {detail.tech.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: selectedLayer.color, flexShrink: 0, marginTop: 5 }} />
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>

              {/* Security */}
              <div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Security Controls</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {detail.security.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "6px 10px", background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.12)", borderRadius: 6 }}>
                      <span style={{ color: "#f87171", flexShrink: 0, fontSize: 10 }}>🛡</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected to */}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Layer</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: selectedLayer.color }} />
                  <span style={{ fontSize: 10, color: selectedLayer.color, fontFamily: "Syne", fontWeight: 600 }}>{selectedLayer.label}</span>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4, lineHeight: 1.5 }}>{selectedLayer.sublabel}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
