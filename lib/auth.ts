import { AuthOptions, Session } from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"
import GoogleProvider from "next-auth/providers/google"
import { JWT } from "next-auth/jwt"

// Extend the JWT type to include provider tokens
declare module "next-auth/jwt" {
  interface JWT {
    providerTokens?: {
      [key: string]: {
        access_token: string;
        refresh_token?: string;
        expires_at?: number;
        id?: string;
      };
    };
  }
}

// Extend the Session type to include providerTokens
declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      providerTokens?: {
        [key: string]: {
          access_token: string;
          refresh_token?: string;
          expires_at?: number;
          id?: string;
        };
      };
    };
  }
}

export const authOptions: AuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "playlist-read-private playlist-read-collaborative",
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/youtube.force-ssl",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Ensure providerTokens is an object
      token.providerTokens = token.providerTokens || {};

      // On initial sign-in or when a new account is linked
      if (account && user) {
        // Merge existing providerTokens with the new account's tokens
        token.providerTokens = {
          ...(token.providerTokens as object), // Explicitly spread existing tokens
          [account.provider]: { // Add or update the current provider's token
            access_token: account.access_token!,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            id: user.id,
          },
        };
      }
      return token;
    },
    async session({ session, token }) {
      // Expose the providerTokens to the session
      session.user = {
        ...session.user,
        providerTokens: token.providerTokens,
      };
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};
