'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Logo } from '@/components/icons/Logo'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { StaggeredMenu } from '@/components/motion/StaggeredMenu'

const LEFT_NAV = [
  { href: '/discover', label: 'TALENTS' },
  { href: '/discover?filter=projects', label: 'PROJECTS' },
]

const RIGHT_NAV_BASE = [
  { href: '/discover?filter=services', label: 'SERVICES' },
  { href: '/discover?filter=stories', label: 'INSIGHTS' },
]

const MENU_SOCIALS = [
  { href: 'https://instagram.com', label: 'INSTAGRAM' },
  { href: 'https://twitter.com', label: 'TWITTER' },
]

export function PublicNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const authLink = isAuthenticated
    ? { href: '/dashboard', label: 'DASHBOARD' }
    : { href: '/signin', label: 'SIGN IN' }

  const rightNav = [...RIGHT_NAV_BASE, authLink]

  const allMenuLinks = [
    ...LEFT_NAV,
    ...RIGHT_NAV_BASE,
    authLink,
  ]

  const navLink =
    'text-overline opacity-70 hover:opacity-100 transition-opacity tracking-[0.12em]'

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-colors duration-300 border-b border-line',
          scrolled ? 'bg-bg/95 backdrop-blur-sm' : 'bg-bg',
        )}
      >
        <div className="w-full px-6 md:px-12 lg:px-16 h-[60px] flex items-center justify-between">
          {/* Left: logo + nav */}
          <div className="flex items-center gap-12">
            <Logo size={36} />
            <nav className="hidden md:flex gap-10" aria-label="Primary navigation">
              {LEFT_NAV.map((item) => (
                <Link key={item.href} href={item.href} className={navLink}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right nav */}
          <nav className="hidden md:flex gap-10 items-center" aria-label="Secondary navigation">
            {rightNav.map((item) => (
              <Link key={item.href} href={item.href} className={navLink}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1 text-ink"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      <StaggeredMenu
        links={allMenuLinks}
        socials={MENU_SOCIALS}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        colors={['#FAFAF7', '#0F0F0E']}
      />
    </>
  )
}
