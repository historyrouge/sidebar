
import { NextResponse } from 'next/server';
import Youtube from 'youtube-sr';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const video = await Youtube.searchOne(query, 'video', false);
    if (video) {
      return NextResponse.json({
        id: video.id,
        title: video.title,
        thumbnail: video.thumbnail?.url,
      });
    } else {
      return NextResponse.json({});
    }
  } catch (error) {
    console.error('YouTube search error:', error);
    return NextResponse.json({ error: 'Failed to search YouTube' }, { status: 500 });
  }
}
