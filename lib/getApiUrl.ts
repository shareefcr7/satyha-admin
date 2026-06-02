/**
 * Get the API URL based on environment
 * - Localhost: uses local backend
 * - Production: uses HTTPS backend from environment variable
 */
export function getApiUrl(): string {
  // Always use environment variable if available
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Check if we're in browser and on localhost
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5002/api';
  }
  
  // Fallback to production backend
  return 'https://clear-glass-backend.vercel.app/api';
}
