import React, { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
  duration?: number
}

export interface ToastItemProps {
  toast: ToastMessage
  onDismiss: (id: string) => void
}

const typeIcons: Record<ToastType, string> = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }
const typeColors: Record<ToastType, string> = {
  success: 'text-status-success',
  error: 'text-status-error',
  warning: 'text-status-warning',
  info: 'text-accent-blue',
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const duration = toast.duration ?? 3000
    const fadeTimer = setTimeout(() => setExiting(true), duration - 300)
    const removeTimer = setTimeout(() => onDismiss(toast.id), duration)
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer) }
  }, [toast, onDismiss])

  return (
    <div className={[
      'flex items-center gap-3 px-4 py-3 min-w-[280px] max-w-[420px]',
      'bg-surface-glass backdrop-blur-glass-heavy',
      'border border-divider-light rounded-md shadow-float',
      exiting ? 'animate-fade-in opacity-0 [animation-direction:reverse]' : 'animate-spring-in',
      'transition-opacity duration-300',
    ].join(' ')}>
      <span className={['text-base font-semibold flex-shrink-0', typeColors[toast.type]].join(' ')}>
        {typeIcons[toast.type]}
      </span>
      <span className="text-body-sm text-text-primary leading-snug">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-auto flex-shrink-0 w-5 h-5 rounded-full bg-black/[0.06] text-text-tertiary text-xs
                   hover:bg-black/[0.1] hover:text-text-primary transition-colors flex items-center justify-center"
      >
        ✕
      </button>
    </div>
  )
}

export interface ToastContainerProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

/**
 * Apple 风格通知容器 — 右上角固定 / spring-in 入场 / 自动消失
 */
export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed top-8 right-8 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
}
