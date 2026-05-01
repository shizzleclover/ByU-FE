'use client'

import { useState, useRef, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

interface AppSelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  /** underline = compact filter style, form = matches text inputs, pill = bordered box */
  variant?: 'underline' | 'form' | 'pill'
}

export function AppSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className,
  variant = 'underline',
}: AppSelectProps) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const id = useId()
  const selected = options.find((o) => o.value === value)

  useEffect(() => { setMounted(true) }, [])

  // Click-outside — check both trigger container and portalled dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Recalculate position on scroll/resize while open
  useEffect(() => {
    if (!open) return
    const update = () => {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return
      setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open])

  const handleToggle = () => {
    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    setOpen((o) => !o)
  }

  const triggerCls = cn(
    'flex items-center justify-between gap-3 w-full cursor-pointer transition-colors',
    variant === 'underline' && [
      'pb-1.5 border-b text-caption',
      open ? 'border-ink text-ink' : 'border-line text-ink hover:border-ink-muted',
    ],
    variant === 'form' && [
      'pb-2 border-b text-body',
      open ? 'border-ink text-ink' : 'border-line text-ink hover:border-ink',
    ],
    variant === 'pill' && [
      'px-3 py-2 border text-caption',
      open ? 'border-ink bg-ink text-bg' : 'border-line text-ink bg-transparent hover:border-ink',
    ],
  )

  const dropdown = (
    <div
      ref={dropdownRef}
      role="listbox"
      aria-labelledby={id}
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        minWidth: coords.width,
        width: 'max-content',
        zIndex: 9999,
      }}
      className={cn(
        'border border-line bg-bg-elevated shadow-sm',
        'transition-all duration-150 origin-top max-h-60 overflow-y-auto',
        open
          ? 'opacity-100 scale-y-100 pointer-events-auto'
          : 'opacity-0 scale-y-95 pointer-events-none',
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="option"
            aria-selected={active}
            onClick={() => { onChange(opt.value); setOpen(false) }}
            className={cn(
              'flex items-center justify-between gap-6 w-full px-4 py-2.5 text-left text-caption whitespace-nowrap transition-colors',
              active ? 'text-ink font-bold bg-bg-sunken' : 'text-ink-soft hover:text-ink hover:bg-bg-sunken',
            )}
          >
            {opt.label}
            {active && <Check size={11} strokeWidth={2.5} className="text-ink shrink-0" />}
          </button>
        )
      })}
    </div>
  )

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        id={id}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={triggerCls}
      >
        <span className={selected ? 'text-ink' : 'text-ink-faint'}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={12}
          strokeWidth={2}
          className={cn(
            'shrink-0 transition-transform duration-200',
            open ? 'rotate-180' : 'rotate-0',
            variant === 'pill' && open ? 'text-bg' : 'text-ink-muted',
          )}
        />
      </button>

      {mounted && createPortal(dropdown, document.body)}
    </div>
  )
}
