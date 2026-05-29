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
 * Apple 官网风格玻璃卡片
 * 纯白底 + 20px 高斯模糊 + 柔和阴影 + 20px 大圆角
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
        'bg-surface-card backdrop-blur-glass',
        'border border-divider-light',
        'rounded-2xl shadow-md',
        pad,
        isInteractive ? 'cursor-pointer select-none' : '',
        isInteractive
          ? 'transition-all duration-[400ms] hover:-translate-y-[2px] hover:shadow-lg active:translate-y-0 active:scale-[0.995]'
          : '',
        animationDelay ? 'animate-spring-in opacity-0 [animation-fill-mode:forwards]' : '',
        className,
      ].filter(Boolean).join(' ')}
      style={animationDelay ? { animationDelay } : undefined}
    >
      {children}
    </div>
  )
}
