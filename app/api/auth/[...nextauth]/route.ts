import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyOTP } from '@/lib/auth/passwordless';
import dbConnect from '@/lib/db';
import User, { UserRole } from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'email-otp',
      name: 'Email OTP',
      credentials: {
        email: { label: 'Email', type: 'email' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) {
          console.error('Missing credentials');
          return null;
        }

        try {
          console.log('Authorizing user:', credentials.email);

          // Verify OTP with Auth0
          const tokens = await verifyOTP(credentials.email, credentials.otp);
          console.log('OTP verified successfully');

          if (!tokens.access_token) {
            console.error('No access token received');
            return null;
          }

          // Connect to database
          await dbConnect();

          // Find or create user
          let user = await User.findOne({ email: credentials.email }).populate('djId');

          if (!user) {
            console.log('Creating new user');
            // Create new user
            user = await User.create({
              email: credentials.email,
              auth0Id: `email|${credentials.email}`,
              role: UserRole.DJ,
            });
          }

          console.log('User authorized successfully:', user.email);

          // Return user object for session
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            djId: user.djId?.toString(),
          };
        } catch (error) {
          console.error('Authorization error:', error instanceof Error ? error.message : 'Unknown error');
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user info to token on sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.djId = user.djId;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user info to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.djId = token.djId as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode to see what's happening
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
