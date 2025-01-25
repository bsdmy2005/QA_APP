"use client";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { SignInButton, UserButton } from "@clerk/clerk-react";
import { BrainCircuit, Search, Users, MessageSquare, Menu, X, HomeIcon, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Header({ isAdmin }: { isAdmin: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isSignedIn } = useUser();

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Q&A', href: '/qna', icon: MessageSquare },
    { name: 'Search', href: '/search', icon: Search },
  ];

  const fullNavigation = isSignedIn && isAdmin
    ? [...navigation, { name: 'Admin', href: '/admin', icon: Users }]
    : navigation;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b fixed w-full z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <BrainCircuit className="h-8 w-8 text-primary" />
              <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                FinTech Q&A
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {fullNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <item.icon className="h-4 w-4" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="default" className="gap-2">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9"
                  }
                }}
              />
            </SignedIn>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 bg-white border-t">
            {fullNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg mx-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="h-5 w-5 text-primary" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
} 