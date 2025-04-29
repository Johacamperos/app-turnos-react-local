import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Add this helper function somewhere in your component or a utils file
export const safeUpperCase = (str: string | null | undefined): string => {
  // If str is null, undefined, or an empty string, return an empty string.
  // Otherwise, return the uppercase version.
  return str ? str.toUpperCase() : '';
};