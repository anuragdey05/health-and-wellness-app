import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const googleConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: googleConfigured
    ? [
        GoogleProvider({
          clientId: process.env.AUTH_GOOGLE_ID!,
          clientSecret: process.env.AUTH_GOOGLE_SECRET!,
          authorization: {
            params: {
              scope:
                "openid email profile https://www.googleapis.com/auth/calendar.freebusy",
              prompt: "consent",
            },
          },
        }),
      ]
    : [],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.googleAccessToken = account.access_token;
        token.googleAccessTokenExpiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      session.googleAccessToken = token.googleAccessToken as string | undefined;
      session.googleAccessTokenExpiresAt = token.googleAccessTokenExpiresAt as number | undefined;
      return session;
    },
  },
};

export { googleConfigured };
