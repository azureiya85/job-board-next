import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNowStrict } from 'date-fns';
import { id as IndonesianLocale } from 'date-fns/locale'; // Optional: for Indonesian "lalu" suffix

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeDate(date: Date | string | undefined): string {
  if (!date) return '';
  try {
    return formatDistanceToNowStrict(new Date(date), { 
      addSuffix: true,
      locale: IndonesianLocale // Optional: if you want "X hari yang lalu" instead of "X days ago"
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid date';
  }
}

export function formatSalary(min?: number | null, max?: number | null, currency?: string | null): string {
  if (min && max) {
    return `${currency || 'IDR'} ${min / 1000000}jt - ${max / 1000000}jt`;
  }
  if (min) {
    return `${currency || 'IDR'} ${min / 1000000}jt`;
  }
  if (max) { // Unlikely to have only max, but good to handle
    return `Up to ${currency || 'IDR'} ${max / 1000000}jt`;
  }
  return "Competitive";
}