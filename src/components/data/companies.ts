import { CompanySize } from '@prisma/client';

// Helper to generate CUID-like placeholders
const mockCuid = (prefix: string, index: number) => `${prefix}_${String(index).padStart(2, '0')}`;

export interface CompanyMockData {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  industry?: string;
  size?: CompanySize;
  foundedYear?: number;
  email?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  provinceId?: string;
  cityId?: string;
  country?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  adminId: string; // Link to User ID with COMPANY_ADMIN role
  createdAt: Date;
  updatedAt: Date;
}


export const companies: CompanyMockData[] = [
  {
    id: mockCuid('company', 1),
    name: 'Tech Solutions Inc.',
    description: 'Leading provider of innovative software solutions for businesses. We empower companies to achieve digital transformation with our cutting-edge technology and expert services. Join us to build the future of tech!',
    website: 'https://techsolutions.example.com',
    logo: 'https://i.pinimg.com/1200x/79/72/d8/7972d81c70d4683dbf95af7394cde745.jpg',
    industry: 'TECHNOLOGY',
    size: CompanySize.MEDIUM,
    foundedYear: 2010,
    email: 'contact@techsolutions.example.com',
    phone: '021-555-0101',
    address: 'Jl. Sudirman Kav. 25, Jakarta Selatan',
    latitude: -6.225, // Approx Jakarta Selatan
    longitude: 106.82,
    provinceId: 'province_dki_id', // DKI Jakarta
    cityId: 'city_jkt_selatan_id',  // Jakarta Selatan
    linkedinUrl: 'https://linkedin.com/company/techsolutionsinc',
    adminId: mockCuid('user_admin', 1), // Budi Santoso
    createdAt: new Date('2023-02-02T10:00:00Z'),
    updatedAt: new Date('2023-02-02T10:00:00Z'),
  },
  {
    id: mockCuid('company', 2),
    name: 'Creative Media House',
    description: 'A dynamic digital marketing agency specializing in content creation, social media management, and branding. We help brands tell their story and connect with their audience in meaningful ways.',
    website: 'https://creativemedia.example.com',
    logo: 'https://i.pinimg.com/1200x/65/19/c2/6519c27bdac4f60ce300d49a43b31a2f.jpg',
    industry: 'MARKETING', // Using JobCategory enum values, assuming they broadly cover industries
    size: CompanySize.SMALL,
    foundedYear: 2015,
    email: 'hello@creativemedia.example.com',
    phone: '022-555-0202',
    address: 'Jl. Dago No. 100, Bandung',
    latitude: -6.89, // Approx Bandung
    longitude: 107.6,
    provinceId: 'province_jabar_id', // Jawa Barat
    cityId: 'city_bandung_id',      // Bandung
    linkedinUrl: 'https://linkedin.com/company/creativemediahouse',
    adminId: mockCuid('user_admin', 2), // Citra Wijaya
    createdAt: new Date('2023-02-06T11:00:00Z'),
    updatedAt: new Date('2023-02-06T11:00:00Z'),
  },
  {
    id: mockCuid('company', 3),
    name: 'GreenGrow Farms',
    description: 'Sustainable agriculture company dedicated to producing high-quality organic produce. We are committed to environmental stewardship and supporting local communities.',
    website: 'https://greengrow.example.com',
    logo: 'https://i.pinimg.com/1200x/7a/cd/75/7acd7589837642c8b44bc0627c8549de.jpg',
    industry: 'OTHER', // Could be 'AGRICULTURE' if you add it to JobCategory or have a separate industry enum
    size: CompanySize.STARTUP,
    foundedYear: 2018,
    email: 'info@greengrow.example.com',
    phone: '031-555-0303',
    address: 'Jl. Raya Darmo No. 50, Surabaya',
    latitude: -7.28, // Approx Surabaya
    longitude: 112.74,
    provinceId: 'province_jatim_id', // Jawa Timur
    cityId: 'city_surabaya_id',     // Surabaya
    adminId: mockCuid('user_admin', 3), // Eko Prasetyo
    createdAt: new Date('2023-02-11T12:00:00Z'),
    updatedAt: new Date('2023-02-11T12:00:00Z'),
  },
];