import { useEffect, useState } from 'react'

/**
 * 简单视差 Hook
 * 元素随页面滚动以不同速度偏移，营造深度感
 *
 * @param speed — 视差速度倍率，默认 0.3
 * @returns 当前 Y 轴偏移像素值，用于 translateY 或 top
 */
export function useParallax(speed: number = 0.3): number {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * speed)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return offset
}
