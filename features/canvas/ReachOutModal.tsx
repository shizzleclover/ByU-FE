'use client'

import { useEffect } from 'react'
import { X, Copy, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Overline } from '@/components/editorial/Overline'
import { Hairline } from '@/components/editorial/Hairline'
import { ease } from '@/lib/motion'
import type { Contact } from '@/types/api'

const CONTACT_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  twitter: 'X (Twitter)',
  email: 'Email',
  phone: 'Phone',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  website: 'Website',
  custom: 'Other',
}

function contactHref(contact: Contact): string {
  switch (contact.type) {
    case 'whatsapp': return `https://wa.me/${contact.value.replace(/\D/g, '')}`
    case 'email': return `mailto:${contact.value}`
    case 'phone': return `tel:${contact.value}`
    default: return contact.value.startsWith('http') ? contact.value : `https://${contact.value}`
  }
}

interface Props {
  open: boolean
  onClose: () => void
  contacts: Contact[]
  profileName: string
  onOutreach: (contactId: string) => void
}

export function ReachOutModal({ open, onClose, contacts, profileName, onOutreach }: Props) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const copy = (contact: Contact) => {
    navigator.clipboard.writeText(contact.value)
    toast.success('Copied to clipboard')
    onOutreach(contact._id)
  }

  const open_ = (contact: Contact) => {
    window.open(contactHref(contact), '_blank', 'noopener,noreferrer')
    onOutreach(contact._id)
  }

  const sorted = [...contacts].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet (mobile) / Modal (desktop) */}
          <motion.div
            className="fixed z-50 bg-bg border border-line
              bottom-0 left-0 right-0 md:bottom-auto md:left-1/2 md:right-auto
              md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2
              md:w-[480px] p-8"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { duration: 0.4, ease: ease.expoOut } }}
            exit={{ y: '100%', opacity: 0, transition: { duration: 0.25, ease: ease.in } }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-h4 font-bold text-ink">
                  REACH OUT TO {profileName.toUpperCase()}
                </h2>
                <p className="text-caption text-ink-muted mt-1">Pick a way to get in touch.</p>
              </div>
              <button onClick={onClose} className="p-1 text-ink-muted hover:text-ink transition-colors">
                <X size={18} />
              </button>
            </div>

            <Hairline />

            <div className="divide-y divide-line mt-0">
              {sorted.map((contact) => (
                <div key={contact._id} className="py-4">
                  {contact.isPrimary && (
                    <Overline className="mb-1 text-state-success">PRIMARY</Overline>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-overline text-ink-muted">
                        {CONTACT_LABELS[contact.type] ?? contact.type}
                      </p>
                      <p className="text-meta text-ink mt-0.5">{contact.label || contact.value}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => open_(contact)}
                        className="text-overline px-3 py-2 border border-line hover:border-ink transition-colors"
                      >
                        OPEN
                      </button>
                      <button
                        onClick={() => copy(contact)}
                        className="p-2 border border-line hover:border-ink transition-colors"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {contacts.length === 0 && (
                <p className="text-caption text-ink-muted py-6 text-center">
                  No contact methods available.
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
