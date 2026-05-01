import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'accent' | 'outline'
  children: React.ReactNode
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-primary text-primary-foreground border border-primary',
      secondary: 'bg-secondary text-secondary-foreground border border-secondary',
      accent: 'bg-accent text-accent-foreground border border-accent',
      outline: 'bg-transparent text-foreground border-2 border-foreground',
    }
    
    return (
      <span
        ref={ref}
        className={cn('inline-block px-3 py-1 text-sm font-sans font-bold', variants[variant], className)}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
