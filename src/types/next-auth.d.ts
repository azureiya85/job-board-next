import { UserRole as PrismaUserRole } from "@prisma/client"; 
import { DefaultSession, User as NextAuthDefaultUser } from "next-auth";
import { JWT as NextAuthDefaultJWT } from "next-auth/jwt";

declare module "next-auth" {

  interface Session {
    user: {
      id: string;
      role: PrismaUserRole; 
      isEmailVerified: boolean;
    } & DefaultSession["user"]; // Extends the default user properties (name, email, image)
  }

  interface User extends NextAuthDefaultUser {
    id: string; // Overriding to ensure it's always string
    role: PrismaUserRole;
    isEmailVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT extends NextAuthDefaultJWT {
    uid: string; 
    role: PrismaUserRole;
    isEmailVerified: boolean;
  }
}