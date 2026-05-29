import { useEffect, useRef, useState } from 'react'

interface UseRevealOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
  delay?: number
}

/**
 * IntersectionObserver Hook
 * 卡片进入视口时触发入场动画，支持 stagger 延迟
 *
 * @example
 * const { ref, isVisible } = useRevealOnScroll({ delay: 200 })
 * <GlassCard ref={ref} className={isVisible ? 'animate-scale-in' : 'opacity-0'} />
 */
export function useRevealOnScroll(options: UseRevealOptions = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -40px 0px', once = true, delay = 0 } = options
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (once) observer.unobserve(node)
          timerRef.current = setTimeout(() => setIsVisible(true), delay)
        } else if (!once) {
          if (timerRef.current) clearTimeout(timerRef.current)
          setIsVisible(false)
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(node)
    return () => {
      observer.disconnect()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [threshold, rootMargin, once, delay])

  return { ref, isVisible }
}
