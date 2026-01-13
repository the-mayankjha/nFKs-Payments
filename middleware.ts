import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const allowedOrigins = [
    'https://ayscroll.com',
    'http://localhost:8081',
    'http://localhost:5173',
    'http://localhost:3000', // Allow self for testing
];

export function middleware(request: NextRequest) {
    const origin = request.headers.get('origin');

    // Handle Simple Requests & Preflight
    if (origin && allowedOrigins.includes(origin)) {
        // If it's an OPTIONS request, handle it directly
        if (request.method === 'OPTIONS') {
            const response = new NextResponse(null, { status: 200 });
            response.headers.set('Access-Control-Allow-Origin', origin);
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            response.headers.set('Access-Control-Allow-Credentials', 'true');
            return response;
        }

        // For other requests, pass through but add CORS headers
        const response = NextResponse.next();
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
