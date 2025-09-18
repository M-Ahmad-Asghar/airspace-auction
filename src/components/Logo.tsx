import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className, ...props }: any) {
  return (
    <Image
      src="/airplanedeals.com.png"
      alt="AirplaneDeals Logo"
      width={120}
      height={40}
      className={cn("object-contain", className)}
      priority
    />
  );
}
