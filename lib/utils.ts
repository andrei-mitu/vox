import { twMerge, type ClassNameValue } from 'tailwind-merge';

/**
 * Utility to merge Tailwind CSS classes safely using tailwind-merge.
 */
export function cn(...inputs: ClassNameValue[]) {
  return twMerge(inputs);
}
