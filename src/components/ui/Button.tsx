import React from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

const baseStyles: Record<ButtonVariant, string> = {
  primary: 'bg-accent-blue !text-white hover:bg-accent-blue-hover active:bg-accent-blue-active shadow-button hover:shadow-button-hover',
  secondary: 'bg-surface-card text-text-primary border border-divider-light hover:bg-surface-card-hover',
  tertiary: 'text-accent-blue bg-transparent hover:bg-accent-blue/[0.06] active:bg-accent-blue/[0.1]',
  ghost: 'text-text-secondary bg-transparent hover:bg-black/[0.04] hover:text-text-primary active:bg-black/[0.07]',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-body-sm',
  md: 'h-11 px-6 text-body-sm',
  lg: 'h-13 px-8 text-body',
}

/**
 * Apple 液态玻璃按钮
 * liquid-glass-sm 提供 45° 高光 + 多层内阴影 + 双线边框
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  onClick,
  className = '',
}: ButtonProps) {
  const isDisabled = disabled || loading
  const isSecondary = variant === 'secondary'

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2 font-medium tracking-[-0.01em] rounded-md',
        'transition-all duration-200',
        'hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98]',
        isSecondary ? 'liquid-glass-sm' : '',
        baseStyles[variant],
        sizeStyles[size],
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].filter(Boolean).join(' ')}
    >
      {loading && (
        <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
