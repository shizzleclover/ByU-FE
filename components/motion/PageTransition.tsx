'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ease, duration } from '@/lib/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props {
  children: React.ReactNode
}

export function PageTransition({ children }: Props) {
  const pathname = usePathname()
  const reduced = useReducedMotion()

  const variants = reduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.1 } },
        exit: { opacity: 0, transition: { duration: 0.1 } },
      }
    : {
        initial: { opacity: 0, y: 12 },
        animate: {
          opacity: 1,
          y: 0,
          transition: { duration: duration.base, ease: ease.out, delay: 0.05 },
        },
        exit: {
          opacity: 0,
          y: -12,
          transition: { duration: 0.3, ease: ease.in },
        },
      }

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname} variants={variants} initial="initial" animate="animate" exit="exit">
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
