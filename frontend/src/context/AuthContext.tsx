"use client";

import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user ?? null,
    loading: status === "loading",
    signInWithGoogle: () => signIn("google"),
    signOut: () => signOut(),
  };
}
