
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = process.env.NEWS_API_KEY;
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const q = searchParams.get('q');


  if (!apiKey) {
    return NextResponse.json({ error: 'News API key is not configured.' }, { status: 500 });
  }

  let url: string;

  if (category && category !== 'top') {
     url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${apiKey}`;
  } else if (q) {
      url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&sortBy=publishedAt&apiKey=${apiKey}`;
  } 
  else {
      url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;
  }


  try {
    const response = await fetch(url);

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
