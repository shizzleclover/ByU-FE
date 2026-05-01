import { redirect } from 'next/navigation'

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  redirect(`/discover?category=${encodeURIComponent(category)}`)
}
