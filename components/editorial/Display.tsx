import { cn } from '@/lib/utils'

interface Props {
  children: React.ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div'
  size?: 'display' | 'h1' | 'h2' | 'h3'
}

const sizeClass = {
  display: 'text-display',
  h1: 'text-h1',
  h2: 'text-h2',
  h3: 'text-h3',
}

export function Display({ children, className, as: Tag = 'h1', size = 'display' }: Props) {
  return <Tag className={cn(sizeClass[size], 'font-bold text-ink', className)}>{children}</Tag>
}
