'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ease, duration } from '@/lib/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function Loader() {
  const [visible, setVisible] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    const shown = sessionStorage.getItem('loaderShown')
    if (!shown) {
      setVisible(true)
      sessionStorage.setItem('loaderShown', '1')
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg"
          initial={{ y: 0 }}
          animate={{ y: 0 }}
          exit={
            reduced
              ? { opacity: 0, transition: { duration: 0.3 } }
              : {
                  y: '-100%',
                  transition: { duration: duration.loader, ease: ease.expoOut, delay: 0.9 },
                }
          }
          onAnimationComplete={() => setVisible(false)}
        >
          {/* Mark */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: ease.expoOut }}
            onAnimationComplete={() => {
              if (reduced) {
                setTimeout(() => setVisible(false), 400)
              }
            }}
          >
            <svg viewBox="0 0 64 64" width={64} height={64} fill="currentColor" className="text-ink">
              <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
              <text
                x="32"
                y="36"
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                letterSpacing="0.08em"
                fontFamily="var(--font-space-grotesk, system-ui)"
              >
                BYU
              </text>
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
