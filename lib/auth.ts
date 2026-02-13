import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma"; 
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // Pastikan role terambil di sini
        };
      },
    }),
  ],
  callbacks: {
    // 1. SAAT TOKEN DIBUAT (PENTING UNTUK MIDDLEWARE)
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role; // Simpan Role ke Token
      }
      return token;
    },
    // 2. SAAT SESI DIBACA DI CLIENT (PENTING UNTUK UI)
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.id;     // Ambil ID dari Token
        (session.user as any).role = token.role; // Ambil Role dari Token
      }
      return session;
    },
  },
};