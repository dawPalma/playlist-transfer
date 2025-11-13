import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./components/Providers";
import CookieConsentBanner from "./components/CookieConsentBanner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Spotify to YouTube Playlist Converter",
  description: "Transfer your Spotify playlists to YouTube",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <CookieConsentBanner />
        </Providers>
      </body>
    </html>
  );
}
