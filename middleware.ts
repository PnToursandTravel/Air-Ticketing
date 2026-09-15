import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Handle route aliases requested in requirements
  if (pathname === "/agency-login") {
    return NextResponse.redirect(new URL("/agent/login", request.url));
  }
  if (pathname === "/staff-login") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // 2. CSRF / Origin validation for mutating API routes
  if (pathname.startsWith("/api/v1/")) {
    const method = request.method.toUpperCase();
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      const origin = request.headers.get("origin");
      const host = request.headers.get("host");

      // In production, enforce origin matches host
      if (process.env.NODE_ENV === "production" && origin && host) {
        try {
          const originHost = new URL(origin).host;
          if (originHost !== host) {
            return NextResponse.json(
              { error: { code: "CSRF_ERROR", message: "Cross-site request forgery protection triggered." } },
              { status: 403 }
            );
          }
        } catch {
          return NextResponse.json(
            { error: { code: "BAD_ORIGIN", message: "Malformed origin header." } },
            { status: 400 }
          );
        }
      }
    }
  }

  // 3. Prepare response with enterprise security headers
  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
