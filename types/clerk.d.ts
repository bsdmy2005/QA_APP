declare module '@clerk/nextjs' {
  import { ReactNode } from 'react';

  export interface ClerkProviderProps {
    children: ReactNode;
  }

  export const ClerkProvider: React.FC<ClerkProviderProps>;
  export const auth: () => Promise<{ userId: string | null }>;
  export const SignedIn: React.FC<{ children: ReactNode }>;
  export const SignedOut: React.FC<{ children: ReactNode }>;
  export const SignInButton: React.FC<{ children: ReactNode }>;
  export const UserButton: React.FC<{ afterSignOutUrl?: string }>;
  export const useUser: () => { user: any, isSignedIn: boolean };
} 