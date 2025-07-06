
'use server';

export interface YoutubeVideoDetails {
  title: string;
  thumbnailUrl: string;
  author: string;
}

export async function getYoutubeVideoDetails(videoId: string): Promise<YoutubeVideoDetails | null> {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

  try {
    // We use no-cache to ensure we always get the latest details,
    // as a user might update their video title/thumbnail.
    const response = await fetch(url, { cache: 'no-cache' });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Failed to fetch YouTube video details. Status: ${response.status}. Body: ${errorBody}`);
      return null;
    }

    const data = await response.json();

    if (data && data.title && data.author_name && data.thumbnail_url) {
      return {
        title: data.title,
        author: data.author_name,
        thumbnailUrl: data.thumbnail_url,
      };
    }
    
    console.warn(`No video found or incomplete data for ID: ${videoId}`);
    return null;
  } catch (error) {
    console.error("Error fetching YouTube details from oEmbed API", error);
    return null;
  }
}
