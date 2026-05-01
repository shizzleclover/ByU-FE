'use client'

import dynamic from 'next/dynamic'
import animationData from '@/public/animations/verified.json'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

interface Props {
  size?: number
  loop?: boolean
}

export function VerifiedAnimation({ size = 100, loop = false }: Props) {
  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay
      style={{ width: size, height: size }}
    />
  )
}
