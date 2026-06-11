import type { CareerKey } from "@/lib/scenarios";

export interface CareerProgressionStep {
  title: string;
  description: string;
}

export interface CareerSalaryRange {
  region: string;
  range: string;
}

export interface CareerOverviewContent {
  headline: string;
  intro: string;
  simulationBlurb: string;
  whatTheyDo: string;
  skills: string[];
  education: string[];
  salaryRanges: CareerSalaryRange[];
  pros: string[];
  cons: string[];
  dayInLife: string[];
  progression: CareerProgressionStep[];
}

export interface CareerConfig {
  key: CareerKey;
  slug: string;
  title: string;
  description: string;
  icon: string;
  evaluatorRole: string;
  overview: CareerOverviewContent;
}

export const CAREERS: CareerConfig[] = [
  {
    key: "softwareEngineer",
    slug: "software-engineer",
    title: "Software Engineer",
    description: "Build applications, architect systems, and deliver software that powers modern teams.",
    icon: "💻",
    evaluatorRole: "software engineering",
    overview: {
      headline: "What it means to be a Software Engineer",
      intro:
        "Software Engineers design, build, and maintain the systems that power web, mobile, and enterprise products. They translate complex requirements into reliable software, collaborate across teams, and continuously improve user experiences.",
      simulationBlurb:
        "Explore a realistic software engineering scenario and get instant feedback on your response.",
      whatTheyDo:
        "Software Engineers write code, troubleshoot issues, and architect solutions that solve real user problems. They work closely with product managers, designers, and quality engineers to deliver software that is performant, secure, and maintainable.",
      skills: [
        "Programming fundamentals in languages like JavaScript, Python, Java, or C#",
        "System design and architecture thinking",
        "Problem solving, debugging, and testing",
        "Collaboration with cross-functional teams",
        "Communication, code review, and documentation",
      ],
      education: [
        "Bachelor's degree in Computer Science, Engineering, or related fields",
        "Coding bootcamps and vocational programs",
        "Online certifications for cloud platforms, web development, and data structures",
        "Personal projects, open source contribution, and internships",
      ],
      salaryRanges: [
        { region: "India", range: "₹4 LPA – ₹30 LPA depending on experience and company." },
        { region: "USA", range: "$80K – $180K+ depending on role, location, and seniority." },
        { region: "Europe", range: "€50K – €120K+ depending on city, company, and experience." },
      ],
      pros: [
        "High demand and global career flexibility",
        "Creative problem solving and continuous learning",
        "Strong compensation and growth opportunities",
      ],
      cons: [
        "Can involve long hours during critical launches",
        "Rapid technology change requires constant upskilling",
        "Collaboration overhead and shifting project priorities",
      ],
      dayInLife: [
        "Software Engineers typically balance coding, design review, and collaboration. Their day often includes standups, pairing sessions, debugging, and deploying changes to production.",
        "Morning activities may include reviewing tickets, triaging issues, and aligning with the team. Afternoon work often focuses on feature development, code reviews, and testing.",
        "Later in the day they may update documentation, refine architecture, and prepare for the next planning cycle.",
      ],
      progression: [
        { title: "Intern / Entry Level", description: "Learn the codebase, contribute small fixes, and develop strong collaboration habits." },
        { title: "Junior Engineer", description: "Take ownership of small features, improve code quality, and build confidence in deliveries." },
        { title: "Engineer", description: "Design larger systems, mentor peers, and lead more complex projects across the stack." },
        { title: "Senior Engineer", description: "Own technical direction, influence architecture, and drive cross-team initiatives." },
        { title: "Lead Engineer", description: "Shape product strategy, mentor technical leaders, and deliver high-impact outcomes at scale." },
      ],
    },
  },
  {
    key: "doctor",
    slug: "doctor",
    title: "Doctor",
    description: "Diagnose patients, guide treatment plans, and provide life-changing medical care.",
    icon: "🩺",
    evaluatorRole: "clinical medicine",
    overview: {
      headline: "What it means to be a Doctor",
      intro:
        "Doctors diagnose illnesses, develop treatment plans, and guide patients through complex medical decisions. They combine scientific knowledge with empathy to improve health outcomes in hospitals, clinics, and community settings.",
      simulationBlurb:
        "Practice responding to a realistic clinical scenario and receive feedback on your medical reasoning.",
      whatTheyDo:
        "Doctors examine patients, interpret diagnostic results, prescribe treatments, and coordinate care with nurses and specialists. They must balance evidence-based medicine with patient preferences and ethical considerations.",
      skills: [
        "Clinical reasoning and differential diagnosis",
        "Patient communication and empathy",
        "Knowledge of anatomy, pharmacology, and pathology",
        "Decision-making under pressure",
        "Collaboration with multidisciplinary care teams",
      ],
      education: [
        "Medical degree (MD or equivalent) from an accredited program",
        "Residency training in a chosen specialty",
        "Board certification and continuing medical education",
        "Licensing exams and hospital credentialing",
      ],
      salaryRanges: [
        { region: "India", range: "₹8 LPA – ₹50 LPA+ depending on specialty and setting." },
        { region: "USA", range: "$180K – $400K+ depending on specialty and location." },
        { region: "Europe", range: "€60K – €150K+ depending on country and specialty." },
      ],
      pros: [
        "Direct impact on patient lives and community health",
        "Intellectually challenging and respected profession",
        "Diverse specialties and career paths",
      ],
      cons: [
        "Long training pathway and demanding schedules",
        "High emotional burden and burnout risk",
        "Administrative burden and regulatory complexity",
      ],
      dayInLife: [
        "A typical day may begin with reviewing overnight admissions, lab results, and patient charts before rounds.",
        "Midday often includes consultations, procedures, or clinic appointments with documentation between visits.",
        "Evening work may involve handoffs, follow-up calls, and staying current with medical literature.",
      ],
      progression: [
        { title: "Medical Student", description: "Build foundational knowledge through coursework and clinical rotations." },
        { title: "Resident", description: "Develop hands-on skills under supervision in a chosen specialty." },
        { title: "Attending Physician", description: "Lead patient care, teach trainees, and manage complex cases independently." },
        { title: "Senior Consultant", description: "Specialize further, lead departments, or drive clinical research initiatives." },
      ],
    },
  },
  {
    key: "lawyer",
    slug: "lawyer",
    title: "Lawyer",
    description: "Advise clients, shape legal strategy, and navigate complex regulatory challenges.",
    icon: "⚖️",
    evaluatorRole: "legal practice",
    overview: {
      headline: "What it means to be a Lawyer",
      intro:
        "Lawyers advise clients on rights and obligations, draft legal documents, and represent interests in negotiations and disputes. They apply statutes, case law, and regulatory frameworks to solve complex problems.",
      simulationBlurb:
        "Work through a realistic legal scenario and get feedback on your analysis and strategy.",
      whatTheyDo:
        "Lawyers research legal issues, counsel clients, negotiate agreements, and advocate in hearings or trials. They must translate dense legal concepts into clear guidance while managing risk and deadlines.",
      skills: [
        "Legal research and case analysis",
        "Written and oral advocacy",
        "Contract drafting and negotiation",
        "Critical thinking and ethical judgment",
        "Client counseling under uncertainty",
      ],
      education: [
        "Juris Doctor (JD) or equivalent law degree",
        "Bar examination and state licensing",
        "Clerkships, moot court, and legal internships",
        "Continuing legal education throughout career",
      ],
      salaryRanges: [
        { region: "India", range: "₹6 LPA – ₹40 LPA+ depending on firm and practice area." },
        { region: "USA", range: "$70K – $250K+ depending on firm size and specialty." },
        { region: "Europe", range: "€45K – €120K+ depending on market and practice area." },
      ],
      pros: [
        "Intellectual challenge across diverse practice areas",
        "Opportunity to advocate for justice and client interests",
        "Strong earning potential at senior levels",
      ],
      cons: [
        "Long hours and high-stakes pressure",
        "Adversarial environments in litigation",
        "Heavy documentation and billable-hour culture at many firms",
      ],
      dayInLife: [
        "Mornings often start with reviewing case updates, client emails, and court filings.",
        "Afternoons may include client meetings, depositions, contract negotiations, or court appearances.",
        "Evenings frequently involve drafting briefs, preparing for hearings, and coordinating with paralegals.",
      ],
      progression: [
        { title: "Law Clerk / Associate", description: "Research cases, draft documents, and support senior attorneys." },
        { title: "Associate", description: "Manage client matters with increasing autonomy and courtroom exposure." },
        { title: "Senior Associate / Counsel", description: "Lead complex matters and mentor junior lawyers." },
        { title: "Partner", description: "Develop business, set firm strategy, and oversee major client relationships." },
      ],
    },
  },
  {
    key: "investmentBanker",
    slug: "investment-banker",
    title: "Investment Banker",
    description: "Drive high-stakes deals, model financial outcomes, and accelerate business growth.",
    icon: "💼",
    evaluatorRole: "investment banking",
    overview: {
      headline: "What it means to be an Investment Banker",
      intro:
        "Investment Bankers advise companies on mergers, acquisitions, capital raises, and strategic transactions. They build financial models, pitch to clients, and execute deals that shape markets and corporate growth.",
      simulationBlurb:
        "Navigate a realistic deal scenario and receive feedback on your financial and strategic reasoning.",
      whatTheyDo:
        "Investment bankers analyze companies, value businesses, prepare pitch books, and coordinate due diligence. They work in fast-paced teams serving corporate clients, private equity firms, and institutional investors.",
      skills: [
        "Financial modeling and valuation (DCF, comps, precedents)",
        "Excel proficiency and presentation skills",
        "Understanding of capital markets and M&A process",
        "Client communication and deal coordination",
        "Attention to detail under tight deadlines",
      ],
      education: [
        "Bachelor's degree in Finance, Economics, or related field",
        "MBA or advanced finance credentials for senior roles",
        "Internships at banks or financial institutions",
        "CFA or other finance certifications (optional)",
      ],
      salaryRanges: [
        { region: "India", range: "₹15 LPA – ₹80 LPA+ depending on bank and level." },
        { region: "USA", range: "$100K – $300K+ including bonus at bulge bracket banks." },
        { region: "Europe", range: "€70K – €200K+ depending on city and deal flow." },
      ],
      pros: [
        "Exposure to high-profile transactions and top clients",
        "Accelerated learning in finance and strategy",
        "Strong compensation and exit opportunities",
      ],
      cons: [
        "Demanding hours and intense workload",
        "High pressure and performance expectations",
        "Limited work-life balance in early career",
      ],
      dayInLife: [
        "Early mornings often involve updating models, reviewing market news, and preparing for client calls.",
        "Midday includes team meetings, client pitches, and coordinating with legal and accounting advisors.",
        "Late nights are common during live deals for revising presentations and diligence materials.",
      ],
      progression: [
        { title: "Analyst", description: "Build models, conduct research, and support deal execution." },
        { title: "Associate", description: "Manage workstreams, interface with clients, and mentor analysts." },
        { title: "Vice President", description: "Lead deal teams, originate client relationships, and drive execution." },
        { title: "Director / Managing Director", description: "Win mandates, set strategy, and oversee major transactions." },
      ],
    },
  },
  {
    key: "productManager",
    slug: "product-manager",
    title: "Product Manager",
    description: "Define product strategy, align teams, and deliver compelling customer experiences.",
    icon: "📈",
    evaluatorRole: "product management",
    overview: {
      headline: "What it means to be a Product Manager",
      intro:
        "Product Managers define what to build and why, balancing user needs, business goals, and technical constraints. They prioritize roadmaps, align engineering and design, and drive products from idea to launch.",
      simulationBlurb:
        "Tackle a realistic product decision scenario and get feedback on your prioritization and strategy.",
      whatTheyDo:
        "Product Managers gather customer insights, define requirements, write specs, and coordinate cross-functional delivery. They make trade-offs, measure outcomes, and iterate based on data and feedback.",
      skills: [
        "User research and customer empathy",
        "Prioritization and roadmap planning",
        "Data analysis and metric-driven decision making",
        "Stakeholder communication and alignment",
        "Technical fluency to partner effectively with engineering",
      ],
      education: [
        "Bachelor's degree in Business, CS, Design, or related fields",
        "MBA or product management certifications (optional)",
        "Hands-on experience shipping products or features",
        "Bootcamps and courses in UX, analytics, and agile methods",
      ],
      salaryRanges: [
        { region: "India", range: "₹12 LPA – ₹60 LPA+ depending on company and seniority." },
        { region: "USA", range: "$100K – $200K+ depending on company stage and scope." },
        { region: "Europe", range: "€55K – €130K+ depending on market and product scope." },
      ],
      pros: [
        "Ownership of customer-facing outcomes",
        "Cross-functional leadership without deep coding",
        "High visibility and impact on business growth",
      ],
      cons: [
        "Ambiguous authority without direct reports",
        "Constant context-switching across teams",
        "Pressure to deliver results with incomplete information",
      ],
      dayInLife: [
        "Mornings often include standups, reviewing metrics, and triaging customer feedback.",
        "Afternoons may involve spec reviews, design critiques, and stakeholder syncs.",
        "End of day might focus on roadmap planning, experiment analysis, and writing requirements.",
      ],
      progression: [
        { title: "Associate PM", description: "Support feature delivery, learn the product, and run small initiatives." },
        { title: "Product Manager", description: "Own a product area, define strategy, and ship meaningful outcomes." },
        { title: "Senior PM", description: "Lead complex product lines and mentor junior PMs." },
        { title: "Director / VP Product", description: "Set portfolio strategy and scale product organization." },
      ],
    },
  },
  {
    key: "dataScientist",
    slug: "data-scientist",
    title: "Data Scientist",
    description: "Unlock insights from data, build predictive models, and support smarter decisions.",
    icon: "📊",
    evaluatorRole: "data science",
    overview: {
      headline: "What it means to be a Data Scientist",
      intro:
        "Data Scientists extract insights from complex datasets, build predictive models, and communicate findings to drive decisions. They blend statistics, programming, and domain knowledge to solve business problems.",
      simulationBlurb:
        "Analyze a realistic data science scenario and receive feedback on your analytical approach.",
      whatTheyDo:
        "Data Scientists clean and explore data, engineer features, train models, and validate results. They partner with engineers to deploy models and with stakeholders to translate insights into action.",
      skills: [
        "Statistics, probability, and experimental design",
        "Python/R, SQL, and data manipulation libraries",
        "Machine learning and model evaluation",
        "Data visualization and storytelling",
        "Domain understanding and hypothesis-driven thinking",
      ],
      education: [
        "Degree in Statistics, CS, Mathematics, or related field",
        "Specialized courses in ML, deep learning, or analytics",
        "Kaggle competitions, portfolios, and real-world projects",
        "Advanced degrees (MS/PhD) for research-heavy roles",
      ],
      salaryRanges: [
        { region: "India", range: "₹8 LPA – ₹45 LPA+ depending on skills and company." },
        { region: "USA", range: "$90K – $180K+ depending on specialization and company." },
        { region: "Europe", range: "€50K – €110K+ depending on market and seniority." },
      ],
      pros: [
        "High demand across industries",
        "Intellectual variety combining math, code, and business",
        "Tangible impact through data-driven decisions",
      ],
      cons: [
        "Messy data and unclear problem definitions",
        "Stakeholder expectations vs. model limitations",
        "Need to continuously learn new tools and methods",
      ],
      dayInLife: [
        "Mornings may include checking pipeline health, reviewing experiment results, and team syncs.",
        "Afternoons often focus on exploratory analysis, feature engineering, or model training.",
        "Later work might involve presenting findings, documenting methodology, and planning next experiments.",
      ],
      progression: [
        { title: "Junior Data Scientist", description: "Support analyses, learn tooling, and contribute to model development." },
        { title: "Data Scientist", description: "Own end-to-end projects from problem framing to deployment." },
        { title: "Senior Data Scientist", description: "Lead complex initiatives and mentor junior team members." },
        { title: "Lead / Principal DS", description: "Set technical direction and influence company-wide data strategy." },
      ],
    },
  },
];

const careerBySlug = new Map(CAREERS.map((career) => [career.slug, career]));
const careerByKey = new Map(CAREERS.map((career) => [career.key, career]));

export function getCareerBySlug(slug: string): CareerConfig | undefined {
  return careerBySlug.get(slug);
}

export function getCareerByKey(key: CareerKey): CareerConfig | undefined {
  return careerByKey.get(key);
}

export function isValidCareerSlug(slug: string): boolean {
  return careerBySlug.has(slug);
}
