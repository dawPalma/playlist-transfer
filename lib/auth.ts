import { AuthOptions } from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"
import GoogleProvider from "next-auth/providers/google"

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
    async jwt({ token, account }) {
      // On sign-in, persist the access token from the provider
      if (account) {
        token[account.provider] = {
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          expires_at: account.expires_at,
        };
      }
      return token;
    },
    async session({ session, token }) {
      // The token now contains objects for each provider
      // You can selectively expose what you need to the client
      session.user = token;
      return session;
    },
  },
};
