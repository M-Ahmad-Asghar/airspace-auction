
'use server';

export interface YoutubeVideoDetails {
  title: string;
  thumbnailUrl: string;
  author: string;
}

export async function getYoutubeVideoDetails(videoId: string): Promise<YoutubeVideoDetails | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey || apiKey === 'your-youtube-api-key-here') {
    console.warn('YOUTUBE_API_KEY is not set. Using mock data for YouTube details.');
    // Using a real video thumbnail for a more realistic preview.
    if (videoId) {
      return {
        title: 'Majestic Boeing 747 Landing in Stormy Weather',
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        author: 'Aviation Channel',
      };
    }
    return null;
  }
  
  const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`;

  try {
    const response = await fetch(url, { cache: 'force-cache' });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Failed to fetch YouTube video details. Status: ${response.status}. Body: ${errorBody}`);
      return null;
    }

    const data = await response.json();
    const item = data.items?.[0];

    if (item) {
      return {
        title: item.snippet.title,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
        author: item.snippet.channelTitle,
      };
    }
    
    console.warn(`No video found for ID: ${videoId}`);
    return null;
  } catch (error) {
    console.error("Error fetching YouTube details from API", error);
    return null;
  }
}

