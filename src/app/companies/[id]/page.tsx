import CompanyProfileTemplate from '@/components/templates/companies/CompanyProfileTemplate';
import { notFound } from 'next/navigation';
import type { CompanyDetailed } from '@/types';
import type { Metadata } from 'next'; 

interface CompanyPageProps {
  params: {
    id: string; 
  };
}

async function getCompanyData(companyId: string): Promise<CompanyDetailed | null> { 
  try {
    if (!companyId) {
      console.error('getCompanyData called with invalid companyId:', companyId);
      return null;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const res = await fetch(`${apiUrl}/api/companies/${companyId}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 404) {
        console.warn(`[getCompanyData] Company not found (404) for ID: ${companyId}`);
        return null;
      }
      const errorText = await res.text(); // Get more error details
      console.error(`[getCompanyData] Failed to fetch company data for ${companyId}: ${res.status} ${res.statusText}. Response: ${errorText}`);
      return null; 
    }

    const data = await res.json();
    return data as CompanyDetailed;

  } catch (error) {
    console.error(`[getCompanyData] Error in getCompanyData for ${companyId}:`, error);
    return null;
  }
}

export default async function CompanyProfilePage({ params }: CompanyPageProps) {
  const { id } = params; // CHANGED: from companyId to id
  console.log(`[CompanyProfilePage] Page loaded for company ID: ${id}`); // Added log
  const companyData = await getCompanyData(id); // Pass the correct id

  if (!companyData) {
    notFound();
  }

  return (
    <CompanyProfileTemplate company={companyData} />
  );
}

export async function generateMetadata(
  { params }: CompanyPageProps): Promise<Metadata> {
  const { id } = params; 
  const company = await getCompanyData(id); 

  if (!company) {
    return {
      title: 'Company Not Found',
    };
  }

  return {
    title: `${company.name} | Company Profile`,
    description: company.description?.substring(0, 160) || `Learn more about ${company.name} and their open positions.`,
    openGraph: {
      title: `${company.name} | Company Profile`,
      description: company.description?.substring(0, 160) || `Learn more about ${company.name}.`,
      images: company.logo ? [{ url: company.logo }] : [],
    },
  };
}