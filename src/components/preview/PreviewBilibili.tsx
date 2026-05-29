import type { PreviewProps } from './PreviewWechat'

/**
 * B站视频简介预览
 * 模拟 B站视频下方简介区域——封面、标题截断、灰色标签
 */
export default function PreviewBilibili({ title, body, tags, imageCount }: PreviewProps) {
  // 限制标题 2 行（约 40 字）
  const truncatedTitle = title.length > 40 ? title.slice(0, 40) + '...' : title
  // 限制正文 3 行（约 80 字）
  const safeBody = body || ''
  const truncatedBody = safeBody.length > 80 ? safeBody.slice(0, 80) + '...' : safeBody

  return (
    <div className="flex justify-center py-4">
      <div className="w-[320px] bg-white rounded-lg border border-divider-light shadow-sm overflow-hidden">
        {/* 视频封面占位 */}
        <div className="relative w-full bg-[#f0f0f2]" style={{ paddingBottom: '56.25%' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          {/* 时长 */}
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-sm bg-black/60 text-white text-[11px]">
            10:24
          </span>
        </div>

        <div className="p-3">
          {/* 标题——最多 2 行 */}
          <h1 className="text-[14px] font-medium text-text-primary leading-snug line-clamp-2 mb-1">
            {truncatedTitle || '无标题'}
          </h1>

          {/* 播放数据 */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[12px] text-text-tertiary">播放 3.2万</span>
            <span className="text-[12px] text-text-tertiary">弹幕 128</span>
            <span className="text-[12px] text-text-tertiary">2天前</span>
          </div>

          {/* 简介——最多 3 行 */}
          <p className="text-[12px] text-[#999] leading-relaxed line-clamp-3 mb-2">
            {truncatedBody}
          </p>

          {/* 标签 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-sm text-[12px] text-text-secondary bg-black/[0.04]">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
