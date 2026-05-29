import React from 'react'

export interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

/**
 * iOS 风格开关 — 明亮版
 * 轨道 52×32 / 滑块 28px / spring 350ms 过渡
 */
export default function ToggleSwitch({ checked, onChange, disabled = false }: ToggleSwitchProps) {
  return (
    <label className={['relative inline-flex items-center', disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'].join(' ')}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      {/* 轨道 */}
      <div className={[
        'w-[52px] h-[32px] rounded-pill transition-all duration-[350ms]',
        checked ? 'bg-accent-blue' : 'bg-[#e0e0e5]',
      ].join(' ')} />
      {/* 滑块 */}
      <div className={[
        'absolute top-0.5 w-[28px] h-[28px] rounded-full bg-white shadow-sm',
        'transition-all duration-[350ms]',
        checked ? 'translate-x-[22px]' : 'translate-x-[2px]',
      ].join(' ')} />
    </label>
  )
}
