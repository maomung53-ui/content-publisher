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

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const duration = toast.duration ?? 3000
    const fadeTimer = setTimeout(() => setExiting(true), duration - 300)
    const removeTimer = setTimeout(() => onDismiss(toast.id), duration)
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer) }
  }, [toast, onDismiss])

  const colors: Record<ToastType, string> = {
    success: 'text-status-success',
    error: 'text-status-error',
    warning: 'text-status-warning',
    info: 'text-accent-blue',
  }

  return (
    <div className={[
      'flex items-center gap-3 px-4 py-3 min-w-[280px] max-w-[420px]',
      'liquid-glass-sm',
      exiting ? 'animate-fade-in opacity-0 [animation-direction:reverse]' : 'animate-spring-in',
      'transition-opacity duration-300',
    ].join(' ')}>
      <svg className={`w-4 h-4 flex-shrink-0 ${colors[toast.type]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        {toast.type === 'success' && <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />}
        {toast.type === 'error' && <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />}
        {toast.type === 'warning' && <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />}
        {toast.type === 'info' && <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></>}
      </svg>
      <span className="text-body-sm text-text-primary leading-snug">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-auto flex-shrink-0 w-5 h-5 rounded-full bg-black/[0.06] text-text-tertiary text-xs
                   hover:bg-black/[0.1] hover:text-text-primary transition-colors flex items-center justify-center"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M1 1l8 8M1 9l8-8" />
        </svg>
      </button>
    </div>
  )
}

export interface ToastContainerProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

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
