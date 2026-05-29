import React, { useState, useCallback, useMemo, useRef } from 'react'
import { Platform, platformRules, platformColors } from '../config/platformRules'
import { parseMarkdown } from '../utils/contentParser'
import { adaptAllPlatforms } from '../utils/platformAdapter'
import { aiAdaptContent } from '../services/aiService'
import type { AdaptedContent } from '../utils/platformAdapter'
import type { ContentMetadata } from '../utils/contentParser'
import type { AdaptationIntensity } from '../services/aiService'

// ===== 本地类型定义 =====

/** 单个平台的完整适配结果（含 AI 改写） */
interface PlatformResult {
  /** 格式适配后的内容 */
  adapted: AdaptedContent
  /** AI 改写后的 body（AI 模式且成功时有值） */
  aiBody: string | null
  /** AI 改写失败时的错误信息 */
  aiError: string | null
  /** 对比折叠区是否展开 */
  compareOpen: boolean
}

/** 所有平台列表 */
const ALL_PLATFORMS: Platform[] = [
  Platform.wechat,
  Platform.zhihu,
  Platform.xiaohongshu,
  Platform.bilibili,
]

/** 改写强度选项 */
const INTENSITY_OPTIONS: { value: AdaptationIntensity; label: string }[] = [
  { value: 'low', label: '低 — 仅润色格式' },
  { value: 'medium', label: '中 — 微调语气' },
  { value: 'high', label: '高 — 深度改写' },
]

/**
 * 平台适配页面
 *
 * 读取 ContentEdit 页持久化的解析结果，先执行格式适配（platformAdapter），
 * 可选调用 DeepSeek AI 进行跨平台文案风格改写，并以卡片展示结果。
 */
export default function PlatformAdapt() {
  // ---- 状态 ----

  /** 选中的平台集合（默认全选） */
  const [selected, setSelected] = useState<Set<Platform>>(new Set(ALL_PLATFORMS))
  /** 适配结果列表 */
  const [results, setResults] = useState<PlatformResult[] | null>(null)
  /** 是否正在执行格式适配 */
  const [adapting, setAdapting] = useState<boolean>(false)
  /** 是否正在执行 AI 改写 */
  const [aiRunning, setAiRunning] = useState<boolean>(false)
  /** 是否启用 AI 风格适配 */
  const [aiEnabled, setAiEnabled] = useState<boolean>(false)
  /** AI 改写强度 */
  const [aiIntensity, setAiIntensity] = useState<AdaptationIntensity>('medium')
  /** AI 正在处理的平台集合（用于逐卡片 loading 指示） */
  const [aiLoadingPlatforms, setAiLoadingPlatforms] = useState<Set<Platform>>(new Set())
  /** 保存 handleAdapt 的最新引用，用于 AI 回调中更新结果 */
  const adaptCallbackRef = useRef<((platform: Platform, aiBody: string | null, aiError: string | null) => void) | null>(null)

  // ---- 从 localStorage 读取数据 ----

  /** 从 ContentEdit 页面持久化的原始 Markdown 内容 */
  const rawContent = useMemo<string | null>(() => {
    return localStorage.getItem('lastRawContent')
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
    setResults(null)
  }, [])

  /** 切换某个结果卡片的对比折叠区 */
  const toggleCompare = useCallback((platform: Platform) => {
    setResults((prev) => {
      if (!prev) return null
      return prev.map((r) =>
        r.adapted.platform === platform ? { ...r, compareOpen: !r.compareOpen } : r,
      )
    })
  }, [])

  /** 更新单个平台的 AI 结果（AI 回调使用） */
  const updateAiResult = useCallback((platform: Platform, aiBody: string | null, aiError: string | null) => {
    setResults((prev) => {
      if (!prev) return null
      return prev.map((r) =>
        r.adapted.platform === platform
          ? { ...r, aiBody, aiError }
          : r,
      )
    })
    setAiLoadingPlatforms((prev) => {
      const next = new Set(prev)
      next.delete(platform)
      return next
    })
  }, [])

  // 保持 ref 同步
  adaptCallbackRef.current = updateAiResult

  /** 执行适配：格式适配 → 可选 AI 改写 */
  const handleAdapt = useCallback(async () => {
    if (!rawContent) return
    const selectedList = Array.from(selected)
    if (selectedList.length === 0) return

    setAdapting(true)
    setResults(null)

    // 使用微延迟让 loading 状态被渲染
    await new Promise((r) => setTimeout(r, 50))

    // 第一步：重新解析 Markdown
    const parseResult = parseMarkdown(rawContent)
    if (!parseResult.success || !parseResult.data) {
      setAdapting(false)
      alert(parseResult.error?.message ?? '内容解析失败，请返回编辑页面检查内容')
      return
    }

    // 第二步：格式适配
    const adapted = adaptAllPlatforms(parseResult.data, selectedList)
    const initialResults: PlatformResult[] = adapted.map((a) => ({
      adapted: a,
      aiBody: null,
      aiError: null,
      compareOpen: false,
    }))

    setResults(initialResults)
    setAdapting(false)

    // 第三步：如果启用 AI，并发执行 AI 风格改写
    if (aiEnabled) {
      setAiRunning(true)
      const platformsToProcess = new Set(selectedList)
      setAiLoadingPlatforms(platformsToProcess)

      // 并发发起 AI 请求（每个平台独立，互不阻塞）
      const aiPromises = selectedList.map(async (platform) => {
        const result = initialResults.find((r) => r.adapted.platform === platform)
        if (!result) return

        const formatBody = result.adapted.body
        try {
          const aiBody = await aiAdaptContent(formatBody, platform, aiIntensity)
          // 判断返回是否为错误信息（以 "AI 适配失败" 开头）
          if (aiBody.startsWith('AI 适配失败')) {
            adaptCallbackRef.current?.(platform, null, aiBody)
          } else {
            adaptCallbackRef.current?.(platform, aiBody, null)
          }
        } catch {
          adaptCallbackRef.current?.(platform, null, 'AI 适配失败：处理异常')
        }
      })

      await Promise.allSettled(aiPromises)
      setAiRunning(false)
      setAiLoadingPlatforms(new Set())
    }
  }, [rawContent, selected, aiEnabled, aiIntensity])

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

          {/* ===== AI 风格适配控制区 ===== */}
          <div className="mb-4 rounded-lg border border-app-border bg-app-bg-tertiary p-4">
            <div className="flex items-center gap-3 flex-wrap">
              {/* AI 开关 */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={aiEnabled}
                    onChange={(e) => {
                      setAiEnabled(e.target.checked)
                      setResults(null)
                    }}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-5 rounded-full transition-colors duration-200 ${
                      aiEnabled ? 'bg-app-accent' : 'bg-app-bg-hover'
                    }`}
                  />
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      aiEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
                <span className="text-sm font-medium text-app-text-primary">🤖 启用 AI 风格适配</span>
              </label>

              {/* 改写强度下拉 */}
              {aiEnabled && (
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-app-text-secondary">改写强度：</span>
                  <select
                    value={aiIntensity}
                    onChange={(e) => {
                      setAiIntensity(e.target.value as AdaptationIntensity)
                      setResults(null)
                    }}
                    className="px-2 py-1 rounded border border-app-border bg-app-bg-primary
                               text-app-text-primary text-sm focus:outline-none focus:border-app-accent"
                  >
                    {INTENSITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            <p className="mt-2 text-xs text-app-text-muted">
              开启后，AI 将自动微调文案风格以匹配各平台用户偏好。未配置 API Key 时仅执行格式适配。
            </p>
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
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>适配中...</span>
              </>
            ) : aiRunning ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>🤖 AI 适配中...</span>
              </>
            ) : (
              <>
                <span>{aiEnabled ? '🤖' : '🔄'}</span>
                <span>执行适配</span>
              </>
            )}
          </button>

          {selected.size === 0 && (
            <p className="mt-2 text-xs text-app-text-muted">请至少选择一个目标平台</p>
          )}

          {/* ===== 适配结果卡片 ===== */}
          {results && results.length > 0 && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {results.map((result) => {
                const { adapted } = result
                const color = platformColors[adapted.platform]
                const rule = platformRules[adapted.platform]
                const isAiLoading = aiLoadingPlatforms.has(adapted.platform)
                // 最终展示的 body：AI 成功 → aiBody，否则 → format body
                const displayBody = result.aiBody ?? adapted.body
                const hasAiResult = result.aiBody !== null && result.aiError === null

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

                      {/* AI 优化标签 */}
                      {hasAiResult && (
                        <span className="ml-auto text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-medium">
                          🤖 AI 优化
                        </span>
                      )}

                      {/* AI 加载中指示 */}
                      {isAiLoading && (
                        <span className="ml-auto flex items-center gap-1 text-xs text-app-text-muted">
                          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          AI 改写中
                        </span>
                      )}
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

                      {/* 正文预览 + 对比折叠 */}
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-app-text-muted">
                            正文（{displayBody.length} 字）
                          </span>
                          {/* 对比按钮 — AI 模式下显示 */}
                          {hasAiResult && (
                            <button
                              onClick={() => toggleCompare(adapted.platform)}
                              className="flex items-center gap-1 text-xs text-app-accent hover:text-app-accent-hover transition-colors"
                            >
                              <span>{result.compareOpen ? '▼' : '▶'}</span>
                              <span>改写前后对比</span>
                            </button>
                          )}
                        </div>

                        {/* 对比区域 */}
                        {result.compareOpen && hasAiResult && (
                          <div className="mt-2 grid grid-cols-2 gap-3">
                            {/* 改写前（格式适配） */}
                            <div>
                              <span className="text-xs text-app-text-muted">格式适配后</span>
                              <pre className="mt-1 text-xs text-app-text-secondary font-sans leading-relaxed
                                              whitespace-pre-wrap bg-app-bg-primary rounded p-2 border border-app-border
                                              max-h-48 overflow-y-auto">
                                {adapted.body.slice(0, 500)}
                                {adapted.body.length > 500 && '\n...'}
                              </pre>
                            </div>
                            {/* 改写后（AI） */}
                            <div>
                              <span className="text-xs text-purple-400">AI 改写后</span>
                              <pre className="mt-1 text-xs text-app-text-primary font-sans leading-relaxed
                                              whitespace-pre-wrap bg-purple-900/20 rounded p-2 border border-purple-500/30
                                              max-h-48 overflow-y-auto">
                                {result.aiBody!.slice(0, 500)}
                                {result.aiBody!.length > 500 && '\n...'}
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* 正文预览（默认显示前 200 字） */}
                        {(!result.compareOpen || !hasAiResult) && (
                          <p className="text-xs text-app-text-secondary mt-1 leading-relaxed whitespace-pre-wrap break-all">
                            {displayBody.slice(0, 200)}
                            {displayBody.length > 200 && ' ...'}
                          </p>
                        )}
                      </div>

                      {/* 正文编辑区 */}
                      <div>
                        <span className="text-xs text-app-text-muted">编辑正文</span>
                        <textarea
                          value={displayBody}
                          onChange={(e) => {
                            setResults((prev) => {
                              if (!prev) return null
                              return prev.map((r) => {
                                if (r.adapted.platform !== adapted.platform) return r
                                // 如果 AI 结果存在，更新 aiBody；否则更新 format body
                                if (r.aiBody !== null) {
                                  return { ...r, aiBody: e.target.value }
                                }
                                return {
                                  ...r,
                                  adapted: { ...r.adapted, body: e.target.value },
                                }
                              })
                            })
                          }}
                          className="mt-1 w-full h-24 rounded border border-app-border bg-app-bg-primary
                                     text-xs text-app-text-primary font-sans leading-relaxed p-2 resize-y
                                     focus:outline-none focus:border-app-accent"
                        />

                        {/* AI 错误提示 */}
                        {result.aiError && (
                          <div className="mt-2 rounded border border-yellow-700/40 bg-yellow-900/20 px-3 py-1.5">
                            <p className="text-xs text-yellow-400 flex items-center gap-1">
                              <span>⚠️</span>
                              <span>{result.aiError}</span>
                            </p>
                          </div>
                        )}
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

                      {/* 格式适配警告 */}
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
        </>
      )}
    </div>
  )
}
