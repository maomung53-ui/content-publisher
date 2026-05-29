import React, { useState, useCallback, useMemo } from 'react'
import { Platform, platformRules, platformColors } from '../config/platformRules'
import { parseMarkdown } from '../utils/contentParser'
import { adaptAllPlatforms } from '../utils/platformAdapter'
import type { AdaptedContent } from '../utils/platformAdapter'
import type { ContentMetadata } from '../utils/contentParser'

/** 所有平台列表 */
const ALL_PLATFORMS: Platform[] = [
  Platform.wechat,
  Platform.zhihu,
  Platform.xiaohongshu,
  Platform.bilibili,
]

/**
 * 平台适配页面
 *
 * 读取「内容编辑」页持久化的解析结果，根据各平台规则对内容进行适配转换，
 * 并以卡片形式展示每个平台的适配结果。
 */
export default function PlatformAdapt() {
  // ---- 状态 ----

  /** 选中的平台集合（默认全选） */
  const [selected, setSelected] = useState<Set<Platform>>(new Set(ALL_PLATFORMS))
  /** 适配结果列表 */
  const [results, setResults] = useState<AdaptedContent[] | null>(null)
  /** 是否正在执行适配 */
  const [adapting, setAdapting] = useState<boolean>(false)

  // ---- 从 localStorage 读取数据 ----

  /** 从 ContentEdit 页面持久化的原始 Markdown 内容 */
  const rawContent = useMemo<string | null>(() => {
    return localStorage.getItem('lastRawContent')
  }, [])

  /** 从 ContentEdit 页面持久化的解析元数据（用于初始展示） */
  const cachedMetadata = useMemo<ContentMetadata | null>(() => {
    try {
      const raw = localStorage.getItem('lastContentMetadata')
      if (!raw) return null
      return JSON.parse(raw) as ContentMetadata
    } catch {
      return null
    }
  }, [])

  /** 是否有可用的内容数据 */
  const hasContent = rawContent !== null && rawContent.trim().length > 0

  // ---- 事件处理 ----

  /** 切换平台选中状态 */
  const togglePlatform = useCallback((platform: Platform) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(platform)) {
        next.delete(platform)
      } else {
        next.add(platform)
      }
      return next
    })
    // 切换平台时清除旧结果，避免展示不一致
    setResults(null)
  }, [])

  /** 执行适配：重新解析 Markdown → 对选中平台逐一适配 */
  const handleAdapt = useCallback(() => {
    if (!rawContent) return
    setAdapting(true)

    // 用微延迟展示加载状态（解析很快，但给用户视觉反馈）
    const start = performance.now()
    const selectedList = Array.from(selected)

    // 重新解析 Markdown 获取最新元数据
    const parseResult = parseMarkdown(rawContent)

    if (!parseResult.success || !parseResult.data) {
      setAdapting(false)
      alert(parseResult.error?.message ?? '内容解析失败，请返回编辑页面检查内容')
      return
    }

    // 对所有选中平台执行适配
    const adapted = adaptAllPlatforms(parseResult.data, selectedList)
    setResults(adapted)

    // 确保 loading 至少展示 300ms，避免闪烁
    const elapsed = performance.now() - start
    const remaining = Math.max(0, 300 - elapsed)
    setTimeout(() => setAdapting(false), remaining)
  }, [rawContent, selected])

  // ---- 渲染 ----

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* 页面标题 */}
      <h1 className="text-xl font-bold text-app-text-primary mb-1">平台适配</h1>
      <p className="text-sm text-app-text-secondary mb-6">根据各平台规则自动转换内容格式，预览适配结果</p>

      {/* ===== 空状态：无内容数据 ===== */}
      {!hasContent && (
        <div className="rounded-lg border border-dashed border-app-border bg-app-bg-tertiary p-10 text-center">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-app-text-primary font-medium mb-2">尚未解析内容</p>
          <p className="text-app-text-secondary text-sm mb-4">
            请先前往「内容编辑」页面输入 Markdown 内容并展开解析面板，
            <br />
            系统会自动保存解析结果供本页面使用。
          </p>
          <code className="inline-block px-3 py-1 rounded bg-app-bg-primary border border-app-border text-xs text-app-text-muted font-mono">
            内容编辑 → 输入 Markdown → 展开 📊 内容解析结果 → 回到本页
          </code>
        </div>
      )}

      {/* ===== 有内容数据时显示操作区 ===== */}
      {hasContent && (
        <>
          {/* 平台选择区 */}
          <div className="mb-5">
            <h2 className="text-sm font-medium text-app-text-secondary mb-3">选择目标平台</h2>
            <div className="flex flex-wrap gap-3">
              {ALL_PLATFORMS.map((platform) => {
                const rule = platformRules[platform]
                const color = platformColors[platform]
                const isSelected = selected.has(platform)

                return (
                  <button
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                    style={{
                      borderColor: isSelected ? color : 'var(--app-border, #2a2d3a)',
                      backgroundColor: isSelected ? `${color}18` : 'var(--app-bg-tertiary, #1e2130)',
                      color: isSelected ? color : 'var(--app-text-secondary, #9aa1b0)',
                      boxShadow: isSelected ? `0 0 0 1px ${color}40` : 'none',
                    }}
                  >
                    {/* 品牌色圆点 */}
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span>{rule.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 执行适配按钮 */}
          <button
            onClick={handleAdapt}
            disabled={adapting || selected.size === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium
                       bg-app-accent text-white hover:bg-app-accent-hover
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {adapting ? (
              <>
                {/* 加载旋转图标 */}
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>适配中...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>执行适配</span>
              </>
            )}
          </button>

          {/* 无选中平台提示 */}
          {selected.size === 0 && (
            <p className="mt-2 text-xs text-app-text-muted">请至少选择一个目标平台</p>
          )}

          {/* ===== 适配结果卡片 ===== */}
          {results && results.length > 0 && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {results.map((adapted) => {
                const color = platformColors[adapted.platform]
                const rule = platformRules[adapted.platform]

                return (
                  <div
                    key={adapted.platform}
                    className="rounded-lg border border-app-border bg-app-bg-tertiary overflow-hidden"
                  >
                    {/* 卡片标题栏 */}
                    <div
                      className="flex items-center gap-2 px-4 py-3 border-b"
                      style={{ borderColor: 'var(--app-border, #2a2d3a)' }}
                    >
                      <span
                        className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm font-semibold text-app-text-primary">
                        {rule.name}
                      </span>
                    </div>

                    {/* 卡片正文 */}
                    <div className="px-4 py-3 space-y-3">
                      {/* 标题 */}
                      <div>
                        <span className="text-xs text-app-text-muted">标题</span>
                        <p className="text-sm font-bold text-app-text-primary mt-0.5 break-all">
                          {adapted.title || '(无标题)'}
                        </p>
                      </div>

                      {/* 正文预览（前 200 字） */}
                      <div>
                        <span className="text-xs text-app-text-muted">
                          正文预览（{Math.min(adapted.body.length, 200)} / {adapted.body.length} 字）
                        </span>
                        <p className="text-xs text-app-text-secondary mt-0.5 leading-relaxed whitespace-pre-wrap break-all">
                          {adapted.body.slice(0, 200)}
                          {adapted.body.length > 200 && ' ...'}
                        </p>
                      </div>

                      {/* 标签列表 */}
                      <div>
                        <span className="text-xs text-app-text-muted">
                          标签（{adapted.tags.length} 个）
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {adapted.tags.length > 0 ? (
                            adapted.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 rounded text-xs"
                                style={{ backgroundColor: `${color}20`, color }}
                              >
                                #{tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-app-text-muted">无标签</span>
                          )}
                        </div>
                      </div>

                      {/* 图片数量 */}
                      <div>
                        <span className="text-xs text-app-text-muted">图片数量</span>
                        <p className="text-sm text-app-text-primary mt-0.5">
                          {adapted.imageCount} 张
                          {rule.maxImages > 0 && `（上限 ${rule.maxImages} 张）`}
                        </p>
                      </div>

                      {/* 警告信息 */}
                      {adapted.warnings.length > 0 && (
                        <div className="rounded border border-yellow-700/40 bg-yellow-900/20 px-3 py-2">
                          <span className="text-xs font-medium text-yellow-400 flex items-center gap-1 mb-1">
                            <span>⚠️</span>
                            <span>适配警告</span>
                          </span>
                          <ul className="space-y-0.5">
                            {adapted.warnings.map((warning, i) => (
                              <li key={i} className="text-xs text-yellow-300/80">{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* 已执行但无结果（如未选中平台） */}
          {results !== null && results.length === 0 && (
            <p className="mt-4 text-sm text-app-text-muted text-center">未选中任何平台，适配未执行</p>
          )}
        </>
      )}
    </div>
  )
}
