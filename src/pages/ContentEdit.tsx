import React, { useState, useCallback, useMemo, useRef, Component, useEffect } from 'react'
import MDEditor from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import * as mdCommands from '@uiw/react-md-editor/commands'
import { parseMarkdown, getContentStats } from '../utils/contentParser'
import type { ContentMetadata } from '../utils/contentParser'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'

// ===== 类型 =====

interface EditorErrorBoundaryProps { children: React.ReactNode }
interface EditorErrorBoundaryState { hasError: boolean }

class EditorErrorBoundary extends Component<EditorErrorBoundaryProps, EditorErrorBoundaryState> {
  constructor(props: EditorErrorBoundaryProps) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError(): EditorErrorBoundaryState { return { hasError: true } }

  handleRetry = () => this.setState({ hasError: false })

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-divider-light
                        bg-surface-card" style={{ height: 'calc(100vh - 200px)', minHeight: 400 }}>
          <svg className="w-12 h-12 text-status-error mb-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 9v2m0 4h.01" />
          </svg>
          <p className="text-body text-status-error font-medium mb-2">编辑器加载失败</p>
          <p className="text-body-sm text-text-secondary mb-4">请刷新页面重试，或检查浏览器控制台了解详情</p>
          <button onClick={this.handleRetry}
            className="px-4 py-2 rounded-md bg-accent-blue text-white text-body-sm font-medium
                       hover:bg-accent-blue-hover active:scale-[0.98] transition-all duration-200">
            重新加载编辑器
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ===== 自定义工具栏 — 中文 tooltip =====

const toolbarCommands = [
  { ...mdCommands.bold, name: '加粗' },
  { ...mdCommands.italic, name: '斜体' },
  { ...mdCommands.title, name: '标题' },
  { ...mdCommands.quote, name: '引用' },
  { ...mdCommands.codeBlock, name: '代码块' },
  { ...mdCommands.link, name: '插入链接' },
  { ...mdCommands.image, name: '插入图片' },
  { ...mdCommands.unorderedListCommand, name: '无序列表' },
  { ...mdCommands.orderedListCommand, name: '有序列表' },
  { ...mdCommands.table, name: '插入表格' },
]

// ===== 主组件 =====

export default function ContentEdit() {
  // 从 localStorage 恢复上次编辑内容，避免导航切换后丢失
  const [content, setContent] = useState<string>(() => {
    return localStorage.getItem('lastRawContent') || ''
  })
  const [analysisOpen, setAnalysisOpen] = useState<boolean>(false)
  const [jsonOpen, setJsonOpen] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportClick = useCallback(() => fileInputRef.current?.click(), [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { if (typeof ev.target?.result === 'string') setContent(ev.target.result) }
    reader.onerror = () => alert('文件读取失败，请检查文件格式')
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  const handleContentChange = useCallback((value?: string) => setContent(value ?? ''), [])
  const toggleAnalysis = useCallback(() => setAnalysisOpen((p) => !p), [])
  const toggleJson = useCallback(() => setJsonOpen((p) => !p), [])

  const handleCopyJson = useCallback((metadata: ContentMetadata) => {
    const json = JSON.stringify(metadata, null, 2)
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      const ta = document.createElement('textarea')
      ta.value = json; ta.style.position = 'fixed'; ta.style.opacity = '0'
      document.body.appendChild(ta); ta.select()
      try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { alert('复制失败') }
      document.body.removeChild(ta)
    })
  }, [])

  const parsed = useMemo(() => {
    const result = parseMarkdown(content)
    if (!result.success || !result.data) {
      return {
        metadata: null as ContentMetadata | null,
        stats: { totalChars: 0, paragraphCount: 0, hasCodeBlock: false, hasTable: false, imageCount: 0, linkCount: 0 },
        error: result.error ?? null,
      }
    }
    return { metadata: result.data, stats: getContentStats(result.data), error: null }
  }, [content])

  useEffect(() => { if (parsed.metadata) localStorage.setItem('lastContentMetadata', JSON.stringify(parsed.metadata)) }, [parsed.metadata])
  useEffect(() => { localStorage.setItem('lastRawContent', content) }, [content])

  return (
    <div className="max-w-[1200px] mx-auto px-page-x py-section animate-fade-in">
      <GlassCard padding="lg" className="animate-spring-in !p-card-pad">
        {/* 标题行 */}
        <div className="flex items-center justify-between mb-element">
          <h2 className="text-subtitle text-text-primary">内容编辑</h2>
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept=".md,.txt,.markdown,.text"
                   onChange={handleFileChange} className="hidden" />
            <Button variant="secondary" size="sm" onClick={handleImportClick}>导入文件</Button>
          </div>
        </div>

        {/* 解析错误提示 */}
        {parsed.error && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-sm
                          bg-status-error/[0.06] border border-status-error/[0.12]">
            <span className="text-body-sm text-status-error">{parsed.error.message}</span>
          </div>
        )}

        {/* Markdown 编辑器 */}
        <EditorErrorBoundary>
          <div data-color-mode="light" className="rounded-md overflow-hidden border border-divider-light liquid-input">
            <MDEditor
              value={content} onChange={handleContentChange}
              preview="live"
              height="calc(100vh - 200px)" minHeight={400}
              visibleDragbar={true}
              commands={toolbarCommands}
              textareaProps={{ placeholder: '请输入或粘贴 Markdown 内容，支持标题、代码块、表格、图片...' }}
            />
          </div>
        </EditorErrorBoundary>

        {/* 内容解析面板 */}
        <div className="mt-element rounded-md border border-divider-light overflow-hidden bg-surface-card/50">
          <button onClick={toggleAnalysis}
            className="flex items-center gap-2 w-full px-5 py-3 text-body-sm text-text-secondary
                       hover:bg-black/[0.02] transition-colors">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"
                 className={`transition-transform duration-200 ${analysisOpen ? 'rotate-90' : ''}`}>
              <path d="M3 1l5 4-5 4" />
            </svg>
            <span>内容解析结果</span>
          </button>

          {analysisOpen && (
            <div className="px-5 py-4 border-t border-divider-light space-y-4">
              <pre className="text-body-sm text-text-secondary font-mono leading-6 whitespace-pre-wrap select-text">
{`总字符数：  ${parsed.stats.totalChars}
段落数：    ${parsed.stats.paragraphCount}
包含代码块：${parsed.stats.hasCodeBlock ? '是' : '否'}
包含表格：  ${parsed.stats.hasTable ? '是' : '否'}
图片数量：  ${parsed.stats.imageCount}
外链数量：  ${parsed.stats.linkCount}`}
              </pre>

              {parsed.metadata && (
                <div className="border-t border-divider-light pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={toggleJson}
                      className="flex items-center gap-1.5 text-body-sm text-text-secondary
                                 hover:text-text-primary transition-colors">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"
                           className={`transition-transform duration-200 ${jsonOpen ? 'rotate-90' : ''}`}>
                        <path d="M3 1l5 4-5 4" />
                      </svg>
                      <span>结构化元数据（JSON）</span>
                    </button>
                    <Button variant="ghost" size="sm" onClick={() => handleCopyJson(parsed.metadata!)}>
                      {copied ? '已复制' : '复制 JSON'}
                    </Button>
                  </div>
                  {jsonOpen && (
                    <pre className="text-body-sm text-text-secondary font-mono leading-5 whitespace-pre-wrap
                                    overflow-x-auto max-h-64 overflow-y-auto bg-surface-page rounded-sm p-3
                                    border border-divider-light select-text">
{JSON.stringify(parsed.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
