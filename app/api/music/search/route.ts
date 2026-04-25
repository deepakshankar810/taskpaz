import { NextResponse } from 'next/server';
import YouTube from 'youtube-sr';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    const video = await YouTube.searchOne(query);

    if (!video) {
      return NextResponse.json({ error: 'No results found' }, { status: 404 });
    }

    return NextResponse.json({
      id: video.id,
      name: video.title,
      author: video.channel?.name || 'Unknown Artist',
      thumbnail: video.thumbnail?.url || `https://img.youtube.com/vi/${video.id}/0.jpg`,
    });
  } catch (error) {
    console.error('YouTube Search Error:', error);
    return NextResponse.json({ error: 'Failed to search YouTube' }, { status: 500 });
  }
}
