
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';
import { Search, Mic, Plus, MessageSquare, LogOut } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '@/hooks/useAuth';
import { CATEGORIES } from '@/lib/constants';

export function Header() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isFirebaseConfigured } = useAuth();

  const handleLogout = async () => {
    if (!isFirebaseConfigured || !auth) {
      return;
    }
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'There was an error while logging out.',
      });
    }
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };


  return (
    <header className="w-full border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 gap-4">
          <Link href="/home" className="flex items-center gap-2">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={!isFirebaseConfigured}>
                  <Plus size={16} className="mr-1 md:mr-2"/>
                  Post
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {CATEGORIES.map((category) => (
                  <DropdownMenuItem key={category.name} asChild>
                    <Link href={category.href}>
                      {category.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                <MessageSquare />
            </Button>
            
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={!isFirebaseConfigured}>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User avatar'}/>
                      <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
          </div>
        </div>
      </div>
      <nav className="bg-accent">
        <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-4 sm:gap-6 h-12 text-white text-xs sm:text-sm font-medium overflow-x-auto">
                <Link href="/home" className="hover:underline flex-shrink-0">
                  All
                </Link>
                {CATEGORIES.map((category) => (
                  <Link key={category.name} href={`/home?category=${category.name}`} className="hover:underline flex-shrink-0">
                    {category.name}
                  </Link>
                ))}
            </div>
        </div>
      </nav>
    </header>
  );
}
