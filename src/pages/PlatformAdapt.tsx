import React, { useState, useCallback, useMemo, useRef } from 'react'
import { Platform, platformRules, platformColors } from '../config/platformRules'
import { parseMarkdown } from '../utils/contentParser'
import { adaptAllPlatforms } from '../utils/platformAdapter'
import { aiAdaptContent } from '../services/aiService'
import type { AdaptedContent } from '../utils/platformAdapter'
import type { ContentMetadata } from '../utils/contentParser'
import type { AdaptationIntensity } from '../services/aiService'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import ToggleSwitch from '../components/ui/ToggleSwitch'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import { getPreviewComponent } from '../components/preview'

// ===== 类型 =====

interface PlatformResult {
  adapted: AdaptedContent
  aiBody: string | null
  aiError: string | null
  compareOpen: boolean
}

type PreviewMode = 'grid' | 'single'

const ALL_PLATFORMS: Platform[] = [Platform.wechat, Platform.zhihu, Platform.xiaohongshu, Platform.bilibili]
const INTENSITY_OPTIONS: { value: AdaptationIntensity; label: string }[] = [
  { value: 'low', label: '低 — 仅润色格式' },
  { value: 'medium', label: '中 — 微调语气' },
  { value: 'high', label: '高 — 深度改写' },
]

export default function PlatformAdapt() {
  const [selected, setSelected] = useState<Set<Platform>>(new Set(ALL_PLATFORMS))
  const [results, setResults] = useState<PlatformResult[] | null>(null)
  const [adapting, setAdapting] = useState<boolean>(false)
  const [aiRunning, setAiRunning] = useState<boolean>(false)
  const [aiEnabled, setAiEnabled] = useState<boolean>(false)
  const [aiIntensity, setAiIntensity] = useState<AdaptationIntensity>('medium')
  const [aiLoadingPlatforms, setAiLoadingPlatforms] = useState<Set<Platform>>(new Set())
  const adaptCallbackRef = useRef<((p: Platform, body: string | null, err: string | null) => void) | null>(null)

  // 预览模式状态
  const [previewMode, setPreviewMode] = useState<PreviewMode>('grid')
  const [previewPlatform, setPreviewPlatform] = useState<Platform>(Platform.wechat)

  const rawContent = useMemo<string | null>(() => localStorage.getItem('lastRawContent'), [])
  const hasContent = rawContent !== null && rawContent.trim().length > 0

  const togglePlatform = useCallback((platform: Platform) => {
    setSelected((prev) => { const n = new Set(prev); n.has(platform) ? n.delete(platform) : n.add(platform); return n })
    setResults(null)
  }, [])

  const toggleCompare = useCallback((platform: Platform) => {
    setResults((prev) => prev?.map((r) => (r.adapted.platform === platform ? { ...r, compareOpen: !r.compareOpen } : r)) ?? null)
  }, [])

  const updateAiResult = useCallback((platform: Platform, aiBody: string | null, aiError: string | null) => {
    setResults((prev) => prev?.map((r) => (r.adapted.platform === platform ? { ...r, aiBody, aiError } : r)) ?? null)
    setAiLoadingPlatforms((prev) => { const n = new Set(prev); n.delete(platform); return n })
  }, [])
  adaptCallbackRef.current = updateAiResult

  const handleAdapt = useCallback(async () => {
    if (!rawContent) return
    const selectedList = Array.from(selected)
    if (selectedList.length === 0) return
    setAdapting(true); setResults(null)
    await new Promise((r) => setTimeout(r, 50))

    const parseResult = parseMarkdown(rawContent)
    if (!parseResult.success || !parseResult.data) { setAdapting(false); alert(parseResult.error?.message ?? '解析失败'); return }

    const adapted = adaptAllPlatforms(parseResult.data, selectedList)
    const initial: PlatformResult[] = adapted.map((a) => ({ adapted: a, aiBody: null, aiError: null, compareOpen: false }))
    setResults(initial)
    setAdapting(false)

    if (aiEnabled) {
      setAiRunning(true)
      setAiLoadingPlatforms(new Set(selectedList))
      const aiPromises = selectedList.map(async (platform) => {
        const r = initial.find((x) => x.adapted.platform === platform)
        if (!r) return
        try {
          const body = await aiAdaptContent(r.adapted.body, platform, aiIntensity)
          if (body.startsWith('AI 适配失败')) adaptCallbackRef.current?.(platform, null, body)
          else adaptCallbackRef.current?.(platform, body, null)
        } catch { adaptCallbackRef.current?.(platform, null, 'AI 适配失败') }
      })
      await Promise.allSettled(aiPromises)
      setAiRunning(false); setAiLoadingPlatforms(new Set())
    }
  }, [rawContent, selected, aiEnabled, aiIntensity])

  // 获取某平台结果用于预览
  const getResultForPlatform = useCallback((platform: Platform): PlatformResult | undefined => {
    return results?.find((r) => r.adapted.platform === platform)
  }, [results])

  // ===== 渲染 =====

  return (
    <div className="max-w-[1200px] mx-auto px-page-x py-section animate-fade-in">
      <h2 className="text-subtitle text-text-primary mb-1">平台适配</h2>
      <p className="text-body-sm text-text-secondary mb-element">根据各平台规则自动转换内容格式，预览适配结果</p>

      {!hasContent && (
        <GlassCard>
          <EmptyState title="尚未解析内容"
            description="请先前往「内容编辑」页面输入 Markdown 内容并展开解析面板。" />
        </GlassCard>
      )}

      {hasContent && (
        <>
          {/* 平台选择 */}
          <GlassCard className="mb-element animate-slide-up">
            <h3 className="text-heading text-text-primary mb-tight">选择目标平台</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {ALL_PLATFORMS.map((platform) => {
                const rule = platformRules[platform]
                const color = platformColors[platform]
                const isSelected = selected.has(platform)
                return (
                  <div key={platform} onClick={() => togglePlatform(platform)}
                    className={[
                      'flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer select-none border transition-all duration-[400ms]',
                      isSelected ? 'bg-surface-card shadow-sm' : 'bg-transparent border-transparent hover:bg-black/[0.02]',
                    ].join(' ')}
                    style={{ borderLeftWidth: isSelected ? '3px' : '0', borderLeftColor: isSelected ? color : 'transparent' }}>
                    <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-body-sm font-medium flex-1" style={{ color: isSelected ? '#1d1d1f' : '#86868b' }}>{rule.name}</span>
                    <ToggleSwitch checked={isSelected} onChange={() => togglePlatform(platform)} />
                  </div>
                )
              })}
            </div>
          </GlassCard>

          {/* AI 控制 */}
          <GlassCard className="mb-element animate-slide-up" animationDelay="0.1s">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <ToggleSwitch checked={aiEnabled} onChange={(v) => { setAiEnabled(v); setResults(null) }} />
                <span className="text-body-sm font-medium text-text-primary">启用 AI 风格适配</span>
              </div>
              {aiEnabled && (
                <div className="flex items-center gap-2">
                  <span className="text-caption text-text-secondary">改写强度：</span>
                  <select value={aiIntensity}
                    onChange={(e) => { setAiIntensity(e.target.value as AdaptationIntensity); setResults(null) }}
                    className="liquid-input px-3 py-1.5 text-body-sm text-text-primary cursor-pointer transition-all">
                    {INTENSITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              )}
            </div>
            <p className="mt-3 text-caption text-text-tertiary">开启后，AI 将自动微调文案风格以匹配各平台用户偏好。</p>
          </GlassCard>

          {/* 执行按钮 */}
          <Button variant="primary" size="md" loading={adapting} disabled={selected.size === 0} onClick={handleAdapt}>
            {aiRunning ? 'AI 适配中...' : aiEnabled ? '执行 AI 适配' : '执行格式适配'}
          </Button>
          {selected.size === 0 && <p className="mt-2 text-caption text-text-tertiary">请至少选择一个目标平台</p>}

          {/* 结果卡片 */}
          {results && results.length > 0 && (
            <div className="mt-section grid grid-cols-1 lg:grid-cols-2 gap-element">
              {results.map((result, i) => {
                const { adapted } = result
                const color = platformColors[adapted.platform]
                const rule = platformRules[adapted.platform]
                const isAiLoading = aiLoadingPlatforms.has(adapted.platform)
                const displayBody = result.aiBody ?? adapted.body
                const hasAiResult = result.aiBody !== null && result.aiError === null

                return (
                  <GlassCard key={adapted.platform} animationDelay={`${i * 0.1}s`}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <h3 className="text-heading text-text-primary">{rule.name}</h3>
                      {hasAiResult && <Badge variant="accent">AI 优化</Badge>}
                      {isAiLoading && (
                        <span className="ml-auto flex items-center gap-1 text-caption text-text-tertiary">
                          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          AI 改写中
                        </span>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div><span className="text-label text-text-tertiary uppercase">标题</span><p className="text-body-sm font-semibold text-text-primary mt-1 break-all">{adapted.title || '(无标题)'}</p></div>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-label text-text-tertiary uppercase">正文（{displayBody.length} 字）</span>
                          {hasAiResult && (<button onClick={() => toggleCompare(adapted.platform)} className="flex items-center gap-1 text-caption text-accent-blue hover:text-accent-blue-hover transition-colors"><span>{result.compareOpen ? '▼' : '▶'}</span><span>改写前后对比</span></button>)}
                        </div>
                        {result.compareOpen && hasAiResult && (
                          <div className="mt-2 grid grid-cols-2 gap-3">
                            <div><span className="text-label text-text-tertiary">格式适配后</span><pre className="mt-1 text-body-sm text-text-secondary font-sans leading-relaxed whitespace-pre-wrap bg-surface-page rounded-sm p-3 border border-divider-light max-h-48 overflow-y-auto">{adapted.body.slice(0, 500)}{adapted.body.length > 500 && '\n...'}</pre></div>
                            <div><span className="text-label text-accent-blue">AI 改写后</span><pre className="mt-1 text-body-sm text-text-primary font-sans leading-relaxed whitespace-pre-wrap rounded-sm p-3 border max-h-48 overflow-y-auto" style={{ backgroundColor: 'rgba(0,113,227,0.03)', borderColor: 'rgba(0,113,227,0.12)' }}>{result.aiBody!.slice(0, 500)}{result.aiBody!.length > 500 && '\n...'}</pre></div>
                          </div>
                        )}
                        {(!result.compareOpen || !hasAiResult) && (<p className="text-body-sm text-text-secondary mt-1 leading-relaxed whitespace-pre-wrap break-all">{displayBody.slice(0, 200)}{displayBody.length > 200 && ' ...'}</p>)}
                      </div>
                      <div><span className="text-label text-text-tertiary uppercase">编辑正文</span><textarea value={displayBody}
                        onChange={(e) => setResults((prev) => prev?.map((r) => { if (r.adapted.platform !== adapted.platform) return r; if (r.aiBody !== null) return { ...r, aiBody: e.target.value }; return { ...r, adapted: { ...r.adapted, body: e.target.value } }; }) ?? null)}
                        className="liquid-input mt-1 w-full h-24 text-body-sm text-text-primary font-sans leading-relaxed p-3 resize-y" />
                        {result.aiError && (<div className="mt-2 rounded-sm border-l-2 border-l-status-warning bg-status-warning/[0.04] px-3 py-2"><p className="text-body-sm text-status-warning">{result.aiError}</p></div>)}
                      </div>
                      <div><span className="text-label text-text-tertiary uppercase">标签（{adapted.tags.length} 个）</span><div className="flex flex-wrap gap-1 mt-1">{adapted.tags.length > 0 ? adapted.tags.map((tag) => (<span key={tag} className="px-2 py-0.5 rounded-pill text-label font-medium" style={{ backgroundColor: `${color}12`, color }}>#{tag}</span>)) : <span className="text-caption text-text-tertiary">无标签</span>}</div></div>
                      <div><span className="text-label text-text-tertiary uppercase">图片数量</span><p className="text-body-sm text-text-primary mt-0.5">{adapted.imageCount} 张{rule.maxImages > 0 && `（上限 ${rule.maxImages} 张）`}</p></div>
                      {adapted.warnings.length > 0 && (<div className="rounded-sm border-l-2 border-l-status-warning bg-status-warning/[0.04] px-3 py-2"><span className="text-label font-medium text-status-warning block mb-1">适配警告</span><ul className="space-y-0.5">{adapted.warnings.map((w, i) => <li key={i} className="text-caption text-status-warning/90">{w}</li>)}</ul></div>)}
                    </div>
                  </GlassCard>
                )
              })}
            </div>
          )}

          {/* ===== 模拟预览区 ===== */}
          {results && results.length > 0 && (
            <div className="mt-section">
              <hr className="divider" />

              {/* 预览标题 */}
              <div className="flex items-center justify-between mb-element">
                <h2 className="text-heading text-text-primary">模拟预览</h2>
                {/* 视图切换 */}
                <div className="flex items-center gap-1 bg-black/[0.03] rounded-sm p-0.5">
                  <button onClick={() => setPreviewMode('grid')}
                    className={['px-3 py-1.5 rounded-xs text-caption font-medium transition-all',
                      previewMode === 'grid' ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary',
                    ].join(' ')}>
                    全平台对比
                  </button>
                  <button onClick={() => setPreviewMode('single')}
                    className={['px-3 py-1.5 rounded-xs text-caption font-medium transition-all',
                      previewMode === 'single' ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary',
                    ].join(' ')}>
                    单平台查看
                  </button>
                </div>
              </div>

              {/* 醒目提示条 */}
              <div className="flex items-center gap-2 mb-element px-4 py-2.5 rounded-sm border-l-[3px] border-l-status-warning bg-status-warning/[0.05]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-status-warning flex-shrink-0">
                  <path d="M12 9v3m0 4h.01" /><circle cx="12" cy="12" r="10" />
                </svg>
                <span className="text-body-sm text-text-primary">
                  <span className="font-medium">模拟预览</span>
                  <span className="text-text-secondary"> · 不会真实发布</span>
                </span>
              </div>

              {/* 单平台选择 */}
              {previewMode === 'single' && (
                <div className="mb-4">
                  <select value={previewPlatform}
                    onChange={(e) => setPreviewPlatform(e.target.value as Platform)}
                    className="liquid-input px-3 py-1.5 text-body-sm text-text-primary cursor-pointer">
                    {results.map((r) => {
                      const rule = platformRules[r.adapted.platform]
                      return <option key={r.adapted.platform} value={r.adapted.platform}>{rule.name}</option>
                    })}
                  </select>
                </div>
              )}

              {/* 预览内容 */}
              {previewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-element">
                  {results.map((r) => {
                    const PreviewComp = getPreviewComponent(r.adapted.platform)
                    if (!PreviewComp) return null
                    return (
                      <GlassCard key={r.adapted.platform} className="flex flex-col items-center">
                        <span className="text-label text-text-tertiary mb-2">{platformRules[r.adapted.platform].name}</span>
                        <PreviewComp
                          title={r.adapted.title}
                          body={r.aiBody ?? r.adapted.body}
                          tags={r.adapted.tags}
                          imageCount={r.adapted.imageCount}
                        />
                      </GlassCard>
                    )
                  })}
                </div>
              ) : (
                (() => {
                  const r = getResultForPlatform(previewPlatform)
                  if (!r) return null
                  const PreviewComp = getPreviewComponent(r.adapted.platform)
                  if (!PreviewComp) return null
                  return (
                    <GlassCard className="flex flex-col items-center">
                      <PreviewComp
                        title={r.adapted.title}
                        body={r.aiBody ?? r.adapted.body}
                        tags={r.adapted.tags}
                        imageCount={r.adapted.imageCount}
                      />
                    </GlassCard>
                  )
                })()
              )}
            </div>
          )}

          {/* 无适配数据时预览区提示 */}
          {!results && (
            <div className="mt-section">
              <hr className="divider" />
              <div className="flex items-center gap-2 px-4 py-3 rounded-sm border border-divider-light bg-surface-page">
                <span className="text-body-sm text-text-tertiary">执行适配后将在此处显示各平台模拟预览</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
