'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Reveal } from '@/components/motion/Reveal'
import { Hairline } from '@/components/editorial/Hairline'
import { Overline } from '@/components/editorial/Overline'
import FlowingMenu from '@/components/motion/FlowingMenu'
import Folder from '@/components/ui/Folder'
import { apiGet } from '@/lib/api'
import type { DiscoveryProfile } from '@/types/api'

const FLOWING_ITEMS = [
  { link: '/discover?category=Design', text: 'Design', image: '/illustrations/right-direction.svg' },
  { link: '/discover?category=Development', text: 'Development', image: '/illustrations/web-search.svg' },
  { link: '/discover?category=Writing', text: 'Writing', image: '/illustrations/anonymous-feedback.svg' },
  { link: '/discover?category=Photography', text: 'Photography', image: '/illustrations/adventure-map.svg' },
  { link: '/discover?category=Video', text: 'Video', image: '/illustrations/remote-meeting.svg' },
  { link: '/discover?category=Music', text: 'Music', image: '/illustrations/right-direction.svg' },
  { link: '/discover?category=Tutoring', text: 'Tutoring', image: '/illustrations/web-search.svg' },
  { link: '/discover?category=Marketing', text: 'Marketing', image: '/illustrations/anonymous-feedback.svg' },
  { link: '/discover?category=Consulting', text: 'Consulting', image: '/illustrations/adventure-map.svg' },
]

// Illustration layout for hero (replacing image carousel)
const HERO_ILLUSTRATIONS = [
  { src: '/illustrations/adventure-map.svg', w: 220, h: 280, mt: 40 },
  { src: '/illustrations/right-direction.svg', w: 300, h: 220, mt: 0 },
  { src: '/illustrations/remote-meeting.svg', w: 260, h: 300, mt: 60 },
  { src: '/illustrations/web-search.svg', w: 320, h: 240, mt: 20 },
  { src: '/illustrations/anonymous-feedback.svg', w: 240, h: 280, mt: 80 },
  { src: '/illustrations/adventure-map.svg', w: 280, h: 200, mt: 10 },
  { src: '/illustrations/right-direction.svg', w: 220, h: 280, mt: 40 },
  { src: '/illustrations/remote-meeting.svg', w: 300, h: 220, mt: 0 },
]

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '8%'])

  const { data: featuredData } = useQuery({
    queryKey: ['discovery', 'featured'],
    queryFn: () => apiGet<{ profiles: DiscoveryProfile[] }>('/discovery?isFeatured=true&limit=3'),
    staleTime: 5 * 60_000,
  })

  const featured = featuredData?.profiles ?? []

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-[100svh] overflow-hidden bg-bg flex flex-col justify-between"
      >
        <motion.div style={{ y: heroY }} className="flex-1 flex flex-col justify-center pt-16 pb-0">
          <div className="px-6 md:px-12 lg:px-16 max-w-[1440px] mx-auto w-full">
            <div className="relative z-10">
              <motion.h1
                className="text-display font-bold text-ink leading-[0.9] uppercase"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              >
                FIND
                <br />
                YOUR
                <br />
                PEOPLE
              </motion.h1>

              <motion.div
                className="mt-6 space-y-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <p className="text-overline text-ink">
                  BYU CONNECT — A DIRECTORY OF STUDENTS, BY STUDENTS.
                </p>
                <p className="text-overline text-ink-muted">
                  DESIGN. CODE. WRITE. TUTOR. SHOOT. CREATE.
                </p>
              </motion.div>
            </div>

            {/* Illustration rail — replaces image carousel */}
            <div className="relative mt-16 overflow-hidden">
              <div className="flex gap-6 marquee-track" style={{ width: 'max-content' }}>
                {[...HERO_ILLUSTRATIONS, ...HERO_ILLUSTRATIONS].map((item, i) => (
                  <div
                    key={i}
                    className="shrink-0 overflow-hidden bg-bg-elevated border border-line"
                    style={{ width: item.w, height: item.h, marginTop: item.mt }}
                  >
                    <Image
                      src={item.src}
                      alt=""
                      width={item.w}
                      height={item.h}
                      className="w-full h-full object-contain p-4"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <Hairline className="mt-0" />
      </section>

      {/* ── Featured students ─────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="bg-bg py-24">
          <div className="container-content">
            <Reveal>
              <Overline className="mb-12">FEATURED STUDENTS</Overline>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-line">
              {featured.map((profile, i) => (
                <Reveal key={profile._id} delay={i * 0.1}>
                  <Link
                    href={`/${profile.username}`}
                    className="group border-r border-b border-line p-8 block hover:bg-bg-sunken transition-colors"
                  >
                    <Overline className="mb-4">
                      {profile.serviceCategories[0] ?? 'STUDENT'}
                    </Overline>
                    <p className="text-h2 font-bold text-ink leading-none mt-2 group-hover:underline underline-offset-4">
                      {profile.fullName}
                    </p>
                    {profile.bio && (
                      <p className="text-caption text-ink-muted mt-4 line-clamp-2">{profile.bio}</p>
                    )}
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── What They Do — FlowingMenu ────────────────────────────── */}
      <section className="bg-bg border-t border-line">
        <div className="container-content pt-24 pb-0">
          <Reveal>
            <p className="text-h2 font-bold text-ink mb-0">WHAT THEY DO.</p>
          </Reveal>
        </div>
        <div style={{ height: '600px' }} className="mt-8">
          <FlowingMenu
            items={FLOWING_ITEMS}
            speed={18}
            bgColor="#FAFAF7"
            textColor="#0F0F0E"
            marqueeBgColor="#0F0F0E"
            marqueeTextColor="#FAFAF7"
            borderColor="#E6E5DF"
          />
        </div>
      </section>

      {/* ── CTA band ─────────────────────────────────────────────── */}
      <section className="bg-ink py-32 text-bg overflow-hidden">
        <div className="container-content">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Text + CTA */}
            <div className="flex-1 text-center lg:text-left">
              <Reveal>
                <p className="text-display font-bold text-bg leading-none">MAKE YOURS.</p>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="text-lead text-ink-ghost mt-6 mb-12">
                  Claim your canvas. Share your work. Find your people.
                </p>
              </Reveal>
              <Reveal delay={0.25}>
                <Link
                  href="/signup"
                  className="inline-block bg-bg text-ink px-12 py-4 text-overline font-bold hover:bg-bg-sunken transition-colors"
                >
                  CREATE YOUR CANVAS →
                </Link>
              </Reveal>
            </div>

            {/* Illustration + Folder */}
            <div className="flex-1 flex items-center justify-center gap-12">
              <Reveal delay={0.2}>
                <div className="opacity-80">
                  <Image
                    src="/illustrations/right-direction.svg"
                    alt=""
                    width={320}
                    height={280}
                    className="object-contain invert"
                    unoptimized
                  />
                </div>
              </Reveal>
              <Reveal delay={0.35}>
                <div className="flex flex-col items-center gap-4">
                  <Folder
                    size={2.5}
                    color="#FAFAF7"
                    items={[
                      <div key="a" className="w-full h-full flex items-center justify-center p-2">
                        <span className="text-[6px] font-bold text-ink-muted leading-tight">PROJECT.PDF</span>
                      </div>,
                      <div key="b" className="w-full h-full flex items-center justify-center p-2">
                        <span className="text-[6px] font-bold text-ink-muted leading-tight">RESUME.PDF</span>
                      </div>,
                      <div key="c" className="w-full h-full flex items-center justify-center p-2">
                        <span className="text-[6px] font-bold text-ink-muted leading-tight">CANVAS</span>
                      </div>,
                    ]}
                  />
                  <p className="text-caption text-ink-ghost mt-2">CLICK TO OPEN</p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
