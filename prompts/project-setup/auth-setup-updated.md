# Authentication Setup Guide

```

Use this guide to setup the auth for this project. i work on windows make sure to use powershell commands.

It uses Clerk for authentication.

Write the complete code for every step. Do not get lazy. Write everything that is needed.

Your goal is to completely finish the auth setup.

- Route protection with middleware
- Required library installation
- Environment variable setup
- Example protected and public routes
- Type definitions
- Root layout configuration and header setup
- Example protected route that checks if user is admin
- Example public route accessible to all users
- Example dashboard route accessible to all authenticated users


The setup uses Clerk for authentication, Drizzle ORM for database operations, and includes role-based access control capabilities.



## Environment Variables

Add to `.env.local`:

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

## Clerk Setup

If the user gets stuck, refer them to the following links:

- [Clerk](https://clerk.com/)
- [Clerk Docs](https://clerk.com/docs)


```bash
npm i @clerk/nextjs @clerk/themes @clerk/backend
```


## Middleware Protection

Create middleware.ts:

```typescript
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
            // Match user-progress routes
  ]
};


```

## Header Setup

Create header component:

```typescript:components/header.tsx
typescript:components/header.tsx
"use client";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, useUser, UserButton } from "@clerk/nextjs";
import { HeartIcon, CalendarIcon, UsersIcon, MessageSquareIcon, Menu, X, HomeIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
export default function Header({ isAdmin }: { isAdmin: boolean }) {
const [isMenuOpen, setIsMenuOpen] = useState(false);
const { user, isSignedIn } = useUser();
const navigation = [
{ name: 'Home', href: '/', icon: HomeIcon },
{ name: 'Dashboard', href: '/dashboard', icon: MessageSquareIcon },
];
// Add admin navigation if user is admin
const fullNavigation = isSignedIn && isAdmin
? [...navigation, { name: 'Admin', href: '/admin', icon: UsersIcon }]
: navigation;
return (
<header className="bg-white/80 backdrop-blur-md border-b fixed w-full z-50">
<nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
<div className="flex h-16 items-center justify-between">
{/ Logo /}
<div className="flex items-center">
<Link href="/" className="flex items-center space-x-2">
<HeartIcon className="h-6 w-6 text-primary" />
<span className="text-xl font-semibold">Your App</span>
</Link>
</div>
{/ Desktop Navigation /}
<div className="hidden md:flex items-center space-x-8">
{fullNavigation.map((item) => (
<Link
key={item.name}
href={item.href}
className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors"
>
<item.icon className="h-4 w-4" />
<span>{item.name}</span>
</Link>
))}
</div>
{/ Auth Buttons /}
<div className="flex items-center space-x-4">
<SignedOut>
<SignInButton mode="modal">
<Button variant="outline">
Sign In
</Button>
</SignInButton>
</SignedOut>
<SignedIn>
<UserButton
afterSignOutUrl="/"
appearance={{
elements: {
avatarBox: "w-8 h-8"
}
}}
/>
</SignedIn>
{/ Mobile Menu Button /}
<div className="md:hidden">
<Button
variant="ghost"
size="icon"
onClick={() => setIsMenuOpen(!isMenuOpen)}
>
{isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
</Button>
</div>
</div>
</div>
{/ Mobile Navigation /}
{isMenuOpen && (
<div className="md:hidden py-4">
{fullNavigation.map((item) => (
<Link
key={item.name}
href={item.href}
className="flex items-center space-x-2 px-4 py-3 text-gray-600 hover:bg-primary/10"
onClick={() => setIsMenuOpen(false)}
>
<item.icon className="h-5 w-5" />
<span>{item.name}</span>
</Link>
))}
</div>
)}
</nav>
</header>
);
}
``` 

## Root Layout Setup

Update your root layout to handle auth and manage profile creation and header:

```typescript:app/layout.tsx
typescript:app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Header from "@/components/header";
import { createProfile, getProfileByUserIdAction, isAdmin } from "@/actions/profiles-actions";
const inter = Inter({ subsets: ["latin"] });
export default async function RootLayout({
children,
}: {
children: React.ReactNode;
}) {
const { userId } = await auth();
let userIsAdmin = false;
if (userId) {
const res = await getProfileByUserIdAction(userId);
if (!res.data) {
await createProfile({ userId });
} else {
userIsAdmin = await isAdmin(userId);
}
}
return (
<ClerkProvider>
<html lang="en">
<body className={inter.className}>
<Header isAdmin={userIsAdmin} />
<div className="pt-16">
{children}
</div>
</body>
</html>
</ClerkProvider>
);
}
```

## create Example Protected Route that redirects to sign-in if not authenticated

``` typescript:app/dashboard/page.tsx
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
export default async function DashboardPage() {
const { userId } = await auth();
if (!userId) {
redirect("/sign-in");
}
return (
<div>
<h1>Protected Dashboard Page</h1>
</div>
);
}
```

## create Example Protected Route that checks if user is admin

```typescript:app/admin/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdmin } from "@/actions/profiles-actions";

export default async function AdminPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  const userIsAdmin = await isAdmin(userId);
  if (!userIsAdmin) {
    redirect("/dashboard");
  }
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>This page is only visible to admin users.</p>
      <div className="grid gap-4 mt-4">
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold">User Management</h2>
          <p>Admin tools would go here...</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold">System Settings</h2>
          <p>Settings panel would go here...</p>
        </div>
      </div>
    </div>
  );
} 

```

## create Example Public Route

```typescript:app/page.tsx
export default function HomePage() {
return (
<div>
<h1>Public Home Page</h1>
</div>
);
}
``` 

