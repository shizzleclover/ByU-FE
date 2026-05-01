import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { apiGet } from '@/lib/api'
import { Hairline } from '@/components/editorial/Hairline'
import type { Story, Profile } from '@/types/api'

interface PageData { story: Story; profile: Profile }

async function getData(username: string, slug: string): Promise<PageData | null> {
  try {
    return await apiGet<PageData>(`/canvas/${username}/stories/${slug}`)
  } catch { return null }
}

export async function generateMetadata({
  params,
}: { params: Promise<{ username: string; slug: string }> }): Promise<Metadata> {
  const { username, slug } = await params
  const data = await getData(username, slug)
  if (!data) return { title: 'Not Found' }
  return {
    title: data.story.title,
    description: data.story.excerpt,
    openGraph: { images: data.story.coverUrl ? [data.story.coverUrl] : [] },
  }
}

export default async function StoryPage({
  params,
}: { params: Promise<{ username: string; slug: string }> }) {
  const { username, slug } = await params
  const data = await getData(username, slug)
  if (!data) notFound()

  const { story, profile } = data

  return (
    <article className="min-h-screen bg-bg">
      {/* Breadcrumb */}
      <div className="container-content pt-8 pb-4">
        <p className="text-overline text-ink-muted">
          <Link href="/" className="hover:text-ink transition-colors">BYU CONNECT</Link>
          {' / '}
          <Link href={`/${username}`} className="hover:text-ink transition-colors">
            {username.toUpperCase()}
          </Link>
          {' / STORIES'}
        </p>
      </div>

      {/* Cover */}
      {story.coverUrl && (
        <div className="relative w-full aspect-[3/2] max-h-[520px] overflow-hidden">
          <Image
            src={story.coverUrl}
            alt={story.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="container-prose py-12">
        <h1 className="text-h1 font-bold text-ink leading-none">{story.title}</h1>

        <p className="text-overline text-ink-muted mt-4">
          BY{' '}
          <Link href={`/${username}`} className="hover:text-ink transition-colors">
            {username.toUpperCase()}
          </Link>
          {' · '}
          {story.readingTimeMinutes} MIN READ
          {story.publishedAt
            ? ` · ${new Date(story.publishedAt).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}`
            : ''}
        </p>

        <Hairline className="mt-8 mb-8" />

        {story.bodyHtml ? (
          <div
            className="prose-body"
            dangerouslySetInnerHTML={{ __html: story.bodyHtml }}
          />
        ) : story.body ? (
          <div className="prose-body whitespace-pre-wrap">{story.body}</div>
        ) : null}
      </div>
    </article>
  )
}

export const revalidate = 300
