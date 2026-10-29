/**
 * Firebase Token Verification for Server Routes
 *
 * Uses the Google Identity Toolkit REST API to verify Firebase ID tokens.
 * This runs natively in any Node.js, Edge, or Serverless runtime (Vercel/AWS Lambda)
 * without requiring heavy SDKs or encountering CommonJS/ESM bundler incompatibilities.
 */

export interface DecodedUserToken {
  uid: string;
  email?: string;
  emailVerified?: boolean;
}

export async function verifyIdToken(token: string): Promise<DecodedUserToken> {
  const apiKey =
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    process.env.FIREBASE_API_KEY;

  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY is not configured on server');
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken: token }),
    }
  );

  const data = await response.json();

  if (!response.ok || data.error || !data.users || data.users.length === 0) {
    const errorMsg = data.error?.message || 'Invalid or expired Firebase ID token';
    throw new Error(errorMsg);
  }

  const user = data.users[0];
  return {
    uid: user.localId as string,
    email: user.email as string | undefined,
    emailVerified: Boolean(user.emailVerified),
  };
}
