import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const url =
      `https://en.wikipedia.org/w/api.php` +
      `?action=query` +
      `&format=json` +
      `&origin=*` +
      `&prop=extracts|pageimages|info` +
      `&exintro=true` +
      `&explaintext=true` +
      `&titles=${encodeURIComponent(query)}` +
      `&pithumbsize=500` +
      `&inprop=url`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'JharkhandTourism/1.0',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Wikipedia API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data?.query?.pages) {
      return NextResponse.json(
        { error: 'Invalid response from Wikipedia' },
        { status: 502 }
      );
    }

    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];

    if (!pageId || pageId === '-1') {
      return NextResponse.json(
        { error: `No Wikipedia page found for "${query}"` },
        { status: 404 }
      );
    }

    const page = pages[pageId];

    return NextResponse.json({
      extract: page.extract || '',
      thumbnail: page.thumbnail?.source || null,
      fullurl: page.fullurl || null,
    });

  } catch (error) {
    console.error('Wikipedia API Error:', error);

    return NextResponse.json(
      {
        error: 'Wikipedia service is currently unavailable',
      },
      { status: 503 }
    );
  }
}