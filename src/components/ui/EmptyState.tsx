import React from 'react'

export interface EmptyStateProps {
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

/**
 * Apple 风格空状态 — 极简 / 无 emoji
 */
export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 animate-spring-in">
      {/* 极细圆形图标 */}
      <svg className="w-12 h-12 text-text-tertiary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <path d="M8 12h8M12 8v8" />
      </svg>
      <h3 className="text-heading text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-body-sm text-text-secondary text-center max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <button onClick={action.onClick}
          className="px-5 py-2 rounded-md bg-accent-blue text-white text-body-sm font-medium
                     hover:bg-accent-blue-hover active:scale-[0.98] transition-all duration-200">
          {action.label}
        </button>
      )}
    </div>
  )
}
