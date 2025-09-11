import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely converts a Firestore timestamp to an ISO string
 * @param timestamp - Firestore timestamp object or any value
 * @returns ISO string or null if invalid
 */
export function safeTimestampToISO(timestamp: any): string | null {
  try {
    // Check if it's a valid Firestore timestamp
    if (timestamp && typeof timestamp === 'object' && timestamp.seconds !== undefined) {
      const seconds = Number(timestamp.seconds);
      if (isNaN(seconds) || seconds < 0) {
        return null;
      }
      const date = new Date(seconds * 1000);
      if (isNaN(date.getTime())) {
        return null;
      }
      return date.toISOString();
    }
    
    // Check if it's already a valid date string
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
    
    // Check if it's a valid Date object
    if (timestamp instanceof Date && !isNaN(timestamp.getTime())) {
      return timestamp.toISOString();
    }
    
    return null;
  } catch (error) {
    console.error('Error converting timestamp to ISO:', error);
    return null;
  }
}

/**
 * Safely converts a Firestore timestamp to a Date object
 * @param timestamp - Firestore timestamp object or any value
 * @returns Date object or null if invalid
 */
export function safeTimestampToDate(timestamp: any): Date | null {
  try {
    // Check if it's a valid Firestore timestamp
    if (timestamp && typeof timestamp === 'object' && timestamp.seconds !== undefined) {
      const seconds = Number(timestamp.seconds);
      if (isNaN(seconds) || seconds < 0) {
        return null;
      }
      const date = new Date(seconds * 1000);
      if (isNaN(date.getTime())) {
        return null;
      }
      return date;
    }
    
    // Check if it's already a valid date string
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    // Check if it's a valid Date object
    if (timestamp instanceof Date && !isNaN(timestamp.getTime())) {
      return timestamp;
    }
    
    return null;
  } catch (error) {
    console.error('Error converting timestamp to Date:', error);
    return null;
  }
}
