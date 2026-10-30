import crypto from 'crypto';

/**
 * Server-only helper to fetch registered user count and user records
 * from Google Identity Toolkit REST API using Service Account JWT.
 * 
 * Works 100% natively in Node.js and Serverless without CommonJS/ESM conflicts.
 */

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

async function getGoogleServiceAccountToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // Return cached token if valid for at least 5 more minutes
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 300) {
    return cachedAccessToken.token;
  }

  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error('Missing FIREBASE_ADMIN_CLIENT_EMAIL or FIREBASE_ADMIN_PRIVATE_KEY');
  }

  // Handle both literal newlines and escaped '\n'
  privateKey = privateKey.replace(/\\n/g, '\n');

  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/firebase',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const base64Url = (obj: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const unsignedToken = `${base64Url(header)}.${base64Url(claimSet)}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsignedToken);
  const signature = sign.sign(privateKey, 'base64url');
  const assertion = `${unsignedToken}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Google OAuth2 token error: ${JSON.stringify(data)}`);
  }

  cachedAccessToken = {
    token: data.access_token,
    expiresAt: now + (data.expires_in || 3600),
  };

  return data.access_token;
}

export interface FirebaseUserSummary {
  uid: string;
  email?: string;
  displayName?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export async function getFirebaseUsers(maxResults = 1000): Promise<{
  totalCount: number;
  users: FirebaseUserSummary[];
}> {
  try {
    const token = await getGoogleServiceAccountToken();
    const projectId =
      process.env.FIREBASE_ADMIN_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!projectId) {
      throw new Error('Missing FIREBASE_ADMIN_PROJECT_ID');
    }

    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:batchGet?maxResults=${maxResults}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }
    );

    const data = await res.json();
    if (!res.ok) {
      console.error('Identity Toolkit batchGet error:', data);
      return { totalCount: 0, users: [] };
    }

    const rawUsers: any[] = data.users || [];
    const users: FirebaseUserSummary[] = rawUsers.map((u) => ({
      uid: u.localId,
      email: u.email,
      displayName: u.displayName,
      createdAt: u.createdAt ? new Date(Number(u.createdAt)).toISOString() : undefined,
      lastLoginAt: u.lastLoginAt ? new Date(Number(u.lastLoginAt)).toISOString() : undefined,
    }));

    return {
      totalCount: users.length,
      users,
    };
  } catch (err) {
    console.error('Failed to get Firebase users:', err);
    return { totalCount: 0, users: [] };
  }
}
