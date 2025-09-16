import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ className, ...props }: React.ComponentProps<typeof Image>) {
  return (
    <Image
      src="/airplanedeals.com.png"
      alt="AirplaneDeals Logo"
      width={120}
      height={40}
      className={cn("object-contain", className)}
    />
  );
}
