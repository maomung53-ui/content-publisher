import type { PreviewProps } from './PreviewWechat'

/**
 * 小红书笔记预览
 * 模拟小红书笔记卡片——头像、图片网格、粉色标签
 */
export default function PreviewXiaohongshu({ title, body, tags, imageCount }: PreviewProps) {
  const paragraphs = body.split('\n\n').filter(Boolean)
  // 短句处理：将\n也视为分行
  const lines = body.split('\n').filter((l) => l.trim())

  return (
    <div className="flex justify-center py-4">
      <div className="w-[340px] bg-white rounded-xl border border-divider-light shadow-sm overflow-hidden">
        {/* 图片区域 */}
        {imageCount > 0 && (
          <div className={[
            'grid gap-0.5',
            imageCount === 1 ? 'grid-cols-1' : imageCount === 2 ? 'grid-cols-2' : 'grid-cols-2',
          ].join(' ')}>
            {Array.from({ length: Math.min(imageCount, 4) }).map((_, i) => (
              <div
                key={i}
                className="bg-[#f0f0f2] flex items-center justify-center"
                style={{ height: imageCount === 1 ? '200px' : '160px' }}
              >
                <svg className="w-8 h-8 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
              </div>
            ))}
          </div>
        )}

        <div className="p-4">
          {/* 标题 */}
          <h1 className="text-[16px] font-semibold text-text-primary leading-snug mb-3">
            {title || '无标题'}
          </h1>

          {/* 正文——短句分段 */}
          <div className="text-[14px] text-[#333] leading-[1.7] space-y-1.5 mb-4">
            {lines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          {/* 话题标签 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span key={tag} className="text-[12px] text-[#fe2c55]">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 底部互动 */}
          <div className="flex items-center justify-between pt-3 border-t border-divider-light">
            <span className="flex items-center gap-1 text-[12px] text-text-tertiary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.8 4.6c-2-2.1-5.4-2.1-7.4 0L12 6l-1.4-1.4c-2-2.1-5.4-2.1-7.4 0-2 2-2 5.3 0 7.3l8.8 8.8 8.8-8.8c2-2 2-5.3 0-7.3z"/></svg>
              1.2k
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary"><path d="M6 4h12v14l-6-4-6 4V4z"/></svg>
          </div>
        </div>
      </div>
    </div>
  )
}
