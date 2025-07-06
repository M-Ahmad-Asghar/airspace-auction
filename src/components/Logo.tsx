
import * as React from 'react';
import { cn } from '@/lib/utils';

export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 323 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className={cn(className)}
      {...props}
    >
      <rect width="323" height="54" fill="url(#pattern0_612_2031)" />
      <rect width="323" height="54" fill="url(#pattern1_612_2031)" />
      <defs>
        <pattern
          id="pattern0_612_2031"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlinkHref="#image0_612_2031"
            transform="matrix(0.00294118 0 0 0.0175926 0 -0.00138889)"
          />
        </pattern>
        <pattern
          id="pattern1_612_2031"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlinkHref="#image0_612_2031"
            transform="matrix(0.00294118 0 0 0.0175926 0 -0.00138889)"
          />
        </pattern>
        <image
          id="image0_612_2031"
          width="340"
          height="57"
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
}
