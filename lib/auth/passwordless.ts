import axios from 'axios';

/**
 * Request an OTP code to be sent to the user's email
 * SERVER-SIDE ONLY - Never expose Auth0 credentials to client
 */
export async function requestOTP(email: string): Promise<void> {
  const url = `${process.env.AUTH0_ISSUER_BASE_URL}/passwordless/start`;

  try {
    await axios.post(url, {
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      connection: 'email',
      email: email,
      send: 'code',
      authParams: {
        scope: 'openid profile email',
      },
    });
  } catch (error) {
    console.error('Error requesting OTP:', error);
    throw new Error('Failed to send OTP code');
  }
}

/**
 * Verify the OTP code with Auth0 and get an access token
 * Note: This should be called server-side only
 */
export async function verifyOTP(email: string, otp: string): Promise<{ access_token: string; id_token?: string }> {
  // Use server-side env variables (no NEXT_PUBLIC prefix)
  const url = `${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`;

  try {
    const response = await axios.post(url, {
      grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      otp: otp,
      realm: 'email',
      username: email,
      scope: 'openid profile email',
    });

    return response.data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw new Error('Invalid or expired OTP code');
  }
}
