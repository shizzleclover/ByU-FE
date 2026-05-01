import { cn } from '@/lib/utils'

interface Props {
  strong?: boolean
  className?: string
}

export function Hairline({ strong, className }: Props) {
  return <hr className={cn(strong ? 'hairline-strong' : 'hairline', className)} />
}
