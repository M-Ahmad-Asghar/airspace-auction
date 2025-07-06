'use server';

export interface YoutubeVideoDetails {
  title: string;
  thumbnailUrl: string;
  author: string;
}

export async function getYoutubeVideoDetails(videoId: string): Promise<YoutubeVideoDetails | null> {
  // In a real application, you would use the YouTube Data API v3
  // to fetch video details using an API key stored in environment variables.
  console.log(`Simulating fetch for videoId: ${videoId}`);
  
  if (videoId) {
    // Returning mock data for demonstration purposes.
    // Using a real video thumbnail for a more realistic preview.
    return {
      title: 'Majestic Boeing 747 Landing in Stormy Weather',
      thumbnailUrl: `https://i.ytimg.com/vi/zK4Yp1Jd2kQ/hqdefault.jpg`,
      author: 'Aviation Channel',
    };
  }
  
  return null;
}
