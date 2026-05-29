/** 平台适配图标 — 16×16 线性 */
export default function IconLink({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3" />
      <path d="M14 2L7 9m7-7H10m4 0v4" />
    </svg>
  )
}
