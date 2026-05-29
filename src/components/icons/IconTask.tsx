/** 任务中心图标 — 16×16 线性 */
export default function IconTask({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="12" height="12" rx="2" />
      <path d="M5 8h6M5 5h3m-3 6h4" />
    </svg>
  )
}
