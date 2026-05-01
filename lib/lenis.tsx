'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type Lenis from 'lenis'

const LenisContext = createContext<Lenis | null>(null)

export function useLenis() {
  return useContext(LenisContext)
}

interface LenisProviderProps {
  children: React.ReactNode
}

export function LenisProvider({ children }: LenisProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) return

    // Dynamic import so it doesn't break SSR
    import('lenis').then(({ default: LenisClass }) => {
      const instance = new LenisClass({
        lerp: 0.1,
        wheelMultiplier: 1,
        smoothWheel: true,
      })

      function raf(time: number) {
        instance.raf(time)
        rafRef.current = requestAnimationFrame(raf)
      }

      rafRef.current = requestAnimationFrame(raf)
      setLenis(instance)
    })

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lenis?.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
