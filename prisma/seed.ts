import { PrismaClient, UserRole, AuthProvider, Gender, Education, CompanySize, JobCategory, EmploymentType, ExperienceLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { indonesianLocations } from '../src/components/data/cities'; 
import { userSubscriptionPlans } from '../src/components/data/subscriptions'; 
import { skillCategories, sampleAssessments } from '../src/components/data/assessments';
import { getInitialAnalyticsData } from '../src/components/data/analytics';
import { users as mockUsers } from '../src/components/data/users'; 
import { companies as mockCompanies } from '../src/components/data/companies'; 
import { jobPostings as mockJobPostings } from '../src/components/data/jobs'; 

const prisma = new PrismaClient();

// Maps to store actual IDs against mock IDs/names for linking
const provinceCodeToIdMap = new Map<string, string>();
const cityKeyToIdMap = new Map<string, string>(); // Key: "provinceCode_cityName"
const userMockIdToActualIdMap = new Map<string, string>();
const companyMockIdToActualIdMap = new Map<string, string>();

const SALT_ROUNDS = 10;

async function seedLocations() {
  console.log('🏛️ Seeding provinces and cities...');
  for (const provinceData of indonesianLocations) {
    console.log(`  Creating province: ${provinceData.name} (${provinceData.code})`);
    const province = await prisma.province.upsert({
      where: { code: provinceData.code },
      update: {
        name: provinceData.name,
        latitude: provinceData.latitude,
        longitude: provinceData.longitude,
      },
      create: {
        name: provinceData.name,
        code: provinceData.code,
        latitude: provinceData.latitude,
        longitude: provinceData.longitude,
      },
    });
    provinceCodeToIdMap.set(province.code, province.id);

    for (const cityData of provinceData.cities) {
      const cityKey = `${province.code}_${cityData.name}`;
      const city = await prisma.city.upsert({
        where: { name_provinceId: { name: cityData.name, provinceId: province.id } },
        update: {
          type: cityData.type,
          latitude: cityData.latitude,
          longitude: cityData.longitude,
        },
        create: {
          name: cityData.name,
          type: cityData.type,
          latitude: cityData.latitude,
          longitude: cityData.longitude,
          provinceId: province.id,
        },
      });
      cityKeyToIdMap.set(cityKey, city.id);
    }
    console.log(`  ✅ Created/Updated ${provinceData.cities.length} cities for ${provinceData.name}`);
  }
  console.log('🏛️ Provinces and cities seeding completed.');
}

async function seedUserSubscriptionPlans() { // Renamed function for clarity
  console.log('💳 Seeding user subscription plans...');
  for (const planData of userSubscriptionPlans) { // Corrected variable name here
    await prisma.subscriptionPlan.upsert({
      where: { name: planData.name },
      update: {
        price: planData.price,
        duration: planData.duration,
        description: planData.description,
        features: planData.features,
      },
      create: {
        id: planData.id, // Use mock ID if provided and unique
        name: planData.name,
        price: planData.price,
        duration: planData.duration,
        description: planData.description,
        features: planData.features,
        createdAt: planData.createdAt,
        updatedAt: planData.updatedAt,
      },
    });
  }
  console.log('💳 User subscription plans seeding completed.');
}

async function seedUsers() {
  console.log('👤 Seeding users...');
  for (const userData of mockUsers) {
    const hashedPassword = userData.password ? await bcrypt.hash(userData.password, SALT_ROUNDS) : null;
    const provinceId = userData.provinceId ? provinceCodeToIdMap.get(userData.provinceId) : undefined; // Assuming userData.provinceId is a code like 'DKI'
    const cityId = (userData.provinceId && userData.cityId) ? cityKeyToIdMap.get(`${userData.provinceId}_${userData.cityId}`) : undefined; // Assuming userData.cityId is a name like 'Jakarta Pusat'

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        // Update fields if user exists, be selective
        firstName: userData.firstName,
        lastName: userData.lastName,
        // Potentially other fields
      },
      create: {
        // id: userData.id, // Let Prisma generate ID, store mockId for mapping
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImage: userData.profileImage,
        isEmailVerified: userData.isEmailVerified,
        role: userData.role as UserRole,
        provider: userData.provider as AuthProvider,
        providerId: userData.providerId,
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : undefined,
        gender: userData.gender as Gender,
        lastEducation: userData.lastEducation as Education,
        currentAddress: userData.currentAddress,
        phoneNumber: userData.phoneNumber,
        latitude: userData.latitude,
        longitude: userData.longitude,
        provinceId: provinceId, // Use looked-up actual provinceId
        cityId: cityId,         // Use looked-up actual cityId
        country: userData.country || 'Indonesia',
        createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
        updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : new Date(),
        lastLoginAt: userData.lastLoginAt ? new Date(userData.lastLoginAt) : undefined,
      },
    });
    userMockIdToActualIdMap.set(userData.id, user.id); // Map mock ID (from users.ts) to actual DB ID
    console.log(`  👤 Created/Updated user: ${user.email} (Mock ID: ${userData.id} -> Actual ID: ${user.id})`);
  }
  console.log('👤 Users seeding completed.');
}

async function seedCompanies() {
  console.log('🏢 Seeding companies...');
  for (const companyData of mockCompanies) {
    const adminActualId = userMockIdToActualIdMap.get(companyData.adminId);
    if (!adminActualId) {
      console.warn(`  ⚠️ Admin user with mock ID ${companyData.adminId} not found for company ${companyData.name}. Skipping company.`);
      continue;
    }

    // Assume companyData.provinceId is a code like 'DKI' and companyData.cityId is a name like 'Jakarta Selatan'
    const provinceId = companyData.provinceId ? provinceCodeToIdMap.get(companyData.provinceId) : undefined;
    const cityId = (companyData.provinceId && companyData.cityId) ? cityKeyToIdMap.get(`${companyData.provinceId}_${companyData.cityId}`) : undefined;


    const company = await prisma.company.upsert({
      where: { adminId: adminActualId }, // Assuming adminId is unique for a company
      // Or use another unique field like `name` if `adminId` isn't suitable for `where`
      // where: { name: companyData.name },
      update: {
        // Selective updates
        description: companyData.description,
        website: companyData.website,
        logo: companyData.logo,
      },
      create: {
        // id: companyData.id, // Let Prisma generate ID
        name: companyData.name,
        description: companyData.description,
        website: companyData.website,
        logo: companyData.logo,
        industry: companyData.industry,
        size: companyData.size as CompanySize,
        foundedYear: companyData.foundedYear,
        email: companyData.email,
        phone: companyData.phone,
        address: companyData.address,
        latitude: companyData.latitude,
        longitude: companyData.longitude,
        provinceId: provinceId,
        cityId: cityId,
        country: companyData.country || 'Indonesia',
        linkedinUrl: companyData.linkedinUrl,
        facebookUrl: companyData.facebookUrl,
        twitterUrl: companyData.twitterUrl,
        instagramUrl: companyData.instagramUrl,
        adminId: adminActualId,
        createdAt: companyData.createdAt ? new Date(companyData.createdAt) : new Date(),
        updatedAt: companyData.updatedAt ? new Date(companyData.updatedAt) : new Date(),
      },
    });
    companyMockIdToActualIdMap.set(companyData.id, company.id); // Map mock ID to actual DB ID
    console.log(`  🏢 Created/Updated company: ${company.name} (Mock ID: ${companyData.id} -> Actual ID: ${company.id})`);
  }
  console.log('🏢 Companies seeding completed.');
}

async function seedJobPostings() {
  console.log('📄 Seeding job postings...');
  for (const jobData of mockJobPostings) {
    const companyActualId = companyMockIdToActualIdMap.get(jobData.companyId);
    if (!companyActualId) {
      console.warn(`  ⚠️ Company with mock ID ${jobData.companyId} not found for job ${jobData.title}. Skipping job.`);
      continue;
    }

    // Assume jobData.provinceId is a code like 'DKI' and jobData.cityId is a name like 'Jakarta Selatan'
    const provinceId = jobData.provinceId ? provinceCodeToIdMap.get(jobData.provinceId) : undefined;
    const cityId = (jobData.provinceId && jobData.cityId) ? cityKeyToIdMap.get(`${jobData.provinceId}_${jobData.cityId}`) : undefined;

    await prisma.jobPosting.create({ // Using create as jobs are less likely to be upserted by a mock ID in this simple setup
      data: {
        // id: jobData.id, // Let Prisma generate ID
        title: jobData.title,
        description: jobData.description,
        banner: jobData.banner,
        category: jobData.category as JobCategory,
        employmentType: jobData.employmentType as EmploymentType,
        experienceLevel: jobData.experienceLevel as ExperienceLevel,
        salaryMin: jobData.salaryMin,
        salaryMax: jobData.salaryMax,
        salaryCurrency: jobData.salaryCurrency || 'IDR',
        isRemote: jobData.isRemote,
        latitude: jobData.latitude,
        longitude: jobData.longitude,
        provinceId: provinceId,
        cityId: cityId,
        country: jobData.country || 'Indonesia',
        applicationDeadline: jobData.applicationDeadline ? new Date(jobData.applicationDeadline) : undefined,
        isActive: jobData.isActive,
        isPriority: jobData.isPriority,
        requirements: jobData.requirements,
        benefits: jobData.benefits,
        tags: jobData.tags,
        companyId: companyActualId,
        createdAt: jobData.createdAt ? new Date(jobData.createdAt) : new Date(),
        updatedAt: jobData.updatedAt ? new Date(jobData.updatedAt) : new Date(),
        publishedAt: jobData.publishedAt ? new Date(jobData.publishedAt) : undefined,
      },
    });
    console.log(`  📄 Created job: ${jobData.title}`);
  }
  console.log('📄 Job postings seeding completed.');
}


async function seedSkillAssessments() {
  console.log('🎯 Seeding skill categories and assessments...');
  for (const categoryData of skillCategories) {
    await prisma.skillCategory.upsert({
      where: { name: categoryData.name },
      update: {}, // No updates needed for category if it exists based on name
      create: categoryData,
    });
  }
  console.log(`  ✅ Seeded ${skillCategories.length} skill categories.`);

  for (const assessmentItem of sampleAssessments) {
    const category = await prisma.skillCategory.findUnique({
      where: { name: assessmentItem.categoryName },
    });

    if (category) {
      // Check if assessment with this title already exists for this category
      const existingAssessment = await prisma.skillAssessment.findFirst({
        where: {
          title: assessmentItem.assessment.title,
          categoryId: category.id,
        },
      });

      if (!existingAssessment) {
        await prisma.skillAssessment.create({
          data: {
            title: assessmentItem.assessment.title,
            description: assessmentItem.assessment.description,
            passingScore: assessmentItem.assessment.passingScore,
            timeLimit: assessmentItem.assessment.timeLimit,
            isActive: true, // Assuming default
            categoryId: category.id,
            questions: {
              create: assessmentItem.assessment.questions.map(q => ({
                question: q.question,
                optionA: q.optionA,
                optionB: q.optionB,
                optionC: q.optionC,
                optionD: q.optionD,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
              })),
            },
          },
        });
        console.log(`  📊 Created assessment: ${assessmentItem.assessment.title}`);
      } else {
        console.log(`  📊 Assessment "${assessmentItem.assessment.title}" already exists. Skipping.`);
      }
    } else {
      console.warn(`  ⚠️ Skill category "${assessmentItem.categoryName}" not found for assessment "${assessmentItem.assessment.title}". Skipping.`);
    }
  }
  console.log('🎯 Skill assessments seeding completed.');
}

async function seedAnalytics() {
  console.log('📈 Initializing analytics...');
  const analyticsData = getInitialAnalyticsData();
  await prisma.websiteAnalytics.upsert({
    where: { date: analyticsData.date },
    update: {}, // No update needed if entry for date exists
    create: analyticsData,
  });
  console.log('📈 Analytics initialization completed.');
}

async function clearExistingData() {
  console.log('🧹 Cleaning existing data (order matters due to foreign keys)...');

  // Start with models that are referenced by many others or have cascading deletes that might be complex
  await prisma.notification.deleteMany();
  await prisma.interviewSchedule.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.savedJob.deleteMany();
  
  // PreSelectionTest references Company, JobPosting might reference PreSelectionTest
  // If JobPosting has onDelete: Cascade for preSelectionTestId, this order is fine
  await prisma.preSelectionQuestion.deleteMany();
  await prisma.preSelectionTest.deleteMany(); // If companies reference this, clear after company jobs
  
  await prisma.jobPosting.deleteMany(); // Before companies if companies don't cascade delete them
  
  await prisma.companyReview.deleteMany();
  
  await prisma.certificate.deleteMany();
  await prisma.userSkillAssessment.deleteMany(); // Before SkillAssessment if it doesn't cascade
  
  // SkillAssessmentQuestion has onDelete: Cascade from SkillAssessment
  await prisma.skillAssessmentQuestion.deleteMany(); // Technically covered by SkillAssessment delete if cascade
  await prisma.skillAssessment.deleteMany(); // Before SkillCategory
  await prisma.skillCategory.deleteMany();

  await prisma.subscription.deleteMany(); // Before User and SubscriptionPlan
  await prisma.subscriptionPlan.deleteMany();

  // Company references User (adminId)
  // User references Province, City
  await prisma.company.deleteMany(); // Before users
  await prisma.user.deleteMany(); // Before Province and City (if no other direct FKs from P/C to User)
  
  await prisma.city.deleteMany();
  await prisma.province.deleteMany();
  
  await prisma.websiteAnalytics.deleteMany(); // Usually safe to delete anytime

  console.log('🧹 Data cleaning finished.');
}


async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    await clearExistingData();

    // Seed in order of dependency
    await seedLocations(); // Provinces, Cities (populates provinceCodeToIdMap, cityKeyToIdMap)
    await seedUserSubscriptionPlans();
    await seedSkillAssessments(); // Categories, then Assessments
    
    // Users, Companies, Jobs depend on locations and each other
    await seedUsers();       // Populates userMockIdToActualIdMap
    await seedCompanies();   // Uses userMockIdToActualIdMap, populates companyMockIdToActualIdMap
    await seedJobPostings(); // Uses companyMockIdToActualIdMap

    await seedAnalytics();

    console.log('✨ Database seeding completed successfully!');
    console.log(`  🏛️ Provinces: ${provinceCodeToIdMap.size}, Cities: ${cityKeyToIdMap.size}`);
    console.log(`  💳 User Subscription Plans: ${userSubscriptionPlans.length}`);
    console.log(`  🎯 Skill Categories: ${skillCategories.length}, Sample Assessments created for them.`);
    console.log(`  👤 Users: ${userMockIdToActualIdMap.size}`);
    console.log(`  🏢 Companies: ${companyMockIdToActualIdMap.size}`);
    console.log(`  📄 Job Postings: ${mockJobPostings.length}`); // Or count actual created
    console.log('  📈 Analytics Initialized.');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    // No need to throw error here if you want the finally block to always run
    // process.exit(1) will be called by the caller if needed.
  }
}

main()
  .catch((e) => {
    console.error("MAIN CATCH BLOCK:", e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('🔌 Disconnecting Prisma client...');
    await prisma.$disconnect();
  });