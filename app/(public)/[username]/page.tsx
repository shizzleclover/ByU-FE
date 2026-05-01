import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { apiGet } from '@/lib/api'
import { CanvasView } from '@/features/canvas/CanvasView'
import type { CanvasResponse } from '@/types/api'

const RESERVED = ['discover', 'dashboard', 'admin', 'signin', 'signup', 'verify-email',
  'forgot-password', 'reset-password', 'about', 'terms', 'privacy', 'api']

interface Props {
  params: Promise<{ username: string }>
}

async function getCanvas(username: string): Promise<CanvasResponse | null> {
  try {
    return await apiGet<CanvasResponse>(`/canvas/${username}`)
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const canvas = await getCanvas(username)
  if (!canvas) return { title: 'Not Found' }
  return {
    title: canvas.profile.fullName,
    description: canvas.profile.bio ?? `${canvas.profile.fullName} on ByU Connect`,
    openGraph: {
      title: `${canvas.profile.fullName} — ByU Connect`,
      description: canvas.profile.bio,
      images: canvas.profile.avatarUrl ? [canvas.profile.avatarUrl] : [],
    },
  }
}

export default async function CanvasPage({ params }: Props) {
  const { username } = await params

  if (RESERVED.includes(username.toLowerCase())) notFound()

  const canvas = await getCanvas(username)
  if (!canvas) notFound()

  return <CanvasView canvas={canvas} />
}

export const revalidate = 300 // 5-minute ISR
