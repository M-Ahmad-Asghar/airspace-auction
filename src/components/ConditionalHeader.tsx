"use client";

import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Hide header on messages page
  if (pathname.startsWith('/messages')) {
    return null;
  }
  
  return <Header />;
}
