import { NextRequest, NextResponse } from 'next/server';
import { getJobs, GetJobsParams } from '@/lib/jobsUtils'; 
import { z } from 'zod';
import { JobCategory, EmploymentType, ExperienceLevel, CompanySize } from '@prisma/client';

// Define the Zod schema for validating and parsing search parameters
const searchParamsSchema = z.object({
  take: z.coerce.number().int().positive().optional(),
  skip: z.coerce.number().int().nonnegative().optional(),
  jobTitle: z.string().optional(),
  locationQuery: z.string().optional(),
  categories: z.preprocess(
    (val) => (typeof val === 'string' ? val.split(',') : val), 
    z.array(z.nativeEnum(JobCategory)).optional()
  ),
  employmentTypes: z.preprocess(
    (val) => (typeof val === 'string' ? val.split(',') : val),
    z.array(z.nativeEnum(EmploymentType)).optional()
  ),
  experienceLevels: z.preprocess(
    (val) => (typeof val === 'string' ? val.split(',') : val),
    z.array(z.nativeEnum(ExperienceLevel)).optional()
  ),
  companySizes: z.preprocess(
    (val) => (typeof val === 'string' ? val.split(',') : val),
    z.array(z.nativeEnum(CompanySize)).optional()
  ),
  isRemote: z.preprocess(val => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  }, z.boolean().optional()),
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const paramsObject: Record<string, string | string[]> = {};
  for (const [key, value] of searchParams.entries()) {
    // Check if the key could be an array type based on the schema (categories, employmentTypes, etc.)
    if (['categories', 'employmentTypes', 'experienceLevels', 'companySizes'].includes(key)) {
        const existing = paramsObject[key];
        if (existing) {
            if (Array.isArray(existing)) {
                existing.push(value);
            } else {
                paramsObject[key] = [existing, value];
            }
        } else {
            paramsObject[key] = [value]; // Start as array if it's a known array key
        }
    } else {
        paramsObject[key] = value; // Single value
    }
  }
  // A more direct way for known array keys with Zod's preprocess:
  // const paramsObject = {
  //   take: searchParams.get('take'),
  //   skip: searchParams.get('skip'),
  //   jobTitle: searchParams.get('jobTitle'),
  //   locationQuery: searchParams.get('locationQuery'),
  //   isRemote: searchParams.get('isRemote'),
  //   categories: searchParams.getAll('categories'), // Zod preprocess will handle empty array
  //   employmentTypes: searchParams.getAll('employmentTypes'),
  //   experienceLevels: searchParams.getAll('experienceLevels'),
  //   companySizes: searchParams.getAll('companySizes'),
  // };


  const validationResult = searchParamsSchema.safeParse(paramsObject);

  if (!validationResult.success) {
    console.error("Zod Validation Errors:", validationResult.error.format());
    return NextResponse.json({ error: "Invalid query parameters", details: validationResult.error.format() }, { status: 400 });
  }

  const {
    take, skip, jobTitle, locationQuery, isRemote,
    categories, 
    employmentTypes,
    experienceLevels,
    companySizes,
  } = validationResult.data;


  const paramsForDb: GetJobsParams = {
    take,
    skip,
    jobTitle,
    locationQuery,
    categories, 
    employmentTypes,
    experienceLevels,
    companySizes,
    isRemote,
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  };

  try {
    const jobs = await getJobs(paramsForDb);
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('[API_JOBS_GET] Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}