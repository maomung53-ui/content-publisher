import React, { createContext, useContext, useReducer, useCallback } from 'react'
import ToastContainer from './Toast'
import type { ToastMessage, ToastType } from './Toast'

interface ToastState { toasts: ToastMessage[] }
type ToastAction =
  | { type: 'ADD'; payload: ToastMessage }
  | { type: 'REMOVE'; payload: string }

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void
}

const MAX_TOASTS = 3

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD': {
      const next = [...state.toasts, action.payload]
      if (next.length > MAX_TOASTS) return { toasts: next.slice(next.length - MAX_TOASTS) }
      return { toasts: next }
    }
    case 'REMOVE':
      return { toasts: state.toasts.filter((t) => t.id !== action.payload) }
    default:
      return state
  }
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast 必须在 ToastProvider 内部使用')
  return ctx
}

export interface ToastProviderProps { children: React.ReactNode }

let counter = 0
const nextId = () => `toast-${Date.now()}-${++counter}`

/**
 * Toast 通知系统 Provider
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] })

  const showToast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    dispatch({ type: 'ADD', payload: { id: nextId(), message, type, duration } })
  }, [])

  const dismissToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', payload: id })
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={state.toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}
