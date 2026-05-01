'use client'

import { useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { LogoMark } from '@/components/icons/Logo'

export interface MenuLink {
  href: string
  label: string
}

interface StaggeredMenuProps {
  links: MenuLink[]
  socials?: MenuLink[]
  isOpen: boolean
  onClose: () => void
  colors?: [string, string] // [bg, ink]
}

export function StaggeredMenu({
  links,
  socials = [],
  isOpen,
  onClose,
  colors = ['#FAFAF7', '#0F0F0E'],
}: StaggeredMenuProps) {
  const [bgColor, inkColor] = colors
  const overlayRef = useRef<HTMLDivElement>(null)
  const curtainRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<HTMLAnchorElement[]>([])
  const socialsRef = useRef<HTMLAnchorElement[]>([])
  const logoRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  const setItemRef = useCallback((el: HTMLAnchorElement | null, i: number) => {
    if (el) itemsRef.current[i] = el
  }, [])

  const setSocialRef = useCallback((el: HTMLAnchorElement | null, i: number) => {
    if (el) socialsRef.current[i] = el
  }, [])

  useEffect(() => {
    const overlay = overlayRef.current
    const curtain = curtainRef.current
    if (!overlay || !curtain) return

    tlRef.current?.kill()

    if (isOpen) {
      gsap.set(overlay, { display: 'flex' })
      const tl = gsap.timeline()
      tlRef.current = tl

      tl.fromTo(
        curtain,
        { scaleY: 0, transformOrigin: 'top center' },
        { scaleY: 1, duration: 0.55, ease: 'power4.inOut' },
      )

      if (logoRef.current) {
        tl.fromTo(
          logoRef.current,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
          '-=0.2',
        )
      }

      const allItems = [
        ...itemsRef.current.filter(Boolean),
        ...socialsRef.current.filter(Boolean),
      ]

      tl.fromTo(
        allItems,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.07,
        },
        '-=0.25',
      )
    } else {
      const tl = gsap.timeline({
        onComplete: () => gsap.set(overlay, { display: 'none' }),
      })
      tlRef.current = tl

      const allItems = [
        ...itemsRef.current.filter(Boolean).reverse(),
        ...socialsRef.current.filter(Boolean).reverse(),
      ]

      tl.to(allItems, {
        y: -20,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        stagger: 0.04,
      })

      tl.to(
        curtain,
        { scaleY: 0, transformOrigin: 'bottom center', duration: 0.45, ease: 'power4.inOut' },
        '-=0.1',
      )
    }

    return () => { tlRef.current?.kill() }
  }, [isOpen])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 hidden flex-col"
      style={{ backgroundColor: bgColor }}
    >
      <div
        ref={curtainRef}
        className="absolute inset-0"
        style={{ backgroundColor: bgColor }}
      />

      {/* Header row */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-12 h-[60px] border-b"
        style={{ borderColor: '#E6E5DF' }}>
        <div ref={logoRef} style={{ opacity: 0 }}>
          <LogoMark size={32} />
        </div>
        <button
          onClick={onClose}
          className="text-overline tracking-[0.12em] transition-opacity hover:opacity-60"
          style={{ color: inkColor }}
          aria-label="Close menu"
        >
          CLOSE ×
        </button>
      </div>

      {/* Nav items */}
      <nav className="relative z-10 flex flex-col justify-center flex-1 px-6 md:px-12 gap-2">
        {links.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            ref={(el) => setItemRef(el, i)}
            onClick={onClose}
            className="block py-3 border-b transition-opacity hover:opacity-60"
            style={{
              color: inkColor,
              borderColor: '#E6E5DF',
              opacity: 0,
            }}
          >
            <span className="text-h3 font-bold leading-none">{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* Socials / bottom links */}
      {socials.length > 0 && (
        <div className="relative z-10 flex gap-6 px-6 md:px-12 py-6 border-t"
          style={{ borderColor: '#E6E5DF' }}>
          {socials.map((s, i) => (
            <Link
              key={s.href}
              href={s.href}
              ref={(el) => setSocialRef(el, i)}
              onClick={onClose}
              className="text-overline transition-opacity hover:opacity-60"
              style={{ color: inkColor, opacity: 0 }}
            >
              {s.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
