import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { apiGet } from '@/lib/api'
import { Hairline } from '@/components/editorial/Hairline'
import { Overline } from '@/components/editorial/Overline'
import type { Project, Profile } from '@/types/api'

interface PageData { project: Project; profile: Profile }

async function getData(username: string, slug: string): Promise<PageData | null> {
  try {
    return await apiGet<PageData>(`/canvas/${username}/projects/${slug}`)
  } catch { return null }
}

export async function generateMetadata({
  params,
}: { params: Promise<{ username: string; slug: string }> }): Promise<Metadata> {
  const { username, slug } = await params
  const data = await getData(username, slug)
  if (!data) return { title: 'Not Found' }
  return {
    title: `${data.project.title} — ${data.profile.fullName}`,
    description: data.project.tagline,
    openGraph: { images: data.project.coverUrl ? [data.project.coverUrl] : [] },
  }
}

export default async function ProjectPage({
  params,
}: { params: Promise<{ username: string; slug: string }> }) {
  const { username, slug } = await params
  const data = await getData(username, slug)
  if (!data) notFound()

  const { project, profile } = data

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
          {' / PROJECTS / '}
          <span>{project.title.toUpperCase()}</span>
        </p>
      </div>

      {/* Hero cover */}
      {project.coverUrl && (
        <div className="relative w-full aspect-[16/7] overflow-hidden">
          <Image
            src={project.coverUrl}
            alt={`Cover image for ${project.title}`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 container-content pb-10">
            <h1 className="text-h1 font-bold text-bg leading-none">{project.title}</h1>
            {project.tagline && (
              <p className="text-lead text-bg/80 mt-3">{project.tagline}</p>
            )}
          </div>
        </div>
      )}

      <div className="container-narrow py-12">
        {!project.coverUrl && (
          <>
            <h1 className="text-h1 font-bold text-ink leading-none">{project.title}</h1>
            {project.tagline && <p className="text-lead text-ink-soft mt-4">{project.tagline}</p>}
          </>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-3 mt-6 mb-8">
          {project.techStack.map((t) => (
            <span key={t} className="text-overline border border-line px-2 py-1 text-ink-muted">
              {t}
            </span>
          ))}
          <Link href={`/${username}`} className="text-overline text-ink-muted hover:text-ink transition-colors ml-auto">
            BY {username.toUpperCase()} →
          </Link>
        </div>

        <Hairline />

        {/* Body */}
        {project.descriptionHtml ? (
          <div
            className="prose-body mt-8"
            dangerouslySetInnerHTML={{ __html: project.descriptionHtml }}
          />
        ) : project.description ? (
          <p className="prose-body mt-8">{project.description}</p>
        ) : null}

        {/* Gallery */}
        {project.gallery.length > 0 && (
          <div className="mt-12">
            <Overline className="mb-6">GALLERY</Overline>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.gallery.map((img) => (
                <div key={img._id ?? img.publicId} className="relative aspect-[4/3] overflow-hidden">
                  <Image src={img.url} alt={img.caption ?? project.title} fill className="object-cover" />
                  {img.caption && (
                    <p className="absolute bottom-0 left-0 right-0 bg-ink/60 text-bg text-caption px-3 py-2">
                      {img.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* External links */}
        {project.links.length > 0 && (
          <div className="mt-12 border-t border-line pt-8">
            <Overline className="mb-6">LINKS</Overline>
            <div className="flex flex-col gap-3">
              {project.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-h5 font-bold text-ink hover:text-ink-soft transition-colors flex items-center gap-2"
                >
                  {link.label} →
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

export const revalidate = 300
