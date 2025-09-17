"use client";
import Link from 'next/link';
import { Logo } from './Logo';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function StaticHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/home" className="text-gray-700 hover:text-primary transition-colors">
              Browse
            </Link>
            <Link href="/create-listing" className="text-gray-700 hover:text-primary transition-colors">
              Create Listing
            </Link>
            <Link href="/my-listings" className="text-gray-700 hover:text-primary transition-colors">
              My Listings
            </Link>
            <Link href="/messages" className="text-gray-700 hover:text-primary transition-colors">
              Messages
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/home" className="text-gray-700 hover:text-primary transition-colors">
                Browse
              </Link>
              <Link href="/create-listing" className="text-gray-700 hover:text-primary transition-colors">
                Create Listing
              </Link>
              <Link href="/my-listings" className="text-gray-700 hover:text-primary transition-colors">
                My Listings
              </Link>
              <Link href="/messages" className="text-gray-700 hover:text-primary transition-colors">
                Messages
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
