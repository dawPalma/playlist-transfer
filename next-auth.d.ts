import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      spotify?: {
        access_token?: string;
        refresh_token?: string;
        expires_at?: number;
      };
      google?: {
        access_token?: string;
        refresh_token?: string;
        expires_at?: number;
      };
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    spotify?: {
      access_token?: string;
      refresh_token?: string;
      expires_at?: number;
    };
    google?: {
      access_token?: string;
      refresh_token?: string;
      expires_at?: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    spotify?: {
      access_token?: string;
      refresh_token?: string;
      expires_at?: number;
      id?: string;
    };
    google?: {
      access_token?: string;
      refresh_token?: string;
      expires_at?: number;
      id?: string;
    };
  }
}
