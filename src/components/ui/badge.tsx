import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-brand/15 text-brand',
        secondary: 'border-border bg-bg-elev-2 text-fg-muted',
        outline: 'border-border text-fg-muted',
        warn: 'border-transparent bg-warn/15 text-warn',
        danger: 'border-transparent bg-danger/15 text-danger',
        success: 'border-transparent bg-success/15 text-success',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
