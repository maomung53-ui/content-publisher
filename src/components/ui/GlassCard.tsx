import React from 'react'

export interface GlassCardProps {
  children: React.ReactNode
  hoverable?: boolean
  padding?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
  animationDelay?: string
}

/**
 * 液态玻璃卡片
 * 45° 高光渐变 + 双实线边框 + 4 层阴影 + ::after 光晕
 */
export default function GlassCard({
  children,
  hoverable = false,
  padding = 'md',
  className = '',
  onClick,
  animationDelay,
}: GlassCardProps) {
  const isInteractive = hoverable || !!onClick
  const pad = { sm: 'p-6', md: 'p-8', lg: 'p-10' }[padding]

  return (
    <div
      onClick={onClick}
      className={[
        'liquid-glass',
        isInteractive ? 'liquid-glass-hoverable' : '',
        isInteractive ? 'cursor-pointer select-none' : '',
        pad,
        animationDelay ? 'animate-spring-in opacity-0 [animation-fill-mode:forwards]' : '',
        className,
      ].filter(Boolean).join(' ')}
      style={animationDelay ? { animationDelay } : undefined}
    >
      {children}
    </div>
  )
}
