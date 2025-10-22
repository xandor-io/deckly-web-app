import 'next-auth';
import { UserRole } from '@/models/User';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name?: string;
    role: UserRole;
    djId?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role: string;
      djId?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    role: string;
    djId?: string;
  }
}
