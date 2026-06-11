import type { ScenarioSeed } from "@/lib/scenario-types";

export type CareerKey =
  | "softwareEngineer"
  | "doctor"
  | "lawyer"
  | "investmentBanker"
  | "productManager"
  | "dataScientist";

export type { ScenarioSeed };

// ─── Categories per career ───────────────────────────────────────────

export type ScenarioCategory = {
  name: string;
  description: string;
};

export const CAREER_CATEGORIES: Record<CareerKey, ScenarioCategory[]> = {
  softwareEngineer: [
    { name: "Production Incidents", description: "Outages, degradations, and live-site issues" },
    { name: "System Design", description: "Architecting large-scale distributed systems" },
    { name: "Backend Engineering", description: "Server-side development and APIs" },
    { name: "Frontend Engineering", description: "Client-side development and UI engineering" },
    { name: "Databases", description: "Data modeling, SQL, NoSQL, and query optimization" },
    { name: "Networking & Security", description: "Network protocols, authentication, and security incidents" },
    { name: "CI/CD & DevOps", description: "Deployment pipelines, automation, and reliability" },
    { name: "Debugging & Root Cause", description: "Finding and fixing bugs in complex systems" },
    { name: "Behavioral & Leadership", description: "Soft skills, teamwork, and incident leadership" },
  ],
  doctor: [
    { name: "Diagnosis", description: "Clinical reasoning and differential diagnosis" },
    { name: "Emergency Response", description: "Acute care and emergency medicine" },
    { name: "Ethics", description: "Medical ethics and patient rights" },
    { name: "Patient Communication", description: "Breaking bad news and patient counseling" },
  ],
  lawyer: [
    { name: "Legal Reasoning", description: "Case analysis and legal argumentation" },
    { name: "Contracts", description: "Contract drafting, review, and negotiation" },
    { name: "Criminal Law", description: "Criminal procedure and defense strategy" },
    { name: "Client Communication", description: "Client counseling and ethical obligations" },
  ],
  investmentBanker: [
    { name: "Financial Modeling", description: "Valuation, DCF, and financial projections" },
    { name: "M&A", description: "Mergers, acquisitions, and deal execution" },
    { name: "Capital Markets", description: "Equity and debt capital raising" },
    { name: "Client Management", description: "Pitching, relationships, and communication" },
  ],
  productManager: [
    { name: "Product Strategy", description: "Vision, roadmap, and go-to-market strategy" },
    { name: "User Research", description: "Customer insights and usability testing" },
    { name: "Data Analysis", description: "Metrics, A/B testing, and data-driven decisions" },
    { name: "Stakeholder Management", description: "Cross-functional alignment and communication" },
  ],
  dataScientist: [
    { name: "Machine Learning", description: "Model selection, training, and evaluation" },
    { name: "Statistics", description: "Hypothesis testing, probability, and experimentation" },
    { name: "Data Engineering", description: "Pipelines, ETL, and data warehousing" },
    { name: "Business Analytics", description: "Insights, dashboards, and stakeholder communication" },
  ],
};

// ─── Company name lookup ───────────────────────────────────────────

const COMPANY_NAMES: Record<string, string> = {
  tcs: "TCS",
  infosys: "Infosys",
  accenture: "Accenture",
  capgemini: "Capgemini",
  microsoft: "Microsoft",
  adobe: "Adobe",
  google: "Google",
  meta: "Meta",
  amazon: "Amazon",
  apollo: "Apollo Hospitals",
  cloudnine: "Cloudnine",
  fortis: "Fortis",
  induslaw: "INDUSLAW",
  khaitan: "Khaitan & Co",
  azb: "AZB Partners",
  cyril: "Cyril Amarchand",
  moelis: "Moelis & Company",
  barclays: "Barclays",
  goldman: "Goldman Sachs",
  jpmorgan: "JP Morgan",
  swiggy: "Swiggy",
  flipkart: "Flipkart",
  fractal: "Fractal Analytics",
  ibm: "IBM",
  deloitte: "Deloitte",
  "bcg-gamma": "BCG Gamma",
};

export function getCompanyName(companyId: string): string {
  return COMPANY_NAMES[companyId] ?? companyId;
}

// ─── Scenario Seeds — realistic workplace incidents ────────────────
// Each seed is a concise topic that Gemini fleshes into a full scenario.
// Multi-round structure: initial → new evidence → business impact → postmortem

const SEEDS: Record<CareerKey, ScenarioSeed[]> = {
  softwareEngineer: [
    // Production Incidents
    {
      id: "api-5xx-surge",
      careerKey: "softwareEngineer",
      category: "Production Incidents",
      seed: "A recent deployment caused a surge in 5xx errors on the user-facing API gateway, affecting 12% of traffic",
      initialPhase: "Alerts page you at 2:47 AM. Error rates on the API gateway jumped from 0.1% to 12.3% after a canary deployment 20 minutes ago. Customers on mobile app are seeing generic error screens.",
      evidencePhase: "You discover the deployment includes a change to the authentication middleware that wasn't in the original spec. Rollback is complicated by a simultaneous database migration that hasn't completed.",
      impactPhase: "The VP of Engineering is demanding updates every 15 minutes. A key enterprise customer is threatening to escalate to their executive team. Error rate has spread to internal services.",
      postmortemPhase: "The incident has been resolved. Now you need to lead the postmortem, identify systemic causes, and propose process changes to prevent recurrence.",
      difficulty: "medium",
      minLevel: 3,
      maxLevel: 6,
      relevantCompanyIds: ["accenture", "capgemini", "microsoft"],
    },
    {
      id: "auth-failure-attack",
      careerKey: "softwareEngineer",
      category: "Networking & Security",
      seed: "Login authentication failures spike to 78% after a DDoS attack targets the identity provider",
      initialPhase: "Monitoring shows login success rate dropped from 99.8% to 22% in the last 10 minutes. Users are reporting they cannot access the application. The identity provider's CPU is pegged at 100%.",
      evidencePhase: "Traffic analysis reveals a coordinated DDoS attack targeting the /auth/token endpoint from 15,000 distinct IPs. The attack is exploiting a rate-limiting gap in the edge proxy configuration.",
      impactPhase: "The attack has expanded to target customer data APIs. Security team reports this may be related to a credential stuffing attack. Legal needs a breach assessment within the hour.",
      postmortemPhase: "Service is restored. Security team needs a full incident report. You need to design a more resilient auth architecture and propose rate-limiting improvements.",
      difficulty: "hard",
      minLevel: 7,
      maxLevel: 12,
      relevantCompanyIds: ["microsoft", "adobe", "amazon"],
    },
    {
      id: "onboarding-funnel-bug",
      careerKey: "softwareEngineer",
      category: "Frontend Engineering",
      seed: "User onboarding completion rate dropped from 65% to 31% after a frontend framework update",
      initialPhase: "Product analytics shows onboarding funnel completion dropped sharply after yesterday's frontend deployment. Users are abandoning at step 3 of 5 — the 'verify email' screen.",
      evidencePhase: "The email verification component is silently failing due to a race condition introduced when upgrading from React 17 to 18. The error is caught and swallowed, leaving users on a blank screen.",
      impactPhase: "New user signups have collapsed 40% week-over-week. The marketing team is blaming the engineering team. Customer support is overwhelmed with 'I can't complete signup' tickets.",
      postmortemPhase: "Hotfix deployed and conversion rates recovering. The team needs to review testing practices for frontend deployments and improve error visibility.",
      difficulty: "medium",
      minLevel: 1,
      maxLevel: 5,
      relevantCompanyIds: ["tcs", "infosys", "accenture"],
    },
    {
      id: "api-latency-degradation",
      careerKey: "softwareEngineer",
      category: "Backend Engineering",
      seed: "A critical internal API's P95 latency increased from 200ms to 8s, causing cascading failures downstream",
      initialPhase: "PagerDuty alerts for the order-service API. Response times degraded from 200ms P95 to 8s P95. Downstream services are timing out. Customer orders are failing silently.",
      evidencePhase: "The degradation correlates with a new database index that was backfilled on the production orders table. The backfill query is holding row-level locks and blocking read queries across the partition.",
      impactPhase: "Order processing is delayed by 4+ hours. The finance team reports revenue recognition will be affected for the quarter. SLA credits may trigger for top-tier customers.",
      postmortemPhase: "Index rolled back, performance restored. You need to propose a safer schema change process and design a proper database migration strategy with zero downtime guarantees.",
      difficulty: "hard",
      minLevel: 5,
      maxLevel: 9,
      relevantCompanyIds: ["accenture", "capgemini", "microsoft", "adobe"],
    },
    {
      id: "database-corruption",
      careerKey: "softwareEngineer",
      category: "Databases",
      seed: "A primary database replica experienced silent data corruption affecting customer transaction history",
      initialPhase: "A customer support ticket reports 'missing transactions' for a high-value account. Investigation shows the primary PostgreSQL replica has data corruption in the transactions table spanning the last 6 hours.",
      evidencePhase: "The corruption was caused by a hardware fault in the storage layer that went undetected because checksums were not enabled. The standby replica may have replicated some of the corrupted data before the fault was detected.",
      impactPhase: "Finance team estimates $2.3M in potentially affected transactions. Legal needs to assess regulatory reporting obligations. The CTO is asking if this is a data loss event that requires public disclosure.",
      postmortemPhase: "Data recovered from WAL archives with 99.97% integrity. You need to design a data integrity verification system and propose improvements to the backup/restore testing process.",
      difficulty: "hard",
      minLevel: 8,
      maxLevel: 99,
      relevantCompanyIds: ["microsoft", "adobe", "amazon", "google"],
    },
    {
      id: "microservice-cascading-failure",
      careerKey: "softwareEngineer",
      category: "Production Incidents",
      seed: "A misconfigured circuit breaker in a checkout microservice caused a cascading failure across 12 services",
      initialPhase: "Checkout failures reported across multiple regions. The payment-service is healthy but the order-service and inventory-service are returning 503 errors. Incident radius is expanding.",
      evidencePhase: "A recent configuration change to the circuit breaker in the checkout orchestrator is using overly aggressive timeout thresholds (100ms instead of 3s). When one upstream service slowed, the circuit breakers cascaded open across the dependency graph.",
      impactPhase: "All checkout traffic is failing globally. Revenue loss estimated at $45k/minute. Competitor is running ads targeting 'unreliable checkout experience.' Board members are being briefed.",
      postmortemPhase: "Circuit breaker thresholds restored to safe values. You need to design a more resilient microservice architecture with proper bulkheads and propose a safer config rollout process.",
      difficulty: "hard",
      minLevel: 6,
      maxLevel: 12,
      relevantCompanyIds: ["microsoft", "amazon", "google", "meta"],
    },
    {
      id: "system-design-pastebin",
      careerKey: "softwareEngineer",
      category: "System Design",
      seed: "Design a real-time collaborative document editing service that supports 500K concurrent users",
      initialPhase: "You need to design the architecture for a collaborative document editor similar to Google Docs. The system must support 500K concurrent users editing 50K active documents with sub-500ms sync latency.",
      evidencePhase: "During peak usage, your initial design shows the WebSocket gateway becoming a bottleneck. Users in different regions are seeing 3-5s sync delays. The operations team reports the database write throughput is exceeding projections by 10x.",
      impactPhase: "A major customer with 10K seats is threatening to churn due to sync reliability issues. The business has committed to launching in 3 new regions next quarter. You need to redesign for global scale.",
      postmortemPhase: "The system is working but not at the required scale. You need to produce a revised architecture that addresses regional latency, database write scaling, and conflict resolution for offline users.",
      difficulty: "hard",
      minLevel: 4,
      maxLevel: 99,
      relevantCompanyIds: ["google", "microsoft", "meta", "amazon"],
    },
    {
      id: "frontend-memory-leak",
      careerKey: "softwareEngineer",
      category: "Frontend Engineering",
      seed: "A memory leak in the main dashboard causes browser tab crashes after 15 minutes of usage",
      initialPhase: "Users report that the main analytics dashboard tab crashes after about 15 minutes of use. Chrome DevTools Memory tab shows heap growing from 50MB to 800MB over that period with no garbage collection.",
      evidencePhase: "The leak is in a custom chart visualization component that subscribes to WebSocket updates but never unsubscribes. Each update creates a new DOM node tree that's retained because of a forgotten closure in the event handler.",
      impactPhase: "Customer support tickets are flooding in. Power users who keep the dashboard open all day are most affected. The sales team is unable to demo the product to prospects without the browser crashing.",
      postmortemPhase: "Fix deployed. You need to propose frontend monitoring improvements, CI memory profiling checks, and better patterns for managing WebSocket subscriptions in React components.",
      difficulty: "medium",
      minLevel: 3,
      maxLevel: 7,
      relevantCompanyIds: ["accenture", "capgemini", "adobe"],
    },
    {
      id: "security-breach-response",
      careerKey: "softwareEngineer",
      category: "Networking & Security",
      seed: "An engineer accidentally committed AWS credentials to a public GitHub repository",
      initialPhase: "GitGuardian alerts that an AWS access key and secret key were committed to a public GitHub repo 45 minutes ago. The keys have full access to production S3 buckets containing customer PII data.",
      evidencePhase: "CloudTrail shows the compromised credentials were used to list S3 objects from a bucket containing 2.3M user records. 1,200 files were accessed over a 22-minute window from an IP registered in a country where you don't operate.",
      impactPhase: "Legal team confirms this is a reportable data breach under GDPR. The CISO has called an emergency incident response meeting. Engineering leadership needs an immediate containment plan and timeline.",
      postmortemPhase: "Credentials rotated, access revoked, and affected customers notified. You need to design a preventive system: pre-commit hooks, secret scanning pipeline, and credential rotation automation.",
      difficulty: "hard",
      minLevel: 5,
      maxLevel: 99,
      relevantCompanyIds: ["microsoft", "google", "amazon"],
    },
    {
      id: "cicd-pipeline-failure",
      careerKey: "softwareEngineer",
      category: "CI/CD & DevOps",
      seed: "The CI/CD pipeline silently skipped tests for 3 days, allowing broken code to reach production",
      initialPhase: "You notice that test suite execution time dropped from 12 minutes to 47 seconds — suspiciously fast. Investigating reveals the CI pipeline has been skipping test execution for 3 days due to a misconfigured YAML condition.",
      evidencePhase: "The YAML condition `if: github.event_name == 'pull_request'` was accidentally changed to `if: github.event_name != 'pull_request'` in a merge conflict resolution. Three days of deployments have bypassed all automated testing.",
      impactPhase: "At least 14 production deployments went out without test validation. Two of those are now suspected of causing a data integrity issue in the reporting pipeline. Your team needs to audit all changes from the last 72 hours.",
      postmortemPhase: "Pipeline fixed and all recent changes audited. You need to design a pipeline integrity system with mandatory checksum verification, and propose guardrails against silent configuration drift.",
      difficulty: "medium",
      minLevel: 2,
      maxLevel: 6,
      relevantCompanyIds: ["tcs", "infosys", "accenture", "capgemini"],
    },
    {
      id: "backend-debugging-race-condition",
      careerKey: "softwareEngineer",
      category: "Debugging & Root Cause",
      seed: "A race condition in the payment processing service causes duplicate charges to random customers",
      initialPhase: "Customer support receives reports of customers being charged twice for the same order. The issue is intermittent affecting about 0.3% of transactions. The payment service uses idempotency keys but something is bypassing them.",
      evidencePhase: "The race condition occurs when a payment request times out after 5s, the client retries, but the original request was actually still being processed. Both requests pass the idempotency check because they arrive in different transaction isolation levels, creating two successful charges.",
      impactPhase: "Affected customers are disputing charges with their banks. The payment processor is warning about elevated chargeback ratios. Finance team needs to process $47k in refunds and the CTO wants a root cause analysis within 24 hours.",
      postmortemPhase: "Fix deployed using database-level pessimistic locking for idempotency checks. You need to propose a comprehensive testing strategy for concurrent payment scenarios and document the incident for PCI compliance auditors.",
      difficulty: "hard",
      minLevel: 5,
      maxLevel: 10,
      relevantCompanyIds: ["microsoft", "adobe", "amazon", "google"],
    },
    {
      id: "oncall-rotation-burnout",
      careerKey: "softwareEngineer",
      category: "Behavioral & Leadership",
      seed: "Two engineers quit the on-call rotation due to burnout, leaving the team unable to cover 24/7 support",
      initialPhase: "The on-call rotation has 4 engineers for a 24/7 schedule. Two senior engineers resigned citing on-call burnout. The remaining team of 2 cannot sustainably cover the rotation. Production incidents are going unacknowledged during off-hours.",
      evidencePhase: "Analysis of the last 3 months shows the team averages 14 pages per night with a 45-minute MTTR requirement. The on-call engineers are also expected to deliver feature work during the day. The attrition rate has been 60% over the past year.",
      impactPhase: "A critical outage last night went unacknowledged for 22 minutes because the only on-call engineer was already handling another incident. The SLA breach triggered a $200k penalty. The VP wants a sustainable plan within a week.",
      postmortemPhase: "Interim rotation stabilized with help from other teams. You need to design a new on-call model, propose operational excellence improvements to reduce page volume, and build a retention plan for SRE talent.",
      difficulty: "medium",
      minLevel: 1,
      maxLevel: 5,
      relevantCompanyIds: ["tcs", "infosys", "accenture"],
    },
    {
      id: "feature-flag-misconfig",
      careerKey: "softwareEngineer",
      category: "Debugging & Root Cause",
      seed: "A feature flag configuration error exposed an unfinished feature to 15% of paying customers",
      initialPhase: "Product team discovers that a feature flag for an unfinished 'AI-powered recommendations' feature was accidentally set to 15% rollout instead of 0%. Users are seeing broken UI and nonsensical AI-generated recommendations.",
      evidencePhase: "The feature flag configuration was changed during a production debugging session where an engineer used the wrong environment. The flag management system doesn't require approval for changes and has no audit log for who changed what.",
      impactPhase: "Support tickets are flooding in. Early users are posting screenshots of the broken feature on social media. A competitor is using this to question the company's quality standards. The board wants a full explanation before earnings call next week.",
      postmortemPhase: "Feature flag rolled back to 0%. You need to design a feature flag governance system with approval workflows, change auditing, and environment isolation to prevent recurrence.",
      difficulty: "easy",
      minLevel: 1,
      maxLevel: 4,
      relevantCompanyIds: ["tcs", "infosys"],
    },
    {
      id: "database-migration-downtime",
      careerKey: "softwareEngineer",
      category: "Databases",
      seed: "A zero-downtime database migration caused 45 minutes of read-only mode during business hours",
      initialPhase: "The team attempted a zero-downtime migration to add a NOT NULL column to a 2TB table. Instead, the migration locked the table for writes for 45 minutes during peak business hours, causing transaction failures across the platform.",
      evidencePhase: "PostgreSQL's ALTER TABLE ... ADD COLUMN ... NOT NULL requires a full table rewrite in some versions, acquiring an ACCESS EXCLUSIVE lock. The lock queue blocked all write transactions. The staging environment didn't catch this because it had 1/1000th the data volume.",
      impactPhase: "Revenue loss estimated at $180k from failed transactions during the window. A major enterprise customer is demanding SLA credit compensation. The engineering director is questioning the database change review process.",
      postmortemPhase: "Migration rolled back and redesigned. You need to propose a safer approach: use a CHECK constraint initially, validate in application code, then add NOT NULL. Also need a better staging environment strategy.",
      difficulty: "medium",
      minLevel: 3,
      maxLevel: 7,
      relevantCompanyIds: ["accenture", "capgemini", "microsoft"],
    },
    {
      id: "cache-poisoning",
      careerKey: "softwareEngineer",
      category: "Backend Engineering",
      seed: "A CDN cache poisoning attack served malicious content to 250K users over 4 hours",
      initialPhase: "Security monitoring detects anomalous responses from the CDN cache. Some users are reporting that the website displays different content than expected. Investigation reveals the CDN cached a malicious response that was generated by exploiting a path traversal vulnerability in the origin server.",
      evidencePhase: "The path traversal vulnerability existed in the image resizing service, which didn't properly validate file paths. Attackers requested '.../../../../config/keys.json' and the CDN cached the 200 response. The cached malicious content was served for 4 hours before being detected.",
      impactPhase: "250K users were potentially exposed to malicious content. Security team needs to determine if this was a supply chain attack vector. Legal team is assessing regulatory disclosure obligations under GDPR Article 33.",
      postmortemPhase: "Vulnerability patched, CDN cache purged. You need to design a defense-in-depth strategy for the CDN/origin boundary, propose input validation standards, and implement a cache invalidation verification process.",
      difficulty: "hard",
      minLevel: 8,
      maxLevel: 99,
      relevantCompanyIds: ["google", "meta", "amazon", "microsoft"],
    },
  ],

  doctor: [
    {
      id: "chest-pain-emergency",
      careerKey: "doctor",
      category: "Emergency Response",
      seed: "A 52-year-old male presents with acute chest pain, diaphoresis, and shortness of breath",
      initialPhase: "A 52-year-old male with a history of hypertension and smoking presents to the ED with crushing chest pain radiating to the left arm, onset 90 minutes ago. He is diaphoretic, BP 160/95, HR 110, SpO2 94% on room air.",
      evidencePhase: "Initial ECG shows ST-elevation in leads V1-V4. Troponin is elevated at 4.2 ng/mL. Patient's BP drops to 88/60 and he develops pulmonary edema on chest X-ray. He's having an anterior STEMI with cardiogenic shock.",
      impactPhase: "The catheterization lab is occupied with another emergency. Patient is deteriorating — oxygen saturation dropping to 88%, becoming confused. You must decide: transfer to another hospital or manage medically while waiting.",
      postmortemPhase: "Patient stabilized and transferred for PCI. Review the clinical decisions made, evaluate alternative approaches, and identify key learning points for managing STEMI with cardiogenic shock.",
      difficulty: "hard",
      minLevel: 5,
      maxLevel: 99,
      relevantCompanyIds: ["apollo", "cloudnine", "fortis"],
    },
    {
      id: "pediatric-fever",
      careerKey: "doctor",
      category: "Diagnosis",
      seed: "A 3-year-old child with high fever, lethargy, and a petechial rash",
      initialPhase: "A 3-year-old child is brought to the ED with 3 days of high-grade fever (39.8°C), increasing lethargy, and a new petechial rash on the lower extremities. Parents report the child has been vomiting and refusing to eat.",
      evidencePhase: "The child is now hypotensive (BP 72/45), tachycardic (HR 160), and has a prolonged capillary refill of 4 seconds. Neck stiffness is present. You suspect meningococcal meningitis with septic shock.",
      impactPhase: "The hospital's supply of the first-line antibiotic is depleted. You need to make an empiric treatment decision with alternative antibiotics. The child's condition is deteriorating rapidly — you have minutes, not hours.",
      postmortemPhase: "The child responded adequately to alternative antibiotics. Review the clinical reasoning, discuss the importance of early recognition of meningococcemia, and evaluate the antibiotic selection.",
      difficulty: "hard",
      minLevel: 5,
      maxLevel: 99,
      relevantCompanyIds: ["cloudnine", "fortis"],
    },
  ],

  lawyer: [
    {
      id: "contract-breach-dispute",
      careerKey: "lawyer",
      category: "Contracts",
      seed: "A software development contract dispute where the client claims the delivered product doesn't meet specifications",
      initialPhase: "Your client, a software development firm, delivered a custom CRM platform to a client. The client is now refusing final payment ($450k), claiming the software doesn't meet the agreed specifications, specifically around reporting functionality and API performance.",
      evidencePhase: "Reviewing the contract, the specifications section uses ambiguous language like 'robust reporting' and 'fast API response times.' Your client's emails show they interpreted these terms differently than the client. There's also a disputed change order for additional reporting features.",
      impactPhase: "The client has filed a formal demand letter threatening litigation and has posted negative reviews on industry forums. Your client is a small firm — $450k represents 30% of their annual revenue. They need advice on negotiation strategy and litigation risk assessment.",
      postmortemPhase: "The matter was settled in mediation. Review the case: what contract drafting improvements would prevent such ambiguity? What negotiation approach was most effective? Document key lessons for future software development agreements.",
      difficulty: "medium",
      minLevel: 3,
      maxLevel: 8,
      relevantCompanyIds: ["induslaw", "khaitan", "azb"],
    },
  ],

  investmentBanker: [
    {
      id: "ipo-pricing-crisis",
      careerKey: "investmentBanker",
      category: "Capital Markets",
      seed: "Your client's IPO is pricing in a volatile market and the anchor investors are withdrawing commitments",
      initialPhase: "Your team is managing the IPO of a high-growth tech company targeting a $2B valuation. Market conditions have deteriorated sharply this week, with the tech sector down 8%. Two anchor investors who committed to 30% of the allocation are signaling they may withdraw.",
      evidencePhase: "During the roadshow, institutional investors expressed concerns about the company's Q3 guidance, which was revised downward yesterday. The pricing range of $28-$32 per share now seems optimistic. The CFO is insisting on maintaining the valuation to avoid a 'down round' perception.",
      impactPhase: "The lead underwriter is suggesting a 20% price cut to ensure the deal gets done. One anchor investor has formally withdrawn. Your client's CEO is refusing to go below $28, but the order book is 40% undersubscribed at that price. The board meets in 6 hours to decide.",
      postmortemPhase: "The deal priced at $24 per share. Review the decisions: was the pricing strategy correct? How should the client have managed market risk? What lessons apply to future IPO processes in volatile markets?",
      difficulty: "hard",
      minLevel: 6,
      maxLevel: 99,
      relevantCompanyIds: ["goldman", "jpmorgan", "barclays"],
    },
  ],

  productManager: [
    {
      id: "checkout-abandonment",
      careerKey: "productManager",
      category: "Product Strategy",
      seed: "E-commerce checkout abandonment rate increased from 55% to 78% after a redesign",
      initialPhase: "Your team redesigned the checkout flow to improve conversion. Instead, the abandonment rate jumped from 55% to 78%. Analytics show users are dropping off at the new 'account creation' step that was added. You have user session recordings and survey data available.",
      evidencePhase: "Session recordings show users are confused by the new mandatory account creation screen — they can't find the 'guest checkout' option (which was moved to a footer link). The new single-page checkout also runs 4x slower on mobile devices. Survey responses at the 3-minute mark score 2.1/5 for ease of use.",
      impactPhase: "Revenue is down 34% week-over-week. The CEO has escalated this as a P0 priority. The engineering team has already started building a revert but it will take 5 days. Meanwhile, the VP of Growth wants to A/B test incremental fixes instead of reverting.",
      postmortemPhase: "The team reverted the redesign and will relaunch with a phased approach. Review the product decisions: what user research should have been done? How should the team balance innovation with risk? Propose a better rollout strategy.",
      difficulty: "medium",
      minLevel: 3,
      maxLevel: 8,
      relevantCompanyIds: ["flipkart", "amazon", "swiggy"],
    },
  ],

  dataScientist: [
    {
      id: "model-drift-production",
      careerKey: "dataScientist",
      category: "Machine Learning",
      seed: "A fraud detection model's precision dropped from 92% to 65% after a silent data distribution shift",
      initialPhase: "Your team's fraud detection model, in production for 6 months, has been showing a gradual decline in precision over the last 2 weeks. Today it hit 65%, down from 92%. The model is approving fraudulent transactions that should be flagged. Estimated losses: $15k/day so far.",
      evidencePhase: "Feature distribution analysis reveals a sudden shift in 3 key features: average transaction amount (+40%), transaction frequency (+200%), and merchant category mix. This correlates with a major promotional campaign that changed user behavior. The model was trained on pre-campaign data.",
      impactPhase: "Losses have accumulated to $180k. The fraud team is manually reviewing all flagged transactions but they can't keep up. The ML platform team says retraining takes 3 days. The VP of Risk wants a stopgap solution within 4 hours and a long-term monitoring framework proposal.",
      postmortemPhase: "A retrained model was deployed after 3 days. Review the incident: what monitoring signals should have been tracked? How should the team handle distribution shifts? Propose an automated retraining pipeline with drift detection alerts.",
      difficulty: "hard",
      minLevel: 5,
      maxLevel: 99,
      relevantCompanyIds: ["fractal", "ibm", "deloitte", "bcg-gamma"],
    },
  ],
};

// ─── Category lookup helpers ───────────────────────────────────────

export function getCategories(careerKey: string): ScenarioCategory[] {
  return CAREER_CATEGORIES[careerKey as CareerKey] || [];
}

export function slugToCareerKey(slug: string): CareerKey | null {
  const map: Record<string, CareerKey> = {
    "software-engineer": "softwareEngineer",
    doctor: "doctor",
    lawyer: "lawyer",
    "investment-banker": "investmentBanker",
    "product-manager": "productManager",
    "data-scientist": "dataScientist",
  };
  return map[slug] ?? null;
}

// ─── Scenario seed selection ──────────────────────────────────────

export function getSeedForLevel(careerKey: string, level: number): ScenarioSeed | null {
  const key = careerKey as CareerKey;
  const pool = SEEDS[key];
  if (!pool || pool.length === 0) return null;

  const eligible = pool.filter((s) => level >= s.minLevel && level <= s.maxLevel);

  if (eligible.length > 0) {
    return eligible[Math.floor(Math.random() * eligible.length)];
  }

  // Fallback: closest based on level range midpoint
  return pool.reduce((best, curr) => {
    const currMid = (curr.minLevel + curr.maxLevel) / 2;
    const bestMid = (best.minLevel + best.maxLevel) / 2;
    return Math.abs(level - currMid) < Math.abs(level - bestMid) ? curr : best;
  });
}