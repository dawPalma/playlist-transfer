"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const isSpotifyConnected = session?.user?.providerTokens?.spotify;
  const isGoogleConnected = session?.user?.providerTokens?.google;

  const handleTransfer = async () => {
    setIsLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playlistUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "An unknown error occurred.");
      }

      setResultUrl(data.youtubePlaylistUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Playlist TransferJ</h1>
        <p className="text-xl text-gray-400">
          Transfer your Spotify playlists to YouTube seamlessly.
        </p>
      </div>

      <div className="w-full max-w-lg">
        <div className="bg-gray-800 p-8 rounded-lg shadow-2xl space-y-8">
          
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-center">1. Connect Your Accounts</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-700 p-4 rounded-md">
                <span className="font-semibold text-lg">Spotify</span>
                {isSpotifyConnected ? (
                  <button onClick={() => signOut()} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300">Disconnect</button>
                ) : (
                  <button onClick={() => signIn("spotify")} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300">Connect</button>
                )}
              </div>
              
              <div className="flex justify-between items-center bg-gray-700 p-4 rounded-md">
                <span className="font-semibold text-lg">YouTube</span>
                {isGoogleConnected ? (
                  <button onClick={() => signOut()} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300">Disconnect</button>
                ) : (
                  <button onClick={() => signIn("google")} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300">Connect</button>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-center">2. Enter Playlist URL</h2>
            <input
              type="text"
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://open.spotify.com/playlist/..."
              disabled={!isSpotifyConnected || !isGoogleConnected}
            />
          </div>

          <button 
            onClick={handleTransfer}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={!isSpotifyConnected || !isGoogleConnected || !playlistUrl || isLoading}
          >
            {isLoading ? 'Transferring...' : 'Transfer Playlist'}
          </button>

          {/* Results Section */}
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md text-center">
              <strong>Error:</strong> {error}
            </div>
          )}
          {resultUrl && (
            <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded-md text-center">
              <strong>Success!</strong>
              <a href={resultUrl} target="_blank" rel="noopener noreferrer" className="block underline mt-2 hover:text-white">
                View your new YouTube Playlist
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
