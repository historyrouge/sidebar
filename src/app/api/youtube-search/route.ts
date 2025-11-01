
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'YouTube API key is not configured.' }, { status: 500 });
  }

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${apiKey}&maxResults=1`;

  try {
    const response = await fetch(searchUrl);
    if (!response.ok) {
        const errorData = await response.json();
        console.error('YouTube API Error:', errorData);
        return NextResponse.json({ error: errorData.error.message || 'Failed to search YouTube' }, { status: response.status });
    }
    
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      return NextResponse.json({
        id: video.id.videoId,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.high.url,
      });
    } else {
      return NextResponse.json({});
    }
  } catch (error) {
    console.error('YouTube search error:', error);
    return NextResponse.json({ error: 'Failed to search YouTube' }, { status: 500 });
  }
}
