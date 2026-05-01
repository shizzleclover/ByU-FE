'use client'

import { motion } from 'framer-motion'
import { useIntersection } from '@/hooks/useIntersection'
import { ease, duration } from '@/lib/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: React.ElementType
}

export function Reveal({ children, delay = 0, className, as: Tag = 'div' }: Props) {
  const { ref, isVisible } = useIntersection<HTMLDivElement>({ threshold: 0.2 })
  const reduced = useReducedMotion()

  const variants = reduced
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.1, delay } },
      }
    : {
        hidden: { opacity: 0, y: 40 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: duration.slow, ease: ease.out, delay },
        },
      }

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  )
}
