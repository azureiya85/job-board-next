import { JobCategory, EmploymentType, ExperienceLevel } from '@prisma/client';

// Helper to generate CUID-like placeholders
const mockCuid = (prefix: string, index: number) => `${prefix}_${String(index).padStart(2, '0')}`;

// Helper function to create dates relative to now for recency
const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};


export interface JobPostingMockData {
  id: string;
  title: string;
  description: string;
  banner?: string;
  category: JobCategory;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  isRemote: boolean;
  latitude?: number;
  longitude?: number;
  provinceId?: string;
  cityId?: string;
  country?: string;
  applicationDeadline?: Date;
  isActive: boolean;
  isPriority?: boolean;
  requirements: string[];
  benefits: string[];
  tags: string[];
  companyId: string; 
  // preSelectionTestId?: string; // TODO: Add later 
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}


export const jobPostings: JobPostingMockData[] = [
  // --- Tech Solutions Inc. Jobs (Jakarta) ---
  {
    id: mockCuid('job', 1),
    title: 'Senior Backend Engineer (Golang)',
    description: 'Join our core engineering team to design, develop, and maintain scalable backend services using Golang. You will work on critical projects impacting millions of users and contribute to our microservices architecture.',
    category: JobCategory.TECHNOLOGY,
    employmentType: EmploymentType.FULL_TIME,
    experienceLevel: ExperienceLevel.SENIOR_LEVEL,
    salaryMin: 25000000,
    salaryMax: 35000000,
    isRemote: false,
    latitude: -6.225, // Jakarta Selatan
    longitude: 106.82,
    provinceId: 'DKI',
    cityId: 'Jakarta Utara',
    applicationDeadline: new Date('2025-08-30T23:59:59Z'),
    isActive: true,
    isPriority: true,
    requirements: ['5+ years Golang experience', 'Microservices architecture', 'Docker, Kubernetes', 'SQL/NoSQL databases'],
    benefits: ['Competitive salary', 'Health insurance', 'Stock options', 'Flexible working hours'],
    tags: ['golang', 'backend', 'microservices', 'api', 'cloud'],
    companyId: mockCuid('company', 1), // Tech Solutions Inc.
    createdAt: daysAgo(1), // Very recent
    updatedAt: daysAgo(1),
    publishedAt: daysAgo(1),
  },
  {
    id: mockCuid('job', 2),
    title: 'Frontend Developer (React)',
    description: 'We are looking for a skilled Frontend Developer proficient in React.js to build responsive and user-friendly web applications. You will collaborate with UI/UX designers and backend developers to deliver high-quality products.',
    category: JobCategory.TECHNOLOGY,
    employmentType: EmploymentType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID_LEVEL,
    salaryMin: 15000000,
    salaryMax: 22000000,
    isRemote: false,
    latitude: -6.225, // Jakarta Selatan
    longitude: 106.82,
    provinceId: 'DKI',
    cityId: 'Jakarta Selatan',
    applicationDeadline: new Date('2025-09-15T23:59:59Z'),
    isActive: true,
    requirements: ['3+ years React.js experience', 'HTML, CSS, JavaScript (ES6+)', 'State management (Redux/Context API)', 'RESTful APIs'],
    benefits: ['Health insurance', 'Free lunch', 'Training budget', 'Team outings'],
    tags: ['react', 'frontend', 'javascript', 'ui', 'webdev'],
    companyId: mockCuid('company', 1), // Tech Solutions Inc.
    createdAt: daysAgo(2), // Recent
    updatedAt: daysAgo(2),
    publishedAt: daysAgo(2),
  },
  {
    id: mockCuid('job', 3),
    title: 'QA Automation Engineer',
    description: 'Seeking a QA Automation Engineer to design and implement automated testing frameworks. Ensure product quality through comprehensive test plans and execution.',
    category: JobCategory.TECHNOLOGY,
    employmentType: EmploymentType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID_LEVEL,
    salaryMin: 12000000,
    salaryMax: 18000000,
    isRemote: true, // Remote job
    // No specific lat/long for remote, but company location can be fallback
    provinceId: 'JABAR', // Company's province
    cityId: 'Bekasi',  // Company's city
    applicationDeadline: new Date('2025-08-20T23:59:59Z'),
    isActive: true,
    requirements: ['Experience with Selenium/Cypress', 'API testing', 'CI/CD pipelines', 'Agile methodology'],
    benefits: ['Remote work flexibility', 'Competitive salary', 'Learning opportunities'],
    tags: ['qa', 'automation', 'testing', 'selenium', 'cypress', 'remote'],
    companyId: mockCuid('company', 1), // Tech Solutions Inc.
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
    publishedAt: daysAgo(5),
  },
  // --- Creative Media House Jobs (Bandung) ---
  {
    id: mockCuid('job', 4),
    title: 'Digital Marketing Specialist',
    description: 'Develop and execute digital marketing campaigns across various channels (SEO, SEM, Social Media). Analyze campaign performance and optimize for ROI. Must be creative and data-driven.',
    category: JobCategory.MARKETING,
    employmentType: EmploymentType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID_LEVEL,
    salaryMin: 10000000,
    salaryMax: 15000000,
    isRemote: false,
    latitude: -6.89, // Bandung
    longitude: 107.6,
    provinceId: 'JABAR',
    cityId: 'Bandung',
    applicationDeadline: new Date('2025-09-01T23:59:59Z'),
    isActive: true,
    isPriority: false,
    requirements: ['Proven digital marketing experience', 'Google Ads, Facebook Ads', 'SEO tools', 'Content creation skills'],
    benefits: ['Creative work environment', 'Bonus based on performance', 'Health benefits'],
    tags: ['digitalmarketing', 'seo', 'sem', 'socialmedia', 'content'],
    companyId: mockCuid('company', 2), // Creative Media House
    createdAt: daysAgo(0), // Today - very recent
    updatedAt: daysAgo(0),
    publishedAt: daysAgo(0),
  },
  {
    id: mockCuid('job', 5),
    title: 'Graphic Designer Intern',
    description: 'Exciting internship opportunity for a budding Graphic Designer. Assist senior designers with various projects, learn industry tools, and build your portfolio. Passion for design is a must!',
    category: JobCategory.DESIGN,
    employmentType: EmploymentType.INTERNSHIP,
    experienceLevel: ExperienceLevel.ENTRY_LEVEL,
    // Salary often not listed for internships or is a fixed allowance
    isRemote: false,
    latitude: -6.89, // Bandung
    longitude: 107.6,
    provinceId: 'DIY',
    cityId: 'Yogyakarta',
    applicationDeadline: new Date('2025-08-15T23:59:59Z'),
    isActive: true,
    requirements: ['Proficiency in Adobe Creative Suite (Photoshop, Illustrator)', 'Strong portfolio (even student work)', 'Eagerness to learn'],
    benefits: ['Mentorship program', 'Potential for full-time offer', 'Creative projects'],
    tags: ['graphicdesign', 'internship', 'adobe', 'creative', 'uiux'],
    companyId: mockCuid('company', 2), // Creative Media House
    createdAt: daysAgo(3), // Recent
    updatedAt: daysAgo(3),
    publishedAt: daysAgo(3),
  },
  {
    id: mockCuid('job', 6),
    title: 'Social Media Manager',
    description: 'Manage our clients\' social media presence, create engaging content, and grow their online communities. Must be up-to-date with social media trends and analytics.',
    category: JobCategory.MARKETING,
    employmentType: EmploymentType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID_LEVEL,
    salaryMin: 9000000,
    salaryMax: 13000000,
    isRemote: false,
    latitude: -6.89, // Bandung
    longitude: 107.6,
    provinceId: 'JATENG',
    cityId: 'Semarang',
    applicationDeadline: new Date('2025-09-10T23:59:59Z'),
    isActive: true,
    requirements: ['2+ years social media management', 'Content creation', 'Community management', 'Analytics tools'],
    benefits: ['Dynamic team', 'Opportunity for growth', 'Health insurance'],
    tags: ['socialmedia', 'contentmarketing', 'community', 'digital'],
    companyId: mockCuid('company', 2), // Creative Media House
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
    publishedAt: daysAgo(10),
  },
  // --- GreenGrow Farms Jobs (Surabaya) ---
  {
    id: mockCuid('job', 7),
    title: 'Agronomist',
    description: 'Oversee crop production, soil management, and pest control for our organic farms. Implement sustainable farming practices and conduct research to improve yield and quality.',
    category: JobCategory.OTHER, // Or a more specific 'AGRICULTURE'
    employmentType: EmploymentType.FULL_TIME,
    experienceLevel: ExperienceLevel.SENIOR_LEVEL,
    salaryMin: 12000000,
    salaryMax: 17000000,
    isRemote: false,
    latitude: -7.28, // Surabaya
    longitude: 112.74,
    provinceId: 'JATIM',
    cityId: 'Surabaya',
    applicationDeadline: new Date('2025-08-25T23:59:59Z'),
    isActive: true,
    requirements: ['Degree in Agronomy or related field', '5+ years experience in organic farming', 'Knowledge of sustainable practices'],
    benefits: ['Work in a green environment', 'Contribute to sustainability', 'Accommodation (optional)'],
    tags: ['agronomy', 'agriculture', 'organic', 'sustainable', 'farming'],
    companyId: mockCuid('company', 3), // GreenGrow Farms
    createdAt: daysAgo(1), // Very Recent
    updatedAt: daysAgo(1),
    publishedAt: daysAgo(1),
  },
  {
    id: mockCuid('job', 8),
    title: 'Operations Manager - Farm Logistics',
    description: 'Manage the day-to-day operations of farm logistics, including harvesting schedules, inventory, and distribution. Optimize processes for efficiency and cost-effectiveness.',
    category: JobCategory.OPERATIONS,
    employmentType: EmploymentType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID_LEVEL,
    salaryMin: 10000000,
    salaryMax: 16000000,
    isRemote: false,
    latitude: -7.28, // Surabaya
    longitude: 112.74,
    provinceId: 'JATIM',
    cityId: 'Malang',
    applicationDeadline: new Date('2025-09-05T23:59:59Z'),
    isActive: true,
    requirements: ['Experience in operations or supply chain', 'Problem-solving skills', 'Team leadership'],
    benefits: ['Challenging role with impact', 'Health benefits', 'Bonus scheme'],
    tags: ['operations', 'logistics', 'supplychain', 'agriculture', 'management'],
    companyId: mockCuid('company', 3), // GreenGrow Farms
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15),
    publishedAt: daysAgo(15),
  },
  // --- More from Tech Solutions Inc. (Different City - e.g., a branch or fully remote target) ---
  {
    id: mockCuid('job', 9),
    title: 'Customer Success Manager (Remote)',
    description: 'Build strong relationships with our key clients, ensure they are successful using our products, and identify opportunities for growth. Proactive communication and problem-solving are key.',
    category: JobCategory.CUSTOMER_SERVICE,
    employmentType: EmploymentType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID_LEVEL,
    salaryMin: 13000000,
    salaryMax: 19000000,
    isRemote: true,
    // For remote, we can still list a preferred or common timezone/region, or company HQ's city.
    // Let's say they are hiring for someone who can work with clients in Jawa Barat region.
    provinceId: 'BANTEN', // Target candidate region or company branch
    cityId: 'Serang',       // Target candidate city or company branch
    applicationDeadline: new Date('2025-09-20T23:59:59Z'),
    isActive: true,
    requirements: ['3+ years in Customer Success or Account Management', 'Excellent communication skills', 'Tech-savvy', 'CRM experience'],
    benefits: ['Fully remote', 'Competitive package', 'Career growth', 'Dynamic team'],
    tags: ['customersuccess', 'accountmanagement', 'remote', 'saas', 'clientrelations'],
    companyId: mockCuid('company', 1), // Tech Solutions Inc.
    createdAt: daysAgo(4), // Recent
    updatedAt: daysAgo(4),
    publishedAt: daysAgo(4),
  },
  {
    id: mockCuid('job', 10),
    title: 'DevOps Engineer',
    description: 'Join our platform team to build and maintain our CI/CD pipelines, manage cloud infrastructure (AWS/GCP), and ensure system reliability and scalability. Strong scripting and automation skills required.',
    category: JobCategory.TECHNOLOGY,
    employmentType: EmploymentType.FULL_TIME,
    experienceLevel: ExperienceLevel.SENIOR_LEVEL,
    salaryMin: 20000000,
    salaryMax: 30000000,
    isRemote: false, // On-site at Jakarta HQ
    latitude: -6.225, // Jakarta Selatan
    longitude: 106.82,
    provinceId: 'DKI',
    cityId: 'Jakarta Pusat',
    applicationDeadline: new Date('2025-09-25T23:59:59Z'),
    isActive: true,
    requirements: ['5+ years DevOps experience', 'AWS or GCP', 'Terraform, Ansible', 'CI/CD tools (Jenkins, GitLab CI)', 'Monitoring tools (Prometheus, Grafana)'],
    benefits: ['Challenging projects', 'Health & wellness benefits', 'Professional development fund'],
    tags: ['devops', 'cloud', 'aws', 'gcp', 'cicd', 'automation', 'kubernetes'],
    companyId: mockCuid('company', 1), // Tech Solutions Inc.
    createdAt: daysAgo(20),
    updatedAt: daysAgo(20),
    publishedAt: daysAgo(20),
  },
  {
  id: mockCuid('job', 11),
  title: 'Senior Financial Analyst',
  description: 'Lead financial analysis and modeling for strategic business decisions. Prepare detailed financial reports, conduct market research, and provide insights to senior management. Strong analytical and Excel skills required.',
  category: JobCategory.FINANCE,
  employmentType: EmploymentType.FULL_TIME,
  experienceLevel: ExperienceLevel.SENIOR_LEVEL,
  salaryMin: 18000000,
  salaryMax: 26000000,
  salaryCurrency: 'IDR',
  isRemote: false,
  latitude: -6.195, // Jakarta Pusat
  longitude: 106.82,
  provinceId: 'DKI',
  cityId: 'Jakarta Pusat',
  applicationDeadline: new Date('2025-09-12T23:59:59Z'),
  isActive: true,
  isPriority: true,
  requirements: ['5+ years financial analysis experience', 'Advanced Excel & PowerBI', 'CFA or CPA preferred', 'Strong presentation skills'],
  benefits: ['Competitive salary package', 'Annual bonus', 'Health & dental insurance', 'Professional certification support'],
  tags: ['finance', 'analyst', 'excel', 'financial-modeling', 'powerbi'],
  companyId: mockCuid('company', 4), // FinanceFirst Consulting
  createdAt: daysAgo(1),
  updatedAt: daysAgo(1),
  publishedAt: daysAgo(1),
},
{
  id: mockCuid('job', 12),
  title: 'Junior Accountant',
  description: 'Entry-level position for recent accounting graduates. Assist with bookkeeping, accounts payable/receivable, and month-end closing procedures. Great opportunity to learn from experienced professionals.',
  category: JobCategory.FINANCE,
  employmentType: EmploymentType.FULL_TIME,
  experienceLevel: ExperienceLevel.ENTRY_LEVEL,
  salaryMin: 6000000,
  salaryMax: 9000000,
  salaryCurrency: 'IDR',
  isRemote: false,
  latitude: -6.195, // Jakarta Pusat
  longitude: 106.82,
  provinceId: 'DKI',
  cityId: 'Jakarta Utara', // Different area in Jakarta
  applicationDeadline: new Date('2025-08-28T23:59:59Z'),
  isActive: true,
  requirements: ['Accounting degree', 'Basic Excel knowledge', 'Fresh graduate welcome', 'Attention to detail'],
  benefits: ['Mentorship program', 'Training opportunities', 'Health insurance', 'Career progression path'],
  tags: ['accounting', 'junior', 'freshgraduate', 'bookkeeping', 'finance'],
  companyId: mockCuid('company', 4), // FinanceFirst Consulting
  createdAt: daysAgo(3),
  updatedAt: daysAgo(3),
  publishedAt: daysAgo(3),
},
{
  id: mockCuid('job', 13),
  title: 'Full Stack Developer (Node.js + React)',
  description: 'Join our product development team to build innovative educational technology solutions. Work on both frontend and backend development using modern JavaScript technologies. Help shape the future of online learning.',
  category: JobCategory.TECHNOLOGY,
  employmentType: EmploymentType.FULL_TIME,
  experienceLevel: ExperienceLevel.MID_LEVEL,
  salaryMin: 16000000,
  salaryMax: 24000000,
  salaryCurrency: 'IDR',
  isRemote: true, // Remote position
  provinceId: 'JABAR', // Company's province as fallback
  cityId: 'Bandung',   // Company's city as fallback
  applicationDeadline: new Date('2025-09-08T23:59:59Z'),
  isActive: true,
  requirements: ['3+ years full stack development', 'Node.js, Express.js', 'React.js, TypeScript', 'MongoDB or PostgreSQL', 'RESTful API design'],
  benefits: ['100% remote work', 'Flexible hours', 'Stock options', 'Learning & development budget', 'Modern tech stack'],
  tags: ['fullstack', 'nodejs', 'react', 'typescript', 'remote', 'edtech'],
  companyId: mockCuid('company', 5), // EduTech Innovations
  createdAt: daysAgo(2),
  updatedAt: daysAgo(2),
  publishedAt: daysAgo(2),
},
{
  id: mockCuid('job', 14),
  title: 'Product Manager - EdTech Platform',
  description: 'Lead product strategy and development for our AI-powered learning platform. Work closely with engineering, design, and education teams to deliver features that enhance student learning outcomes.',
  category: JobCategory.TECHNOLOGY,
  employmentType: EmploymentType.FULL_TIME,
  experienceLevel: ExperienceLevel.SENIOR_LEVEL,
  salaryMin: 22000000,
  salaryMax: 32000000,
  salaryCurrency: 'IDR',
  isRemote: false,
  latitude: -6.92, // Bandung
  longitude: 107.61,
  provinceId: 'JABAR',
  cityId: 'Bandung',
  applicationDeadline: new Date('2025-09-18T23:59:59Z'),
  isActive: true,
  isPriority: true,
  requirements: ['5+ years product management experience', 'EdTech or SaaS background preferred', 'Data-driven decision making', 'User research experience', 'Agile/Scrum methodology'],
  benefits: ['Leadership role in growing startup', 'Equity participation', 'Impact on education sector', 'Health benefits', 'Team retreats'],
  tags: ['productmanager', 'edtech', 'ai', 'saas', 'agile', 'startup'],
  companyId: mockCuid('company', 5), // EduTech Innovations
  createdAt: daysAgo(0), // Today - very recent
  updatedAt: daysAgo(0),
  publishedAt: daysAgo(0),
},
{
  id: mockCuid('job', 15),
  title: 'UX/UI Designer',
  description: 'Design intuitive and engaging user interfaces for educational applications. Conduct user research, create wireframes and prototypes, and collaborate with developers to implement designs that enhance learning experiences.',
  category: JobCategory.DESIGN,
  employmentType: EmploymentType.CONTRACT,
  experienceLevel: ExperienceLevel.MID_LEVEL,
  salaryMin: 12000000,
  salaryMax: 18000000,
  salaryCurrency: 'IDR',
  isRemote: true, // Remote contract position
  provinceId: 'JABAR', // Company's province as fallback
  cityId: 'Bandung',   // Company's city as fallback
  applicationDeadline: new Date('2025-08-22T23:59:59Z'),
  isActive: true,
  requirements: ['3+ years UX/UI design experience', 'Figma, Sketch, Adobe XD', 'User research & testing', 'Mobile-first design', 'Portfolio showcasing educational or SaaS products'],
  benefits: ['Flexible contract terms', 'Remote work', 'Collaborative team', 'Creative freedom', 'Portfolio building opportunity'],
  tags: ['uxui', 'design', 'figma', 'userresearch', 'mobile', 'edtech', 'contract', 'remote'],
  companyId: mockCuid('company', 5), // EduTech Innovations
  createdAt: daysAgo(7),
  updatedAt: daysAgo(7),
  publishedAt: daysAgo(7),
}
];