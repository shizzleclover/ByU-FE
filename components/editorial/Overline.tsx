import { cn } from '@/lib/utils'

interface Props {
  children: React.ReactNode
  className?: string
  as?: 'span' | 'p' | 'div' | 'label'
}

export function Overline({ children, className, as: Tag = 'span' }: Props) {
  return <Tag className={cn('text-overline text-ink-muted', className)}>{children}</Tag>
}
