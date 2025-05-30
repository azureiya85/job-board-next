import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      isEmailVerified: boolean;
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    role: UserRole;
    isEmailVerified: boolean;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    uid: string;
    role: UserRole;
    isEmailVerified: boolean;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          // Dynamically import the Node.js-specific logic
          const { authHelpers } = await import('@/lib/authHelpers'); 
          const userFromHelper = await authHelpers.verifyCredentials(email, password);

          if (userFromHelper) {
            return {
              id: userFromHelper.id,
              email: userFromHelper.email!,
              name: userFromHelper.name,
              image: userFromHelper.avatar, 
              role: userFromHelper.role as UserRole, 
              isEmailVerified: userFromHelper.isVerified,
            };
          }
        } catch (e) {
          console.error("Error in authorize (dynamic import or verifyCredentials):", e);
          return null; 
        }
        
        return null; // If userFromHelper is null (invalid credentials)
      },
    }),
  ],
  session: {
    strategy: "jwt", 
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.uid = user.id;
        token.role = user.role;
        token.isEmailVerified = user.isEmailVerified;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.uid;
        session.user.role = token.role;
        session.user.isEmailVerified = token.isEmailVerified;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
});