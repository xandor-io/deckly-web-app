'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import OTPInput from '@/components/auth/OTPInput';
import LoadingScreen from '@/components/LoadingScreen';
import DecklyLogo from '@/components/DecklyLogo';
import { ShaderBackground } from '@/components/ShaderBackground';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session) {
      setRedirecting(true);
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Show loading screen only when redirecting to dashboard (not during initial load)
  if (redirecting) {
    return <LoadingScreen />;
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Call server-side API to request OTP (never expose Auth0 credentials to client)
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send OTP');
      }

      setShowOTP(true);
    } catch {
      setError('Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (code: string) => {
    setError(null);
    setLoading(true);

    try {
      // Use NextAuth to sign in with OTP
      const result = await signIn('email-otp', {
        email,
        otp: code,
        redirect: false,
      });

      if (result?.ok && !result?.error) {
        // Successfully signed in - show loading screen while redirecting
        setRedirecting(true);
        setLoading(false);
        router.push('/dashboard');
      } else {
        setError('Invalid code. Please try again.');
        setOtp('');
        setLoading(false);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Verification failed. Please try again.');
      setOtp('');
      setLoading(false);
    }
  };

  const handleOTPChange = (value: string) => {
    setOtp(value);
    if (value.length === 6) {
      handleOTPSubmit(value);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend OTP');
      }
    } catch {
      setError('Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <ShaderBackground />
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl shadow-2xl p-8">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <DecklyLogo className="h-10" />
            </div>
            <p className="text-muted-foreground">
              {showOTP ? 'Enter verification code' : 'Sign in to your account'}
            </p>
          </div>

          {!showOTP ? (
            /* Email Input Form */
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/50 rounded-lg p-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending code...' : 'Continue with Email'}
              </button>
            </form>
          ) : (
            /* OTP Input Form */
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-6">
                  We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>
                </p>
              </div>

              <OTPInput
                value={otp}
                onChange={handleOTPChange}
                error={error}
                disabled={loading}
              />

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/50 rounded-lg p-3 text-center">
                  {error}
                </div>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-sm text-accent hover:text-accent/80 font-medium disabled:opacity-50"
                >
                  Resend code
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowOTP(false);
                  setOtp('');
                  setError(null);
                }}
                className="w-full text-muted-foreground hover:text-foreground font-medium py-2 transition duration-200"
              >
                ← Back to email
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-sm mt-6">
          Secure passwordless authentication powered by Auth0
        </p>
      </div>
    </div>
  );
}
