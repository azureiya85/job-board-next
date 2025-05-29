import { UserRole, AuthProvider, Gender, Education } from '@prisma/client';

// Helper to generate CUID-like placeholders for mock data
const mockCuid = (prefix: string, index: number) => `${prefix}_${String(index).padStart(2, '0')}`;

export interface UserMockData {
  id: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  role: UserRole;
  provider: AuthProvider;
  providerId?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  lastEducation?: Education;
  currentAddress?: string;
  phoneNumber?: string;
  latitude?: number;
  longitude?: number;
  provinceId?: string;
  cityId?: string;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}


export const users: UserMockData[] = [
  // Developer
  {
    id: mockCuid('user_dev', 1),
    email: 'developer@jobboard.com',
    password: 'hashed_password_dev', // Replace with actual hashed password in seed
    firstName: 'Dev',
    lastName: 'Team',
    profileImage: 'https://via.placeholder.com/150/0000FF/808080?Text=Dev',
    isEmailVerified: true,
    role: UserRole.Developer,
    provider: AuthProvider.EMAIL,
    createdAt: new Date('2023-01-01T08:00:00Z'),
    updatedAt: new Date('2023-01-01T08:00:00Z'),
    lastLoginAt: new Date(),
    provinceId: 'province_dki_id', // DKI Jakarta
    cityId: 'city_jkt_pusat_id',    // Jakarta Pusat
  },
  // Company Admins (will be linked to companies)
  {
    id: mockCuid('user_admin', 1), // Admin for "Tech Solutions Inc."
    email: 'admin.techsolutions@example.com',
    password: 'hashed_password_admin1',
    firstName: 'Budi',
    lastName: 'Santoso',
    profileImage: 'https://via.placeholder.com/150/FF0000/FFFFFF?Text=AdminBudi',
    isEmailVerified: true,
    role: UserRole.COMPANY_ADMIN,
    provider: AuthProvider.EMAIL,
    phoneNumber: '081234567890',
    createdAt: new Date('2023-02-01T09:00:00Z'),
    updatedAt: new Date('2023-02-01T09:00:00Z'),
    provinceId: 'province_dki_id', // DKI Jakarta
    cityId: 'city_jkt_selatan_id', // Jakarta Selatan
  },
  {
    id: mockCuid('user_admin', 2), // Admin for "Creative Media House"
    email: 'admin.creativemedia@example.com',
    password: 'hashed_password_admin2',
    firstName: 'Citra',
    lastName: 'Wijaya',
    profileImage: 'https://via.placeholder.com/150/00FF00/000000?Text=AdminCitra',
    isEmailVerified: true,
    role: UserRole.COMPANY_ADMIN,
    provider: AuthProvider.EMAIL,
    phoneNumber: '081234567891',
    createdAt: new Date('2023-02-05T09:00:00Z'),
    updatedAt: new Date('2023-02-05T09:00:00Z'),
    provinceId: 'province_jabar_id', // Jawa Barat
    cityId: 'city_bandung_id',      // Bandung
  },
  {
    id: mockCuid('user_admin', 3), // Admin for "GreenGrow Farms"
    email: 'admin.greengrow@example.com',
    password: 'hashed_password_admin3',
    firstName: 'Eko',
    lastName: 'Prasetyo',
    profileImage: 'https://via.placeholder.com/150/FFFF00/000000?Text=AdminEko',
    isEmailVerified: true,
    role: UserRole.COMPANY_ADMIN,
    provider: AuthProvider.EMAIL,
    phoneNumber: '081234567892',
    createdAt: new Date('2023-02-10T09:00:00Z'),
    updatedAt: new Date('2023-02-10T09:00:00Z'),
    provinceId: 'province_jatim_id', // Jawa Timur
    cityId: 'city_surabaya_id',     // Surabaya
  },
  // Regular Users (Job Seekers)
  {
    id: mockCuid('user_seeker', 1),
    email: 'anisa.rahayu@example.com',
    password: 'hashed_password_user1',
    firstName: 'Anisa',
    lastName: 'Rahayu',
    profileImage: 'https://via.placeholder.com/150/008080/FFFFFF?Text=Anisa',
    isEmailVerified: true,
    role: UserRole.USER,
    provider: AuthProvider.EMAIL,
    dateOfBirth: new Date('1995-05-15'),
    gender: Gender.FEMALE,
    lastEducation: Education.BACHELOR,
    currentAddress: 'Jl. Merdeka No. 10, Jakarta Pusat',
    phoneNumber: '085678901234',
    latitude: -6.1805, // Jakarta Pusat
    longitude: 106.8284,
    provinceId: 'province_dki_id',
    cityId: 'city_jkt_pusat_id',
    createdAt: new Date('2023-03-01T10:00:00Z'),
    updatedAt: new Date('2023-03-01T10:00:00Z'),
  },
  {
    id: mockCuid('user_seeker', 2),
    email: 'david.lee@example.com',
    password: 'hashed_password_user2',
    firstName: 'David',
    lastName: 'Lee',
    profileImage: 'https://via.placeholder.com/150/800080/FFFFFF?Text=David',
    isEmailVerified: true,
    role: UserRole.USER,
    provider: AuthProvider.GOOGLE,
    providerId: 'google_david_lee_unique_id',
    dateOfBirth: new Date('1998-11-20'),
    gender: Gender.MALE,
    lastEducation: Education.DIPLOMA,
    currentAddress: 'Jl. Asia Afrika No. 88, Bandung',
    phoneNumber: '087654321098',
    latitude: -6.9175, // Bandung
    longitude: 107.6191,
    provinceId: 'province_jabar_id',
    cityId: 'city_bandung_id',
    createdAt: new Date('2023-03-05T11:00:00Z'),
    updatedAt: new Date('2023-03-05T11:00:00Z'),
  },
  {
    id: mockCuid('user_seeker', 3),
    email: 'siti.aminah@example.com',
    // No password for social login if that's how you implement
    firstName: 'Siti',
    lastName: 'Aminah',
    profileImage: 'https://via.placeholder.com/150/FFC0CB/000000?Text=Siti',
    isEmailVerified: true, // Assume social logins are verified
    role: UserRole.USER,
    provider: AuthProvider.FACEBOOK,
    providerId: 'facebook_siti_aminah_unique_id',
    dateOfBirth: new Date('2000-01-30'),
    gender: Gender.FEMALE,
    lastEducation: Education.HIGH_SCHOOL,
    currentAddress: 'Jl. Pahlawan No. 1, Surabaya',
    phoneNumber: '089876543210',
    latitude: -7.2504, // Surabaya
    longitude: 112.7688,
    provinceId: 'province_jatim_id',
    cityId: 'city_surabaya_id',
    createdAt: new Date('2023-03-10T12:00:00Z'),
    updatedAt: new Date('2023-03-10T12:00:00Z'),
  },
];