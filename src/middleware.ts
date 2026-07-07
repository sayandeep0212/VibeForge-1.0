import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  // NOTE: CSP removed temporarily — it was blocking Firebase Auth, Google APIs,
  // and other critical third-party scripts, causing the app to hang on loading.
  // TODO: Re-add a properly tested CSP before production deployment.

  return response;
}

export const config = {
  // Only run middleware on actual page routes (not static files, images, API, etc.)
  // This drastically reduces edge invocations.
  matcher: [
    /*
     * Match all paths except:
     * - api/ (API routes — handled by serverless functions)
     * - _next/static/ (static files)
     * - _next/image/ (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Public asset directories (images, fonts, media, backgrounds, Logos, Merch, etc.)
     * - Any file with a common static extension
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|home-frames|backgrounds|fonts|media|Logos|Merch|images|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|mp3|mp4|woff|woff2|ttf|eot)).*)',
  ],
};
