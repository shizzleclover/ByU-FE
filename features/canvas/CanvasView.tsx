'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Bookmark, Share2, ExternalLink,
  Mail, Phone, MessageCircle, Globe,
  Instagram, Twitter, Linkedin, Music2, ChevronRight,
} from 'lucide-react'
import { Hairline } from '@/components/editorial/Hairline'
import { Overline } from '@/components/editorial/Overline'
import { ScrollMask } from '@/components/motion/ScrollMask'
import { Reveal } from '@/components/motion/Reveal'
import { ReachOutModal } from './ReachOutModal'
import { apiPost } from '@/lib/api'
import type { CanvasResponse, Contact } from '@/types/api'

const SECTION_ORDER_DEFAULT = ['services', 'projects', 'links', 'stories', 'resume']

interface Props {
  canvas: CanvasResponse
}

export function CanvasView({ canvas }: Props) {
  const { profile, services, projects, links, stories, resume, contacts } = canvas
  const [reachOutOpen, setReachOutOpen] = useState(false)

  const layout = profile.canvasLayout?.length ? profile.canvasLayout : SECTION_ORDER_DEFAULT

  const logOutreach = (contactId: string) => {
    apiPost('/analytics/outreach', { contactId, profileId: profile._id }).catch(() => {})
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* ── Header (always first) ── */}
      <div className="container-content py-12">
        {/* Breadcrumb */}
        <p className="text-overline text-ink-muted mb-8">
          <Link href="/" className="hover:text-ink transition-colors">BYU CONNECT</Link>
          {' / '}
          <span>{profile.username.toUpperCase()}</span>
        </p>

        <div className="flex flex-col md:flex-row gap-10 items-start">
          {/* Avatar */}
          {profile.avatarUrl && (
            <ScrollMask className="shrink-0">
              <div className="relative w-24 h-24 overflow-hidden">
                <Image
                  src={profile.avatarUrl}
                  alt={`${profile.fullName}'s photo`}
                  fill
                  sizes="96px"
                  className="object-cover"
                  priority
                />
              </div>
            </ScrollMask>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-h1 font-bold text-ink leading-none">{profile.fullName}</h1>
              {profile.isVerified && (
                <span className="text-overline text-state-success border border-state-success px-2 py-0.5">
                  VERIFIED
                </span>
              )}
            </div>

            {profile.bio && (
              <p className="text-lead text-ink-soft mt-4 max-w-prose">{profile.bio}</p>
            )}

            <p className="text-meta text-ink-muted mt-3">
              {[profile.department, profile.year ? `Year ${profile.year}` : null]
                .filter(Boolean)
                .join(' · ')}
            </p>

            <div className="mt-6 space-y-3">
              {/* Direct contact buttons */}
              {contacts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {contacts.slice(0, 4).map((contact) => (
                    <ContactButton key={contact._id} contact={contact} onOutreach={logOutreach} />
                  ))}
                  {contacts.length > 4 && (
                    <button
                      onClick={() => setReachOutOpen(true)}
                      className="flex items-center gap-1.5 text-overline px-4 py-2.5 border border-line hover:border-ink transition-colors"
                    >
                      +{contacts.length - 4} MORE <ChevronRight size={13} />
                    </button>
                  )}
                </div>
              )}

              {/* Utility buttons */}
              <div className="flex items-center gap-2">
                {contacts.length === 0 && (
                  <button
                    onClick={() => setReachOutOpen(true)}
                    className="text-overline px-6 py-3 bg-ink text-bg hover:bg-ink-soft transition-colors"
                  >
                    REACH OUT →
                  </button>
                )}
                <button className="p-2 border border-line hover:border-ink transition-colors" title="Save">
                  <Bookmark size={16} />
                </button>
                <button className="p-2 border border-line hover:border-ink transition-colors" title="Share">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Hairline />

      {/* ── Dynamic sections ── */}
      {layout.map((section) => {
        switch (section) {
          case 'services':
            return services.length > 0 ? (
              <CanvasServices key="services" services={services} accentColor={profile.accentColor} />
            ) : null

          case 'projects':
            return projects.filter((p) => p.isPublished).length > 0 ? (
              <CanvasProjects
                key="projects"
                projects={projects.filter((p) => p.isPublished)}
                username={profile.username}
              />
            ) : null

          case 'links':
            return links.filter((l) => l.isActive).length > 0 ? (
              <CanvasLinks key="links" links={links.filter((l) => l.isActive)} />
            ) : null

          case 'stories':
            return stories.filter((s) => s.isPublished).length > 0 ? (
              <CanvasStories
                key="stories"
                stories={stories.filter((s) => s.isPublished)}
                username={profile.username}
              />
            ) : null

          case 'resume':
            return resume ? <CanvasResume key="resume" resume={resume} /> : null

          default:
            return null
        }
      })}

      {/* ── Footer of canvas ── */}
      <div className="container-content py-8 border-t border-line mt-12">
        <p className="text-caption text-ink-muted">VIEWED {profile.viewCount.toLocaleString()} TIMES.</p>
        <Link
          href={`/report?profile=${profile._id}`}
          className="text-caption text-ink-faint hover:text-ink-muted transition-colors mt-2 inline-block"
        >
          Report this profile
        </Link>
      </div>

      {/* Reach Out modal */}
      <ReachOutModal
        open={reachOutOpen}
        onClose={() => setReachOutOpen(false)}
        contacts={contacts}
        profileName={profile.fullName}
        onOutreach={logOutreach}
      />
    </div>
  )
}

// ── Contact button ─────────────────────────────────────────────────────────

const CONTACT_ICONS: Record<string, React.ReactNode> = {
  whatsapp:  <MessageCircle size={15} />,
  email:     <Mail size={15} />,
  phone:     <Phone size={15} />,
  instagram: <Instagram size={15} />,
  twitter:   <Twitter size={15} />,
  linkedin:  <Linkedin size={15} />,
  tiktok:    <Music2 size={15} />,
  website:   <Globe size={15} />,
  custom:    <ExternalLink size={15} />,
}

const CONTACT_LABELS: Record<string, string> = {
  whatsapp:  'WhatsApp',
  email:     'Email',
  phone:     'Call',
  instagram: 'Instagram',
  twitter:   'X / Twitter',
  linkedin:  'LinkedIn',
  tiktok:    'TikTok',
  website:   'Website',
  custom:    'Link',
}

function contactHref(contact: Contact): string {
  switch (contact.type) {
    case 'whatsapp': return `https://wa.me/${contact.value.replace(/\D/g, '')}`
    case 'email':    return `mailto:${contact.value}`
    case 'phone':    return `tel:${contact.value}`
    case 'instagram': {
      const handle = contact.value.replace(/^@/, '')
      return handle.startsWith('http') ? handle : `https://instagram.com/${handle}`
    }
    case 'twitter': {
      const handle = contact.value.replace(/^@/, '')
      return handle.startsWith('http') ? handle : `https://x.com/${handle}`
    }
    case 'tiktok': {
      const handle = contact.value.replace(/^@/, '')
      return handle.startsWith('http') ? handle : `https://tiktok.com/@${handle}`
    }
    default:
      return contact.value.startsWith('http') ? contact.value : `https://${contact.value}`
  }
}

function ContactButton({ contact, onOutreach }: { contact: Contact; onOutreach: (id: string) => void }) {
  const label = contact.label || CONTACT_LABELS[contact.type] || contact.type
  const href = contactHref(contact)
  const isPrimary = contact.isPrimary

  return (
    <a
      href={href}
      target={contact.type === 'email' || contact.type === 'phone' ? '_self' : '_blank'}
      rel="noopener noreferrer"
      onClick={() => onOutreach(contact._id)}
      className={`inline-flex items-center gap-2 text-overline px-4 py-2.5 border transition-colors
        ${isPrimary
          ? 'bg-ink text-bg border-ink hover:bg-ink-soft hover:border-ink-soft'
          : 'border-line text-ink hover:border-ink'
        }`}
    >
      {CONTACT_ICONS[contact.type]}
      {label.toUpperCase()}
    </a>
  )
}

// ── Section components ─────────────────────────────────────────────────────

function CanvasServices({ services, accentColor }: {
  services: CanvasResponse['services']
  accentColor?: string
}) {
  return (
    <section className="container-content py-12">
      <Overline className="mb-8">SERVICES</Overline>
      <div className="divide-y divide-line">
        {services.map((svc) => (
          <Reveal key={svc._id}>
            <div className="py-8">
              <Overline className="mb-2">{svc.category}</Overline>
              <h3 className="text-h4 font-bold text-ink mt-1">{svc.title}</h3>
              {svc.description && (
                <p className="text-body text-ink-soft mt-3 max-w-prose">{svc.description}</p>
              )}
              <p className="text-meta text-ink-muted mt-4">
                {svc.isNegotiable
                  ? 'Negotiable'
                  : svc.startingPrice
                  ? `From ${svc.currency}${svc.startingPrice.toLocaleString()}`
                  : 'Contact for pricing'}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
      <Hairline />
    </section>
  )
}

function CanvasProjects({ projects, username }: {
  projects: CanvasResponse['projects']
  username: string
}) {
  return (
    <section className="container-content py-12">
      <div className="flex items-baseline gap-3 mb-8">
        <Overline>PROJECTS</Overline>
        <span className="text-overline text-ink-ghost">
          {String(projects.length).padStart(2, '0')}.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project, i) => (
          <Reveal key={project._id} delay={i * 0.08}>
            <Link
              href={`/${username}/projects/${project.slug}`}
              className="group block"
            >
              {project.coverUrl && (
                <ScrollMask>
                  <div className="relative w-full aspect-[16/10] overflow-hidden">
                    <Image
                      src={project.coverUrl}
                      alt={`Cover image for ${project.title}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  </div>
                </ScrollMask>
              )}
              <div className="mt-4">
                <h3 className="text-h5 font-bold text-ink group-hover:underline underline-offset-4">
                  {project.title}
                </h3>
                {project.tagline && (
                  <p className="text-caption text-ink-muted mt-1">{project.tagline}</p>
                )}
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
      <Hairline className="mt-12" />
    </section>
  )
}

function CanvasLinks({ links }: { links: CanvasResponse['links'] }) {
  return (
    <section className="container-content py-12">
      <Overline className="mb-8">LINKS.</Overline>
      <div className="divide-y divide-line">
        {links.map((link) => (
          <a
            key={link._id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-4 group hover:bg-bg-sunken -mx-4 px-4 transition-colors"
          >
            <div>
              <p className="text-h6 font-bold text-ink">{link.label}</p>
              <p className="text-caption text-ink-muted">{link.url}</p>
            </div>
            <ExternalLink size={14} className="text-ink-muted group-hover:text-ink transition-colors shrink-0" />
          </a>
        ))}
      </div>
      <Hairline />
    </section>
  )
}

function CanvasStories({ stories, username }: {
  stories: CanvasResponse['stories']
  username: string
}) {
  return (
    <section className="container-content py-12">
      <Overline className="mb-8">STORIES</Overline>
      <div className="divide-y divide-line">
        {stories.map((story) => (
          <Reveal key={story._id}>
            <Link
              href={`/${username}/stories/${story.slug}`}
              className="flex gap-6 py-6 group hover:bg-bg-sunken -mx-4 px-4 transition-colors"
            >
              {story.coverUrl && (
                <div className="relative w-[120px] h-[80px] shrink-0 overflow-hidden">
                  <Image
                    src={story.coverUrl}
                    alt={story.title}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-h5 font-bold text-ink group-hover:underline underline-offset-4">
                  {story.title}
                </h3>
                {story.excerpt && (
                  <p className="text-caption text-ink-muted mt-1 line-clamp-1">{story.excerpt}</p>
                )}
                <p className="text-overline text-ink-muted mt-2">
                  {story.readingTimeMinutes} MIN READ
                  {story.publishedAt
                    ? ` · ${new Date(story.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                    : ''}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
      <Hairline />
    </section>
  )
}

function CanvasResume({ resume }: { resume: NonNullable<CanvasResponse['resume']> }) {
  return (
    <section className="container-content py-12">
      <Overline className="mb-8">RESUME</Overline>
      <div className="flex items-center justify-between py-4 border-t border-b border-line">
        <div>
          <p className="text-h6 font-bold text-ink">{resume.filename}</p>
          <p className="text-caption text-ink-muted">
            {(resume.size / 1024).toFixed(0)} KB ·{' '}
            {new Date(resume.createdAt).toLocaleDateString()}
          </p>
        </div>
        <a
          href={resume.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-overline text-ink hover:text-ink-soft transition-colors"
        >
          DOWNLOAD →
        </a>
      </div>
      <Hairline className="mt-12" />
    </section>
  )
}
