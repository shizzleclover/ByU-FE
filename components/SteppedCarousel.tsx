'use client'

import { useRef, useEffect, useState } from 'react'

interface CarouselItem {
  id: string
  image: string
  alt: string
}

interface SteppedCarouselProps {
  items: CarouselItem[]
}

export function SteppedCarousel({ items }: SteppedCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)

  // Auto-scroll effect
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let animationFrameId: number
    let scrollPos = 0

    const scroll = () => {
      scrollPos += 0.5
      const maxScroll = container.scrollWidth - container.clientWidth
      if (scrollPos > maxScroll) {
        scrollPos = 0
      }
      container.scrollLeft = scrollPos
      setScrollPosition(scrollPos)
      animationFrameId = requestAnimationFrame(scroll)
    }

    animationFrameId = requestAnimationFrame(scroll)

    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  // Duplicate items for infinite loop
  const duplicatedItems = [...items, ...items, ...items]

  return (
    <div className="w-full bg-background overflow-hidden">
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scroll-smooth no-scrollbar"
        style={{ scrollBehavior: 'auto' }}
      >
        <div className="flex gap-0 pb-8">
          {duplicatedItems.map((item, index) => {
            // Calculate scale and height based on position in carousel
            const itemsPerView = 5
            const positionInView = (index % itemsPerView)
            const scale = 0.6 + (positionInView / itemsPerView) * 0.8
            const height = 200 + positionInView * 150
            const width = 300 * scale

            return (
              <div
                key={`${item.id}-${index}`}
                className="flex-shrink-0 relative bg-muted border-2 border-border overflow-hidden"
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  transform: `translateY(${positionInView * 60}px)`,
                  transition: 'none',
                }}
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
