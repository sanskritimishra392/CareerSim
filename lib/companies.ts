export type Company = {
  id: string;
  name: string;
  unlockLevel: number;
  tier: number;
};

export type CompanyTier = {
  name: string;
  minLevel: number;
  maxLevel: number;
  companies: Company[];
};

/**
 * Company registry organized by level tiers.
 * Matches the required progression:
 *   L1-3:   TCS, Infosys
 *   L4-7:   Accenture, Capgemini
 *   L8-12:  Microsoft, Adobe
 *   L13+:   Google, Meta, Amazon
 */
const DATA: Record<string, Company[]> = {
  "software-engineer": [
    { id: "tcs", name: "TCS", unlockLevel: 1, tier: 1 },
    { id: "infosys", name: "Infosys", unlockLevel: 1, tier: 1 },
    { id: "accenture", name: "Accenture", unlockLevel: 4, tier: 2 },
    { id: "capgemini", name: "Capgemini", unlockLevel: 4, tier: 2 },
    { id: "microsoft", name: "Microsoft", unlockLevel: 8, tier: 3 },
    { id: "adobe", name: "Adobe", unlockLevel: 8, tier: 3 },
    { id: "google", name: "Google", unlockLevel: 13, tier: 4 },
    { id: "meta", name: "Meta", unlockLevel: 13, tier: 4 },
    { id: "amazon", name: "Amazon", unlockLevel: 13, tier: 4 },
  ],
  doctor: [
    { id: "apollo", name: "Apollo Hospitals", unlockLevel: 1, tier: 1 },
    { id: "cloudnine", name: "Cloudnine", unlockLevel: 1, tier: 1 },
    { id: "fortis", name: "Fortis", unlockLevel: 4, tier: 2 },
  ],
  lawyer: [
    { id: "induslaw", name: "INDUSLAW", unlockLevel: 1, tier: 1 },
    { id: "khaitan", name: "Khaitan & Co", unlockLevel: 1, tier: 1 },
    { id: "azb", name: "AZB Partners", unlockLevel: 4, tier: 2 },
    { id: "cyril", name: "Cyril Amarchand", unlockLevel: 4, tier: 2 },
  ],
  "investment-banker": [
    { id: "moelis", name: "Moelis & Company", unlockLevel: 1, tier: 1 },
    { id: "barclays", name: "Barclays", unlockLevel: 1, tier: 1 },
    { id: "goldman", name: "Goldman Sachs", unlockLevel: 4, tier: 2 },
    { id: "jpmorgan", name: "JP Morgan", unlockLevel: 4, tier: 2 },
  ],
  "product-manager": [
    { id: "swiggy", name: "Swiggy", unlockLevel: 1, tier: 1 },
    { id: "flipkart", name: "Flipkart", unlockLevel: 1, tier: 1 },
    { id: "google", name: "Google PM", unlockLevel: 4, tier: 2 },
    { id: "amazon", name: "Amazon PM", unlockLevel: 4, tier: 2 },
  ],
  "data-scientist": [
    { id: "fractal", name: "Fractal Analytics", unlockLevel: 1, tier: 1 },
    { id: "ibm", name: "IBM", unlockLevel: 1, tier: 1 },
    { id: "deloitte", name: "Deloitte", unlockLevel: 4, tier: 2 },
    { id: "bcg-gamma", name: "BCG Gamma", unlockLevel: 4, tier: 2 },
  ],
};

export function getCompanyById(
  careerKey: string,
  companyId: string
) {
  return DATA[careerKey]?.find((c) => c.id === companyId);
}

export function getUnlockedCompanies(
  careerKey: string,
  level: number
): Company[] {
  return (DATA[careerKey] || []).filter((c) => level >= c.unlockLevel);
}

export function isCompanyUnlocked(
  careerKey: string,
  companyId: string,
  level: number
) {
  const company = getCompanyById(careerKey, companyId);
  if (!company) return false;
  return level >= company.unlockLevel;
}

export function getAllCompanies(careerKey: string): Company[] {
  return DATA[careerKey] || [];
}

export function getCompanyTiers(careerKey: string): CompanyTier[] {
  const companies = DATA[careerKey] || [];
  const tiers: Record<number, { name: string; minLevel: number; maxLevel: number; companies: Company[] }> = {};

  for (const company of companies) {
    if (!tiers[company.tier]) {
      const tierCompanies = companies.filter((c) => c.tier === company.tier);
      const levels = tierCompanies.map((c) => c.unlockLevel);
      tiers[company.tier] = {
        name: company.tier === 1 ? "Entry Level" :
              company.tier === 2 ? "Mid Level" :
              company.tier === 3 ? "Senior Level" : "Expert Level",
        minLevel: Math.min(...levels),
        maxLevel: Math.max(...levels),
        companies: [],
      };
    }
    tiers[company.tier].companies.push(company);
  }

  return Object.values(tiers).sort((a, b) => a.minLevel - b.minLevel);
}