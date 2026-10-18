// Neon URLs carry sslmode=require, which pg currently treats as verify-full but will weaken in pg v9 (and warns
// about on every connect). Pin verify-full explicitly; Neon's certificates are publicly trusted.
export function withVerifiedSsl(connectionString: string) {
  const url = new URL(connectionString);
  url.searchParams.set('sslmode', 'verify-full');
  return url.toString();
}
