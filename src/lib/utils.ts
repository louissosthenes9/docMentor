import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import fetch from 'node-fetch';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export async function fetchWithRetry(url: string, retries: number = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
}