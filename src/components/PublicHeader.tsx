
"use client";

import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Mic, MessageSquare } from 'lucide-react';
import { Logo } from './Logo';
import { CATEGORIES } from '@/lib/constants';


export function PublicHeader() {
  return (
    <header className="w-full border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-9 w-auto" />
          </Link>
          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="search"
                placeholder="Search here"
                className="pl-10 pr-10 w-full bg-gray-100 border-transparent focus:bg-white focus:border-input"
              />
              <Mic className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/login">
                Login
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                <MessageSquare />
            </Button>
          </div>
        </div>
      </div>
      <nav className="bg-accent">
        <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-4 sm:gap-6 h-12 text-white text-xs sm:text-sm font-medium overflow-x-auto">
                <Link href="/" className="hover:underline flex-shrink-0">All</Link>
                {CATEGORIES.map((category) => (
                  <Link key={category.name} href={`/?category=${category.name}`} className="hover:underline flex-shrink-0">
                    {category.name}
                  </Link>
                ))}
            </div>
        </div>
      </nav>
    </header>
  );
}
