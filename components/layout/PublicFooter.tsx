import Link from 'next/link'
import { Logo } from '@/components/icons/Logo'

const COLS = [
  {
    heading: 'DISCOVER',
    links: [
      { href: '/discover', label: 'All Talents' },
      { href: '/discover?filter=services', label: 'Services' },
      { href: '/discover?filter=projects', label: 'Projects' },
      { href: '/discover?filter=stories', label: 'Stories' },
    ],
  },
  {
    heading: 'ACCOUNT',
    links: [
      { href: '/signin', label: 'Sign In' },
      { href: '/signup', label: 'Sign Up' },
      { href: '/dashboard', label: 'Dashboard' },
    ],
  },
  {
    heading: 'LEGAL',
    links: [
      { href: '/about', label: 'About' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
    ],
  },
]

export function PublicFooter() {
  return (
    <footer className="border-t border-line bg-bg">
      <div className="container-content py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Logo size={40} />
            <p className="text-caption text-ink-muted max-w-[180px]">
              A directory of student services by students, for students.
            </p>
          </div>

          {/* Link columns */}
          {COLS.map((col) => (
            <div key={col.heading} className="flex flex-col gap-4">
              <p className="text-overline text-ink-muted">{col.heading}</p>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-caption text-ink-soft hover:text-ink transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="hairline mt-12 mb-6" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <p className="text-caption text-ink-muted">
            © {new Date().getFullYear()} ByU Connect. All rights reserved.
          </p>
          <p className="text-caption text-ink-muted">Babcock University</p>
        </div>
      </div>
    </footer>
  )
}
