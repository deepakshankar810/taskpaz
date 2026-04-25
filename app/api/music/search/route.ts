import { NextResponse } from 'next/server';
import ytSearch from 'yt-search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    const r = await ytSearch(query);
    const video = r.videos[0];

    if (!video) {
      return NextResponse.json({ error: 'No results found' }, { status: 404 });
    }

    return NextResponse.json({
      id: video.videoId,
      name: video.title,
      author: video.author.name,
      thumbnail: video.thumbnail,
    });
  } catch (error) {
    console.error('YouTube Search Error:', error);
    return NextResponse.json({ error: 'Failed to search YouTube' }, { status: 500 });
  }
}
