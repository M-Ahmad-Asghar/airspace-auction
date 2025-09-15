"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { HeaderWrapper } from '@/components/HeaderWrapper';

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showMobileChat, setShowMobileChat] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderWrapper />
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
}
