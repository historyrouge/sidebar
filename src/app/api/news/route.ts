
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'News API key is not configured.' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=in&category=technology&apiKey=${apiKey}`
    );

    if (!response.ok) {
        const errorData = await response.json();
        console.error("NewsAPI Error:", errorData);
        const errorMessage = errorData?.message || 'Failed to fetch news from NewsAPI';
        return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Internal Server Error:", err);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
