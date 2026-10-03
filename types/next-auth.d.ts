import "next-auth";

declare module "next-auth" {
  interface Session {
    googleAccessToken?: string;
    googleAccessTokenExpiresAt?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    googleAccessToken?: string;
    googleAccessTokenExpiresAt?: number;
  }
}
