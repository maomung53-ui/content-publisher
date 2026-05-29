/** 预览组件通用 Props */
export interface PreviewProps {
  title: string
  body: string
  tags: string[]
  imageCount: number
}

/**
 * 微信公众号文章预览
 * 模拟 375px 手机宽度内的公众号排版效果
 */
export default function PreviewWechat({ title, body, tags, imageCount }: PreviewProps) {
  const paragraphs = (body || '').split('\n\n').filter(Boolean)

  return (
    <div className="flex justify-center py-4">
      {/* 手机外框 */}
      <div className="w-[375px] rounded-[24px] border border-divider-light bg-white shadow-lg overflow-hidden">
        {/* 公众号顶部栏 */}
        <div className="px-5 pt-10 pb-3 border-b border-divider-light">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-status-success/20 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#34c759" strokeWidth="2">
                <circle cx="8" cy="8" r="6" />
                <path d="M5 8l2 2 4-4" />
              </svg>
            </div>
            <span className="text-caption text-text-secondary">公众号</span>
          </div>
        </div>

        {/* 文章内容 */}
        <div className="px-5 py-4">
          {/* 标题 */}
          <h1 className="text-[22px] font-semibold text-text-primary leading-snug mb-3">
            {title || '无标题'}
          </h1>

          {/* 作者 + 时间 */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[14px] text-text-secondary">作者</span>
            <span className="text-[14px] text-text-tertiary">{new Date().toLocaleDateString('zh-CN')}</span>
          </div>

          {/* 正文 */}
          <div className="text-[14px] text-[#333] leading-[1.8] space-y-4">
            {paragraphs.map((p, i) => renderParagraph(p, i, imageCount))}
          </div>

          {/* 标签 */}
          {tags.length > 0 && (
            <div className="mt-5 pt-4 border-t border-divider-light">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-sm text-caption text-accent-blue bg-accent-blue/[0.06]">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 底部 */}
          <div className="mt-6 pt-4 border-t border-divider-light flex items-center justify-between">
            <span className="text-[12px] text-text-tertiary">阅读 1000+</span>
            <div className="flex items-center gap-3 text-text-tertiary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.8 12l-8-8-8 8M4 14v6h16v-6"/></svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l3 6h6l-4.8 3.6L18 18l-6-4.8L6 18l1.8-6.4L3 8h6l3-6z"/></svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 4h12v14l-6-4-6 4V4z"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** 渲染段落——处理外链提示和图片占位 */
function renderParagraph(text: string, key: number, imageCount: number) {
  // 外链提示
  if (text.includes('（详见原文链接）')) {
    const parts = text.split('（详见原文链接）')
    return (
      <p key={key}>
        {parts[0]}
        <span className="text-accent-blue">（详见原文链接）</span>
      </p>
    )
  }

  // 图片占位检测
  if (/!\[.*?\]\(.*?\)/.test(text)) {
    const altMatch = text.match(/!\[(.*?)\]/)
    const alt = altMatch?.[1] ?? '图片'
    return (
      <div key={key} className="flex flex-col items-center py-4">
        <div className="w-full h-40 rounded-md bg-[#f0f0f2] flex items-center justify-center">
          <div className="text-center">
            <svg className="w-8 h-8 text-text-tertiary mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
            </svg>
            <span className="text-caption text-text-tertiary">{alt}</span>
          </div>
        </div>
      </div>
    )
  }

  return <p key={key}>{text}</p>
}
