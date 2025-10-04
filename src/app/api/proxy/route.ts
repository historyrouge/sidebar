
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return new NextResponse('URL parameter is required', { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });
        
        if (!response.ok) {
            return new NextResponse('Failed to fetch the image.', { status: response.status });
        }

        const body = await response.arrayBuffer();
        const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
        
        const headers = new Headers();
        headers.set('Content-Type', contentType);
        headers.set('Access-Control-Allow-Origin', '*');

        return new NextResponse(body, {
            status: response.status,
            statusText: response.statusText,
            headers: headers,
        });

    } catch (error: any) {
        console.error('Proxy error:', error);
        return new NextResponse(error.message || 'Failed to fetch the URL.', { status: 500 });
    }
}
