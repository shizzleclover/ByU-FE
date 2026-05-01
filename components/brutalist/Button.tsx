import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'font-sans font-bold transition-all border border-border'
    
    const variants = {
      primary: 'bg-primary text-primary-foreground border-primary hover:bg-transparent hover:text-primary',
      secondary: 'bg-secondary text-secondary-foreground border-secondary hover:bg-transparent hover:text-secondary-foreground',
      accent: 'bg-accent text-accent-foreground border-accent hover:bg-transparent hover:text-accent',
      ghost: 'bg-transparent text-foreground border-foreground hover:bg-foreground hover:text-background',
    }
    
    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }
    
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
