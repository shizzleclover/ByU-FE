import React from 'react'
import { cn } from '@/lib/utils'

type Variant = 'content' | 'narrow' | 'prose' | 'wide'

interface Props {
  children: React.ReactNode
  variant?: Variant
  className?: string
  as?: React.ElementType
}

const variantClass: Record<Variant, string> = {
  content: 'container-content',
  narrow: 'container-narrow',
  prose: 'container-prose',
  wide: 'container-wide',
}

export function Container({ children, variant = 'content', className, as: Tag = 'div' }: Props) {
  return (
    <Tag className={cn(variantClass[variant], className)}>
      {children}
    </Tag>
  )
}
