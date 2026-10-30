import { NextRequest } from 'next/server';
import { verifyIdToken, DecodedUserToken } from './firebase/admin';
import { isUserAdmin } from './admin';

/**
 * Server-side helper to verify that an incoming API request
 * is authenticated by an authorized Admin user.
 */
export async function verifyAdminRequest(
  request: NextRequest
): Promise<{ user: DecodedUserToken } | { error: string; status: number }> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Unauthorized: Missing bearer token', status: 401 };
  }

  const token = authHeader.substring(7);

  let decoded: DecodedUserToken;
  try {
    decoded = await verifyIdToken(token);
  } catch {
    return { error: 'Invalid or expired authentication token', status: 401 };
  }

  if (!decoded.email || !isUserAdmin(decoded.email)) {
    return { error: 'Forbidden: Admin access required', status: 403 };
  }

  return { user: decoded };
}
