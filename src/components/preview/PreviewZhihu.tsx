import type { PreviewProps } from './PreviewWechat'

/**
 * 知乎回答预览
 * 模拟知乎回答排版——蓝色话题、引用块、深色代码块
 */
export default function PreviewZhihu({ title, body, tags, imageCount }: PreviewProps) {
  const paragraphs = (body || '').split('\n\n').filter(Boolean)

  return (
    <div className="flex justify-center py-4">
      <div className="w-full max-w-[600px] bg-white rounded-lg border border-divider-light shadow-sm p-6">
        {/* 话题标签 */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-pill text-[14px] text-[#0066FF] bg-[#0066FF]/[0.06]">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 标题 */}
        <h1 className="text-[20px] font-semibold text-[#1a1a1a] leading-snug mb-4">
          {title || '无标题'}
        </h1>

        {/* 正文 */}
        <div className="text-[15px] text-[#1a1a1a] leading-[1.75] space-y-4">
          {paragraphs.map((p, i) => renderZhihuParagraph(p, i, imageCount))}
        </div>

        {/* 底部互动 */}
        <div className="mt-6 pt-4 border-t border-divider-light flex items-center gap-6">
          <span className="flex items-center gap-1 text-caption text-text-tertiary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 3l10 9-10 9"/></svg>
            赞同 1.2k
          </span>
          <span className="text-caption text-text-tertiary">评论 89</span>
          <span className="text-caption text-text-tertiary">收藏</span>
        </div>
      </div>
    </div>
  )
}

/** 知乎段落渲染——处理引用块和代码块 */
function renderZhihuParagraph(text: string, key: number, imageCount: number) {
  // 以 > 开头的引用块文本
  if (text.startsWith('>') || /^[> ]+/.test(text)) {
    const cleaned = text.replace(/^[> ]+/gm, '')
    return (
      <blockquote key={key} className="border-l-[3px] border-[#0066FF] pl-4 py-2 text-[15px] text-text-secondary">
        {cleaned}
      </blockquote>
    )
  }

  // 检测内联代码块（以 ``` 标记）
  const codeMatch = text.match(/```(\w*)\n([\s\S]*?)```/)
  if (codeMatch) {
    const before = text.slice(0, text.indexOf('```'))
    const code = codeMatch[2].trim()
    const after = text.slice(text.lastIndexOf('```') + 3)
    return (
      <div key={key}>
        {before && <p>{before}</p>}
        <pre className="my-3 rounded-sm bg-[#2d2d2d] p-3 text-[13px] text-[#e0e0e0] font-mono leading-relaxed overflow-x-auto">
          {code}
        </pre>
        {after && <p className="mt-2">{after}</p>}
      </div>
    )
  }

  return <p key={key}>{text}</p>
}
