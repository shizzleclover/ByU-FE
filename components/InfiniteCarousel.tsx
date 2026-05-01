'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface CarouselItem {
  id: string
  image: string
  alt: string
}

interface InfiniteCarouselProps {
  items: CarouselItem[]
}

export function InfiniteCarousel({ items }: InfiniteCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let animationFrameId: number
    let currentScroll = 0
    const speed = 1 // pixels per frame

    const animate = () => {
      currentScroll += speed
      container.scrollLeft = currentScroll

      // Reset scroll when we reach the end of original items (half the container)
      if (currentScroll > container.scrollWidth / 2 - window.innerWidth) {
        currentScroll = 0
      }

      setScrollPosition(currentScroll)
      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  // Duplicate items for infinite loop effect
  const duplicatedItems = [...items, ...items, ...items]

  return (
    <div className="w-full overflow-hidden bg-background">
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-hidden scroll-smooth pb-12"
        style={{ scrollBehavior: 'auto' }}
      >
        {duplicatedItems.map((item, index) => {
          // Calculate scale based on position - items get larger as they progress
          const baseScale = 1
          const maxScale = 1.8
          const scaleIncrease = (index % items.length) / items.length
          const scale = baseScale + (maxScale - baseScale) * scaleIncrease

          return (
            <div
              key={`${item.id}-${index}`}
              className="flex-shrink-0 transition-transform duration-300"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'center bottom',
                minWidth: `${300 * scale}px`,
              }}
            >
              <div className="relative h-96 w-full border-2 border-border bg-secondary overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
