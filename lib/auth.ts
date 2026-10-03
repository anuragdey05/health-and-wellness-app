import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const googleClientId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;
const googleConfigured = Boolean(googleClientId && googleClientSecret);

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: googleConfigured
    ? [
        GoogleProvider({
          clientId: googleClientId!,
          clientSecret: googleClientSecret!,
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
