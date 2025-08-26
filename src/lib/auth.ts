import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import { dbConnect } from "@/lib/mongodb";
import User, { IUser } from "@/models/User";
import bcrypt from "bcryptjs";

export type SessionUser = {
  id: string;
  username: string;
  email: string;
  role: "admin" | "teacher" | "student";
  isActive: boolean;
  permissions?: { module: string; canView: boolean; canEdit: boolean; canDelete: boolean }[];
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 hours
  },
  pages: {
    signIn: "/login",
    error: "/login", // surface errors on login
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { identifier, password } = credentials as Record<string, string>;
        await dbConnect();
        const user = (await User.findOne({
          $or: [{ email: identifier?.toLowerCase() }, { username: identifier }],
        })
          .select("username email password role isActive permissions")
          .lean()) as unknown as IUser | null;
        if (!user || !user.isActive) {
          throw new Error("Invalid credentials or inactive account");
        }
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) throw new Error("Invalid credentials");
        return {
          id: (user as any)._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          permissions: user.permissions || [],
        } as unknown as NextAuthUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as SessionUser;
        token.user = {
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role,
          isActive: u.isActive,
          permissions: u.permissions || [],
        } as SessionUser;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.user) {
        (session as any).user = token.user as SessionUser;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Keep relative/absolute same-origin redirects
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  jwt: {
    // NEXTAUTH_SECRET must be set in env
  },
};
