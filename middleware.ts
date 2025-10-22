export { default } from 'next-auth/middleware';

export const config = {
  // Only protect dashboard and admin routes
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
