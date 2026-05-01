import Link from 'next/link'
import { Logo } from '@/components/icons/Logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 py-16">
      <Link href="/" className="mb-12">
        <Logo size={44} href="" />
      </Link>
      <div className="w-full max-w-[420px]">
        {children}
      </div>
    </main>
  )
}
