/**
 * Get the API URL based on environment
 * - Localhost: uses local backend
 * - Production: uses HTTPS backend
 */
export function getApiUrl(): string {
  // Check if we're in browser and on localhost
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5002/api';
  }
  
  // Use environment variable if available, otherwise use production backend
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';
}
