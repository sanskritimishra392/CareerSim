import type { CareerKey } from "@/lib/scenarios";

export type InterviewTier = "startup" | "mid" | "faang";

export interface CareerCompany {
  id: string;
  careerKey: CareerKey;
  name: string;
  tier: InterviewTier;
  icon: string;
  tagline: string;
  interviewFocus: string;
}

function company(
  careerKey: CareerKey,
  slug: string,
  name: string,
  tier: InterviewTier,
  icon: string,
  tagline: string,
  interviewFocus: string
): CareerCompany {
  return {
    id: `${careerKey}:${slug}`,
    careerKey,
    name,
    tier,
    icon,
    tagline,
    interviewFocus,
  };
}

/**
 * Career-specific company registry.
 * To add a new career: add a new key with its company array — no core logic changes needed.
 */
export const CAREER_COMPANY_MAP: Record<CareerKey, CareerCompany[]> = {
  softwareEngineer: [
    company("softwareEngineer", "notion", "Notion", "startup", "📝", "Product-led startup", "Emphasizes product sense, user empathy, and shipping with a small team."),
    company("softwareEngineer", "linear", "Linear", "startup", "⚡", "High-craft engineering", "Focuses on taste, speed, and thoughtful trade-offs in product development."),
    company("softwareEngineer", "vercel", "Vercel", "startup", "▲", "Developer-first platform", "Tests developer experience thinking, technical depth, and pragmatic shipping."),
    company("softwareEngineer", "razorpay", "Razorpay", "startup", "💳", "Indian fintech startup", "Values fast iteration, payment systems thinking, and reliability under growth."),
    company("softwareEngineer", "cred", "CRED", "startup", "✨", "Consumer fintech startup", "Looks for ownership, performance optimization, and premium user experience."),
    company("softwareEngineer", "spotify", "Spotify", "mid", "🎵", "Global consumer platform", "Emphasizes data-informed decisions, experimentation, and cross-team delivery."),
    company("softwareEngineer", "airbnb", "Airbnb", "mid", "🏠", "Marketplace at scale", "Tests trust-and-safety thinking, marketplace dynamics, and user-host balance."),
    company("softwareEngineer", "uber", "Uber", "mid", "🚗", "Operations-heavy tech", "Focuses on real-time systems, operational trade-offs, and global rollout."),
    company("softwareEngineer", "salesforce", "Salesforce", "mid", "☁️", "Enterprise SaaS leader", "Values enterprise reliability, platform thinking, and customer success."),
    company("softwareEngineer", "google", "Google", "faang", "🔍", "Scale & first principles", "Expects structured thinking, measurable impact, and depth on scalability."),
    company("softwareEngineer", "amazon", "Amazon", "faang", "📦", "Customer obsession", "Uses Leadership Principles; values customer-backward thinking and operational excellence."),
    company("softwareEngineer", "meta", "Meta", "faang", "∞", "Move fast at scale", "Tests product iteration speed, metrics-driven decisions, and impact at billions of users."),
    company("softwareEngineer", "apple", "Apple", "faang", "🍎", "Craft & privacy", "Values attention to detail, user privacy, and end-to-end product excellence."),
    company("softwareEngineer", "microsoft", "Microsoft", "faang", "🪟", "Enterprise & cloud scale", "Tests growth mindset, enterprise empathy, and platform-scale architecture."),
  ],

  doctor: [
    company("doctor", "cloudnine", "Cloudnine", "startup", "👶", "Specialty maternity chain", "Focuses on patient communication, clinical protocols, and compassionate bedside manner."),
    company("doctor", "nanavati", "Nanavati Hospital", "startup", "🏥", "Multi-specialty hospital", "Values thorough history-taking, differential diagnosis, and coordinated care."),
    company("doctor", "apollo", "Apollo Hospitals", "mid", "🔴", "Leading private healthcare", "Tests clinical reasoning, evidence-based treatment, and managing high patient volumes."),
    company("doctor", "fortis", "Fortis Healthcare", "mid", "💚", "National hospital network", "Emphasizes emergency protocols, multidisciplinary coordination, and quality standards."),
    company("doctor", "max", "Max Healthcare", "mid", "➕", "Premium hospital chain", "Values patient safety, ethical decision-making, and structured clinical workflows."),
    company("doctor", "aiims", "AIIMS", "faang", "🎓", "Premier public institution", "Expects rigorous clinical knowledge, research orientation, and handling complex cases."),
    company("doctor", "medanta", "Medanta", "faang", "❤️", "Multi-super-specialty institute", "Tests advanced diagnostics, subspecialty depth, and leadership in critical care."),
  ],

  lawyer: [
    company("lawyer", "induslaw", "INDUSLAW", "startup", "📋", "Boutique corporate firm", "Values practical drafting, client responsiveness, and commercial awareness."),
    company("lawyer", "anand-anand", "Anand and Anand", "startup", "™️", "IP-focused boutique", "Focuses on intellectual property analysis, precision, and client advisory."),
    company("lawyer", "khaitan", "Khaitan & Co", "mid", "⚖️", "Full-service national firm", "Tests legal research depth, contract analysis, and regulatory navigation."),
    company("lawyer", "jsa", "JSA Advocates", "mid", "📜", "Corporate law practice", "Emphasizes M&A structuring, compliance, and stakeholder communication."),
    company("lawyer", "luthra", "L&L Partners", "mid", "🏛️", "Top-tier law firm", "Values litigation strategy, risk assessment, and persuasive legal argumentation."),
    company("lawyer", "sam", "Amarchand Mangaldas", "faang", "🦁", "India's largest law firm", "Expects bar-raising legal analysis, complex deal structuring, and executive presence."),
    company("lawyer", "azb", "AZB Partners", "faang", "🔷", "Elite corporate firm", "Tests high-stakes negotiation, regulatory mastery, and precision in advisory."),
    company("lawyer", "cyril", "Cyril Amarchand", "faang", "⚡", "Market-leading practice", "Values strategic legal thinking, board-level counsel, and dispute resolution excellence."),
  ],

  investmentBanker: [
    company("investmentBanker", "moelis", "Moelis & Company", "startup", "📊", "Boutique advisory", "Values lean deal teams, client intimacy, and sharp valuation judgment."),
    company("investmentBanker", "jefferies", "Jefferies", "startup", "📈", "Growth-focused IB", "Focuses on mid-market deals, hustle, and creative financing structures."),
    company("investmentBanker", "barclays", "Barclays", "mid", "🏦", "Global investment bank", "Tests financial modeling, pitch preparation, and cross-border deal execution."),
    company("investmentBanker", "deutsche", "Deutsche Bank", "mid", "🇩🇪", "European banking giant", "Emphasizes DCF rigor, sector expertise, and client presentation skills."),
    company("investmentBanker", "citi", "Citigroup", "mid", "🌐", "Global markets bank", "Values capital markets knowledge, due diligence, and transaction coordination."),
    company("investmentBanker", "goldman", "Goldman Sachs", "faang", "⭐", "Bulge bracket leader", "Expects elite modeling, market insight, and flawless deal materials."),
    company("investmentBanker", "jpmorgan", "JP Morgan", "faang", "🐂", "Top-tier investment bank", "Tests valuation mastery, client strategy, and composure under deal pressure."),
    company("investmentBanker", "morgan-stanley", "Morgan Stanley", "faang", "🏆", "Premier advisory firm", "Values analytical depth, M&A expertise, and institutional client management."),
  ],

  productManager: [
    company("productManager", "swiggy", "Swiggy", "startup", "🍔", "Food delivery startup", "Values speed, ops thinking, and consumer obsession in fast-moving markets."),
    company("productManager", "zomato", "Zomato", "startup", "🍕", "Consumer tech startup", "Focuses on marketplace dynamics, growth metrics, and rapid experimentation."),
    company("productManager", "razorpay", "Razorpay", "startup", "💳", "B2B fintech startup", "Tests platform thinking, merchant empathy, and shipping with limited resources."),
    company("productManager", "flipkart", "Flipkart", "mid", "🛍️", "E-commerce leader", "Emphasizes scale, supply chain trade-offs, and data-driven prioritization."),
    company("productManager", "phonepe", "PhonePe", "mid", "📱", "Payments super-app", "Values user funnel optimization, regulatory awareness, and ecosystem building."),
    company("productManager", "ola", "Ola", "mid", "🚕", "Mobility platform", "Tests multi-sided marketplace thinking and operational product decisions."),
    company("productManager", "google", "Google", "faang", "🔍", "Product at scale", "Expects structured prioritization, OKR alignment, and impact at billions of users."),
    company("productManager", "amazon", "Amazon", "faang", "📦", "Customer-backward PM", "Uses Working Backwards; values PR/FAQ thinking and measurable customer outcomes."),
    company("productManager", "meta", "Meta", "faang", "∞", "Social product scale", "Tests growth loops, A/B testing rigor, and cross-functional leadership."),
  ],

  dataScientist: [
    company("dataScientist", "fractal", "Fractal Analytics", "startup", "📐", "Analytics startup", "Values hands-on modeling, client problem framing, and delivering actionable insights."),
    company("dataScientist", "mu-sigma", "Mu Sigma", "startup", "μ", "Decision sciences firm", "Focuses on structured problem-solving, data storytelling, and business impact."),
    company("dataScientist", "ibm", "IBM", "mid", "💻", "Enterprise analytics", "Tests ML pipeline thinking, enterprise data governance, and scalable solutions."),
    company("dataScientist", "accenture", "Accenture", "mid", "🔷", "Consulting & analytics", "Emphasizes client delivery, analytics strategy, and cross-industry adaptability."),
    company("dataScientist", "tcs", "TCS Analytics", "mid", "🌐", "Global IT services", "Values large-scale data engineering, stakeholder management, and repeatable frameworks."),
    company("dataScientist", "deloitte", "Deloitte", "faang", "📊", "Big Four analytics", "Expects rigorous analysis, executive communication, and industry domain depth."),
    company("dataScientist", "bcg-gamma", "BCG Gamma", "faang", "🎯", "Elite analytics consulting", "Tests advanced ML, causal inference, and C-suite level recommendations."),
    company("dataScientist", "mckinsey-quantum", "McKinsey QuantumBlack", "faang", "⬛", "Top-tier AI practice", "Values hybrid ML + strategy thinking and impact on Fortune 500 clients."),
  ],
};
