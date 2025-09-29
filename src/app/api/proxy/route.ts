
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
                'Accept': request.headers.get('accept') || 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': request.headers.get('accept-language') || 'en-US,en;q=0.9',
            },
        });

        const contentType = response.headers.get('Content-Type') || '';
        
        let body;
        
        if (contentType.includes('text/html')) {
            let html = await response.text();
            const baseTag = `<base href="${new URL(url).origin}" />`;
            if (html.includes('<head>')) {
                html = html.replace('<head>', `<head>${baseTag}`);
            } else {
                 html = baseTag + html;
            }
            body = html;
        } else {
            // For non-HTML content, use the raw buffer
            body = await response.arrayBuffer();
        }
        
        const headers = new Headers();
        headers.set('Content-Type', contentType);
        headers.set('Access-Control-Allow-Origin', '*'); // Allow all origins

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
