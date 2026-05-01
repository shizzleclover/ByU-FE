'use client'

import { motion } from 'framer-motion'
import { useIntersection } from '@/hooks/useIntersection'
import { ease } from '@/lib/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function ScrollMask({ children, delay = 0, className }: Props) {
  const { ref, isVisible } = useIntersection<HTMLDivElement>({ threshold: 0.2 })
  const reduced = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ overflow: 'hidden' }}
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={
        isVisible
          ? { clipPath: 'inset(0 0 0% 0)' }
          : { clipPath: reduced ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)' }
      }
      transition={
        reduced ? { duration: 0 } : { duration: 0.9, ease: ease.expoOut, delay }
      }
    >
      {children}
    </motion.div>
  )
}
