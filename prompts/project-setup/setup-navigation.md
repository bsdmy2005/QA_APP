i work on windows make sure to use powershell commands.


# Navigation & Auth Setup Guide

This guide provides instructions for setting up navigation, authentication protection, and header components in a Next.js project.

## Prerequisites

- Next.js 14+ project
- Clerk authentication setup
- Shadcn UI components installed
- Tailwind CSS configured

## Core Components Structure

### 1. Header Component
Create a header component at `components/header.tsx`:

 typescript
"use client";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, useUser, SignOutButton } from "@clerk/nextjs";
import { ClipboardCheckIcon, HomeIcon, BarChartIcon, Menu, X, UserIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
export default function Header({ isAdmin }: { isAdmin: boolean }) {
const { user } = useUser();
const [isMenuOpen, setIsMenuOpen] = useState(false);
// NavItem component for consistent navigation links
const NavItem = ({ href, icon: Icon, label, iconOnly = false }) => (
<TooltipProvider>
<Tooltip>
<TooltipTrigger asChild>
<Link
href={href}
className={hover:text-primary flex items-center space-x-2 ${ iconOnly ? 'justify-center w-10 h-10 rounded-full bg-secondary' : '' }}
>
<Icon className={${iconOnly ? 'h-5 w-5' : 'h-6 w-6'}} />
{!iconOnly && <span>{label}</span>}
</Link>
</TooltipTrigger>
{iconOnly && (
<TooltipContent>
<p>{label}</p>
</TooltipContent>
)}
</Tooltip>
</TooltipProvider>
);
return (
<header className="bg-background border-b border-border sticky top-0 z-50">
<div className="container mx-auto px-4 py-2">
{/ Desktop Navigation /}
<div className="flex items-center justify-between">
{/ Logo Section /}
<div className="flex items-center space-x-4">
<Link href="/" className="flex items-center space-x-2">
<ClipboardCheckIcon className="h-8 w-8 text-primary" />
<span className="text-xl font-bold text-foreground hidden sm:inline">AppName</span>
</Link>
<Badge variant="secondary" className="hidden sm:inline-flex">Beta</Badge>
</div>
{/ Main Navigation /}
<nav className="hidden md:flex items-center space-x-4">
<NavItem href="/" icon={HomeIcon} label="Home" />
<SignedIn>
{/ Protected Routes /}
{isAdmin && (
<>
<NavItem href="/dashboard" icon={BarChartIcon} label="Dashboard" />
<NavItem href="/admin" icon={BarChartIcon} label="Admin" />
<NavItem href="/user-management" icon={UserIcon} label="User Management" iconOnly />
</>
)}
</SignedIn>
</nav>
{/ Auth Section /}
<div className="flex items-center space-x-4">
<SignedOut>
<SignInButton>
<Button variant="default" size="sm">Sign In</Button>
</SignInButton>
</SignedOut>
<SignedIn>
<span className="text-sm font-medium text-foreground hidden sm:inline">
{user?.firstName || 'User'}
</span>
<SignOutButton>
<Button variant="outline" size="sm">Sign Out</Button>
</SignOutButton>
</SignedIn>
{/ Mobile Menu Button /}
<Button
variant="ghost"
size="icon"
onClick={() => setIsMenuOpen(!isMenuOpen)}
className="md:hidden"
aria-label="Toggle menu"
>
{isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
</Button>
</div>
</div>
</div>
{/ Mobile Navigation /}
{isMenuOpen && (
<nav className="md:hidden bg-background border-t border-border p-4">
<div className="space-y-4">
<NavItem href="/" icon={HomeIcon} label="Home" />
<SignedIn>
{isAdmin && (
<>
<NavItem href="/dashboard" icon={BarChartIcon} label="Dashboard" />
<NavItem href="/admin" icon={BarChartIcon} label="Admin" />
<NavItem href="/user-management" icon={UserIcon} label="User Management" />
</>
)}
</SignedIn>
</div>
</nav>
)}
</header>
);
}

### 2. Middleware Protection
Create a middleware file at `middleware.ts` in the root:

typescript
import { authMiddleware } from "@clerk/nextjs";
export default authMiddleware({
// Array of public routes that don't require authentication
publicRoutes: ["/", "/login", "/signup"],
// Array of routes that can be accessed by authenticated users
ignoredRoutes: ["/api/webhook", "/api/public"],
});
export const config = {
matcher: ["/((?!.+\\.[\\w]+$|next).)", "/", "/(api|trpc)(.)"],
};


### 3. Root Layout Setup
Update `app/layout.tsx`:

typescript
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/header";
import { auth } from "@clerk/nextjs";
export default async function RootLayout({
children,
}: {
children: React.ReactNode;
}) {
const { userId } = auth();
const isAdmin = userId ? await checkIfUserIsAdmin(userId) : false;
return (
<ClerkProvider>
<html lang="en">
<body>
<Header isAdmin={isAdmin} />
<main>{children}</main>
</body>
</html>
</ClerkProvider>
);
}

## Key Features

1. **Responsive Design**
   - Desktop and mobile navigation
   - Collapsible menu for mobile
   - Smooth transitions

2. **Authentication Integration**
   - Protected routes with Clerk
   - Sign in/out functionality
   - User role-based access control

3. **Navigation Components**
   - Reusable NavItem component
   - Tooltips for icon-only items
   - Active state styling

4. **Layout Structure**
   - Sticky header
   - Consistent spacing
   - Flexible container system

## Implementation Steps

1. Install required dependencies:

bash
npm install @clerk/nextjs lucide-react @radix-ui/react-tooltip


2. Configure environment variables:

env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key

3. Create the necessary components and files as shown above

4. Add protected routes in middleware.ts

5. Implement role-based access control in your database and backend

## Usage Guidelines

1. **Adding New Navigation Items**

typescript
<NavItem
href="/new-route"
icon={IconComponent}
label="New Route"
iconOnly={false}
/>

2. **Protected Routes**

typescript
<SignedIn>
{isAdmin && (
<NavItem href="/admin-only" icon={AdminIcon} label="Admin" />
)}
</SignedIn>

3. **Mobile Responsiveness**
- Use the `md:` prefix for desktop-specific styles
- Implement mobile-first design patterns
- Test all breakpoints

## Best Practices

1. Keep navigation items organized and minimal
2. Use consistent spacing and styling
3. Implement proper loading states
4. Handle authentication errors gracefully
5. Maintain clear role-based access control
6. Use semantic HTML elements
7. Ensure accessibility standards are met

## Common Customizations

1. **Styling**

typescript
// Customize the header background
className="bg-custom-color"
// Modify button variants
<Button variant="custom">
// Adjust spacing
className="space-x-custom"

2. **Navigation Structure**

typescript
// Add nested navigation
const nestedNavItems = [
{
label: "Parent",
children: [
{ label: "Child 1", href: "/child-1" },
{ label: "Child 2", href: "/child-2" }
]
}
];

3. **Authentication Flow**
typescript
// Custom sign-in/out buttons
<SignInButton mode="modal">
<Button>Custom Sign In</Button>
</SignInButton>