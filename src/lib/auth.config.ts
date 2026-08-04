import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore - role is custom field
        session.user.role = token.role;
        // @ts-ignore - id is custom field
        session.user.id = token.id;
      }
      return session;
    },
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
  providers: [],
} satisfies NextAuthConfig;