
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

        let body = await response.text();
        const contentType = response.headers.get('Content-Type') || '';
        
        // If it's an HTML page, inject the base tag
        if (contentType.includes('text/html')) {
            const baseTag = `<base href="${new URL(url).origin}" />`;
            if (body.includes('<head>')) {
                body = body.replace('<head>', `<head>${baseTag}`);
            } else {
                 body = baseTag + body;
            }
        }
        
        // Remove X-Frame-Options header
        const headers = new Headers(response.headers);
        headers.delete('x-frame-options');
        headers.delete('content-security-policy');
        headers.set('content-type', contentType);

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
