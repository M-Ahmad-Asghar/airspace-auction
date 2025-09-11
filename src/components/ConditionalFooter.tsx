"use client";

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on admin routes and messages page
  if (pathname.startsWith('/admin') || pathname.startsWith('/messages')) {
    return null;
  }
  
  return <Footer />;
}
