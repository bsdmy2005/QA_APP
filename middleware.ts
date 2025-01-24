import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",           // Protect all admin routes    
]);

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",                          // Homepage
  "/api/webhooks/clerk(.*)",    // Clerk webhooks
  "/api/public/(.*)",           // Any public APIs
  "/app/data/templates/(.*)",   // Templates directory
  "/api/inboundemail(.*)",      // Add this line for Postmark webhook
  "/api/test(.*)",
  "/dashboard/documents(.*)",   // Add this line for testing
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();
  
  console.log(`Middleware: Processing request for ${req.url}`);
  console.log(`Middleware: User ID: ${userId || 'Not authenticated'}`);

  // Allow public routes
  if (isPublicRoute(req)) {
    console.log('Middleware: Public route detected, allowing access');
    return NextResponse.next();
  }

  // Redirect to sign-in if accessing protected route while not authenticated
  if (!userId && isProtectedRoute(req)) {
    console.log('Middleware: Protected route detected, user not authenticated. Redirecting to sign-in');
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Allow authenticated users to access protected routes
  if (userId && isProtectedRoute(req)) {
    console.log('Middleware: Protected route detected, user authenticated. Allowing access');
    return NextResponse.next();
  }

  // Allow access by default for unmatched routes
  console.log('Middleware: Route not matched by any condition. Allowing access by default');
  return NextResponse.next();
});

// Update the matcher to include all routes we want to protect
export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",    // Match all paths except static files
    "/",                         // Match root
    "/(api|trpc)(.*)",          // Match API routes
  ]
}; 