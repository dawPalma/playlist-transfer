import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// Helper to extract playlist ID from various Spotify URL formats
function getSpotifyPlaylistId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const playlistIdIndex = pathParts.indexOf('playlist');
    if (playlistIdIndex !== -1 && pathParts.length > playlistIdIndex + 1) {
      return pathParts[playlistIdIndex + 1];
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.spotify?.access_token || !session.user?.google?.access_token) {
    return new NextResponse("Unauthorized: Missing API tokens.", { status: 401 });
  }

  const { playlistUrl } = await req.json();

  if (!playlistUrl) {
    return new NextResponse("Playlist URL is required.", { status: 400 });
  }

  const spotifyPlaylistId = getSpotifyPlaylistId(playlistUrl);

  if (!spotifyPlaylistId) {
    return new NextResponse("Invalid Spotify Playlist URL.", { status: 400 });
  }

  const spotifyToken = session.user.spotify.access_token;
  const googleToken = session.user.google.access_token;

  try {
    // 1. Fetch playlist name and tracks from Spotify
    const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${spotifyPlaylistId}`, {
      headers: { Authorization: `Bearer ${spotifyToken}` },
    });
    if (!playlistResponse.ok) throw new Error(`Failed to fetch Spotify playlist: ${await playlistResponse.text()}`);
    const spotifyPlaylist = await playlistResponse.json();
    const playlistName = spotifyPlaylist.name;
    const spotifyTracks = spotifyPlaylist.tracks.items.map((item: any) => ({
      name: item.track.name,
      artist: item.track.artists[0].name,
    }));

    // 2. Create a new playlist on YouTube
    const createPlaylistResponse = await fetch("https://www.googleapis.com/youtube/v3/playlists?part=snippet,status", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${googleToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        snippet: {
          title: `${playlistName} (from Spotify)`,
          description: `Playlist created from Spotify playlist: ${playlistUrl}`,
        },
        status: { privacyStatus: "private" },
      }),
    });
    if (!createPlaylistResponse.ok) throw new Error(`Failed to create YouTube playlist: ${await createPlaylistResponse.text()}`);
    const youtubePlaylist = await createPlaylistResponse.json();
    const youtubePlaylistId = youtubePlaylist.id;

    // 3. For each Spotify track, search on YouTube and add to the new playlist
    for (const track of spotifyTracks) {
      const searchQuery = `${track.name} ${track.artist}`;
      const searchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=1`, {
        headers: { Authorization: `Bearer ${googleToken}` },
      });
      if (!searchResponse.ok) continue; // Skip if search fails
      const searchResults = await searchResponse.json();
      const videoId = searchResults.items[0]?.id?.videoId;

      if (videoId) {
        await fetch("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${googleToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            snippet: {
              playlistId: youtubePlaylistId,
              resourceId: {
                kind: "youtube#video",
                videoId: videoId,
              },
            },
          }),
        });
      }
    }

    const newYoutubePlaylistUrl = `https://www.youtube.com/playlist?list=${youtubePlaylistId}`;
    return NextResponse.json({
      message: "Transfer complete!",
      youtubePlaylistUrl: newYoutubePlaylistUrl,
    });

  } catch (error: any) {
    return new NextResponse(error.message || "An internal error occurred.", { status: 500 });
  }
}
