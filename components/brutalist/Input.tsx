import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block font-sans font-bold mb-2 text-foreground">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-3 font-sans border-2 border-border bg-input text-foreground',
          'placeholder-muted-foreground focus:outline-none focus:border-accent',
          error && 'border-destructive',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-destructive font-sans text-sm mt-2">{error}</p>
      )}
    </div>
  )
)

Input.displayName = 'Input'
