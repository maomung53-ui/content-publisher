import React from 'react'

export interface EmptyStateProps {
  icon: string
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

/**
 * Apple 风格空状态 — 居中 / 大图标 / 标题 / 描述 / 可选按钮
 */
export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 animate-spring-in">
      <span className="text-[56px] mb-4 select-none">{icon}</span>
      <h3 className="text-heading text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-body-sm text-text-secondary text-center max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2 rounded-md bg-accent-blue text-white text-body-sm font-medium
                     hover:bg-accent-blue-hover active:scale-[0.98] transition-all duration-200"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
