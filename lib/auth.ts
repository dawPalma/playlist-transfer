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
      // On initial sign-in or when a new account is linked
      if (account && user) {
        // Create a new token object by spreading the existing token
        // and then adding/updating the provider-specific data
        const newToken = { ...token };

        if (account.provider === "spotify") {
          newToken.spotify = {
            access_token: account.access_token!,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            id: user.id,
          };
        } else if (account.provider === "google") {
          newToken.google = {
            access_token: account.access_token!,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            id: user.id,
          };
        }
        return newToken; // Return the new token object
      }
      return token; // If no account, return the existing token
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
