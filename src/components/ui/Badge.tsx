import React from 'react'

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'error' | 'accent'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  children: React.ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
  neutral: 'bg-black/[0.06] text-text-secondary',
  success: 'bg-status-success/[0.12] text-status-success',
  warning: 'bg-status-warning/[0.12] text-status-warning',
  error: 'bg-status-error/[0.12] text-status-error',
  accent: 'bg-accent-blue/[0.08] text-accent-blue',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-label',
  md: 'px-2 py-1 text-caption',
}

/**
 * Apple 风格徽标 — 药丸圆角 / 低饱和背景
 */
export default function Badge({ variant = 'neutral', size = 'sm', children }: BadgeProps) {
  return (
    <span className={['inline-flex items-center rounded-pill font-medium', variantStyles[variant], sizeStyles[size]].join(' ')}>
      {children}
    </span>
  )
}
