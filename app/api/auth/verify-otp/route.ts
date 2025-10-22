import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/auth/passwordless';
import { auth0 } from '@/lib/auth0';
import dbConnect from '@/lib/db';
import User, { UserRole } from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    console.log('Verify OTP request:', { email, otp: otp ? '***' : 'missing' });

    if (!email || !otp) {
      console.error('Missing email or OTP');
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Verify OTP with Auth0
    console.log('Calling Auth0 to verify OTP...');
    const tokens = await verifyOTP(email, otp);
    console.log('Auth0 verification successful');

    if (!tokens.access_token) {
      console.error('No access token in response');
      return NextResponse.json(
        { error: 'Invalid OTP code' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find or create user
    let user = await User.findOne({ email }).populate('djId');

    if (!user) {
      console.log('Creating new user for:', email);
      // Create new user
      user = await User.create({
        email,
        auth0Id: `email|${email}`, // Temporary auth0Id for passwordless users
        role: UserRole.DJ,
      });
    }

    console.log('User authenticated successfully:', user.email);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('OTP verification error:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: error.message || 'Invalid or expired code' },
      { status: 401 }
    );
  }
}
