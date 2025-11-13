import { AuthOptions, Session } from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"
import GoogleProvider from "next-auth/providers/google"
import { JWT } from "next-auth/jwt"

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
      if (account && user) {
        // Store provider tokens directly on the token object
        if (account.provider === "spotify") {
          token.spotify = {
            access_token: account.access_token!,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
          };
        } else if (account.provider === "google") {
          token.google = {
            access_token: account.access_token!,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
          };
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Expose provider tokens to the session
      session.user.spotify = token.spotify;
      session.user.google = token.google;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};
