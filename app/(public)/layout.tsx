import { LenisProvider } from '@/lib/lenis'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      <PublicNav />
      <main id="main-content" className="pt-[60px]">
        {children}
      </main>
      <PublicFooter />
    </LenisProvider>
  )
}
