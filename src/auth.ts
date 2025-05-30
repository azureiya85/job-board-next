import NextAuth, { DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs" 
import { UserRole } from "@prisma/client" 

// Extend the NextAuth Session & User types
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
    // Add other fields from User model 
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
  adapter: PrismaAdapter(prisma),
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

        const user = await prisma.user.findUnique({
          where: { email: email },
        });

        if (!user) {
          // User not found
          return null;
        }

        // If user signed up with OAuth, password might be null
        if (!user.password) {
            return null; 
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          // Invalid password
          return null;
        }
        return {
          id: user.id,
          email: user.email!, 
          name: user.name,
          image: user.profileImage,
          role: user.role, 
          isEmailVerified: user.isEmailVerified,
        };
      },
    }),
    // Add  OAuth providers here
    // Example:
    // Google({
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // }),
  ],
 callbacks: {
   jwt: async ({ token, user /*, _account, _profile */ }) => { 
      // `user` here is of the augmented `User` type
      if (user) {
        token.uid = user.id;
        token.role = user.role; // user.role is PrismaUserRole
        token.isEmailVerified = user.isEmailVerified;
      }
      return token; // token now matches augmented JWT type
    },
    session: async ({ session, token }) => {
      // `token` here is of the augmented `JWT` type
      if (token && session.user) {
        session.user.id = token.uid; // Matches Session.user.id
        session.user.role = token.role; // Matches Session.user.role (PrismaUserRole)
        session.user.isEmailVerified = token.isEmailVerified; // Matches Session.user.isEmailVerified
      }
      return session; // session now matches augmented Session type
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/auth/login', 
    // error: '/auth/error', // Custom error page
  },
  // Debugging can be helpful during development
  // debug: process.env.NODE_ENV === "development",
});