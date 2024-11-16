import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./db";
import { compare } from "bcrypt";
import { Role } from "@prisma/client";

type UserId = String;

// 1. Fixed JWT interface to include all required fields
declare module "next-auth/jwt" {
  interface JWT {
    userId: UserId;
    username: String;
    userType: String;
    userRole: Role;
    store: String;
    exp?: number;
  }
}

// 2. Fixed Session interface and removed incorrect User intersection
declare module "next-auth" {
  interface Session {
    user: {
      userId: UserId;
      username: string;
      email?: string | null;
      userType: string;
      role: Role;
      store: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
    updateAge: 60 * 60,
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "hogrider@gmail.com",
        },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const restrict = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
          select: {
            restricted: true,
          },
        });

        if (restrict?.restricted) {
          return null;
        }

        const existingUser = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!existingUser) {
          return null;
        }
        
        const passwordMatch = await compare(
          credentials.password,
          existingUser.password
        );

        if (!passwordMatch) {
          return null;
        }

        // 3. Return only necessary user data
        return {
          id: existingUser.id.toString(),
          username: existingUser.username,
          email: existingUser.email,
          userType: existingUser.userType,
          role: existingUser.role,
          store: existingUser.store
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // 4. Fixed token logging and assignment
      if (token.email) {
        console.log(token.email.split("@")[0] + " token returned 🟡");
      }

      if (user) {
        // 5. No need to query database again, use the user data we already have
        const extraData = await db.user.findFirst({
          where:{
            id:user.id!!
          }
        })
        console.log("token "+ extraData?.role!! + extraData?.store!!)
        token.userId = user.id;
        token.username = user.username;
        token.userType = user.userType;
        token.userRole = extraData?.role!!;
        token.store = extraData?.store!!;
        token.exp = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour
      }
      return token;
    },

    async session({ session, token }) {
      // 6. Fixed session logging and data assignment
      if (session.user.email) {
        console.log(session.user.email.split("@")[0] + "'s session created 🟢");
      }
      console.log("Store: " + token.store);

      return {
        ...session,
        user: {
          ...session.user,
          userId: token.userId,
          username: token.username,
          userType: token.userType,
          role: token.userRole,
          store: token.store,
        },
      };
    },
  },
};