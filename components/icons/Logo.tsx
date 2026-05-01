import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  href?: string
  size?: number
}

function LogoMark({ size = 46 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 51 / 46)}
      viewBox="0 0 46 51"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="ByU Connect"
    >
      <path
        d="M35.4 30.5L42.4 23.5C42.4 18.7 41.2 14.1 39 10.1L22.7 25.2V50.3H25.8C36.7 50.3 45.6 41.5 45.6 30.5H35.4Z"
        fill="currentColor"
      />
      <path
        d="M10.2 19.8L3.2 26.8C3.2 31.6 4.4 36.2 6.6 40.2L22.9 25.1V0H19.8C8.9 0 0 8.8 0 19.8H10.2Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function Logo({ className, href = '/', size = 28 }: LogoProps) {
  const mark = (
    <span className={cn('text-ink shrink-0', className)} aria-label="ByU Connect">
      <LogoMark size={size} />
    </span>
  )

  if (!href) return mark

  return (
    <Link href={href} className="outline-none focus-visible:ring-1 focus-visible:ring-ink">
      {mark}
    </Link>
  )
}

export { LogoMark }
