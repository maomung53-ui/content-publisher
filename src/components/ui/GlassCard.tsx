import React, { forwardRef } from 'react'

export interface GlassCardProps {
  children: React.ReactNode
  hoverable?: boolean
  padding?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
  animationDelay?: string
  /** 内联样式（用于 stagger transition-delay 等） */
  style?: React.CSSProperties
  /** 是否启用滚动入场动画（需配合父组件 useRevealOnScroll） */
  reveal?: boolean
  /** 是否启用涟漪点击效果 */
  ripple?: boolean
}

/**
 * 液态玻璃卡片
 * 支持 hover lift + ripple + reveal 入场动画
 */
const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
  {
    children,
    hoverable = false,
    padding = 'md',
    className = '',
    onClick,
    animationDelay,
    style,
    reveal = false,
    ripple = false,
  },
  ref,
) {
  const isInteractive = hoverable || !!onClick
  const pad = { sm: 'p-6', md: 'p-8', lg: 'p-10' }[padding]

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={[
        'liquid-glass',
        isInteractive ? 'liquid-glass-hoverable' : '',
        isInteractive ? 'hover-lift' : '',
        isInteractive ? 'cursor-pointer select-none' : '',
        ripple ? 'ripple' : '',
        pad,
        reveal ? 'reveal-card' : '',
        animationDelay && !reveal ? 'animate-spring-in opacity-0 [animation-fill-mode:forwards]' : '',
        className,
      ].filter(Boolean).join(' ')}
      style={{
        ...style,
        ...(animationDelay && !reveal ? { animationDelay } : {}),
      }}
    >
      {/* 内容层 — 确保在伪元素之上 */}
      <div className="relative z-[1]">
        {children}
      </div>
    </div>
  )
})

export default GlassCard
