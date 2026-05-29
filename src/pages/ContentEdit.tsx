import React, { useState, useCallback, useMemo, useRef, Component } from 'react'
import MDEditor from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import * as mdCommands from '@uiw/react-md-editor/commands'
import { parseMarkdown, getContentStats } from '../utils/contentParser'
import type { ContentMetadata } from '../utils/contentParser'

// ===== 类型定义 =====

/** 错误边界组件 Props */
interface EditorErrorBoundaryProps {
  children: React.ReactNode
}

/** 错误边界组件 State */
interface EditorErrorBoundaryState {
  hasError: boolean
}

// ===== 错误边界组件 =====

/**
 * 编辑器错误边界
 * 当 MDEditor 初始化或渲染过程中抛出异常时，展示友好提示而非白屏
 */
class EditorErrorBoundary extends Component<EditorErrorBoundaryProps, EditorErrorBoundaryState> {
  constructor(props: EditorErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  /** 捕获子组件渲染错误，更新 state 触发降级 UI */
  static getDerivedStateFromError(): EditorErrorBoundaryState {
    return { hasError: true }
  }

  /** 点击重试时重置错误状态，重新尝试挂载编辑器 */
  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center rounded-lg border border-app-border bg-app-bg-tertiary"
          style={{ height: 'calc(100vh - 200px)', minHeight: 400 }}
        >
          <svg className="w-12 h-12 text-app-error mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-app-error text-base font-medium mb-2">编辑器加载失败</p>
          <p className="text-app-text-secondary text-sm mb-4">请刷新页面重试，或检查浏览器控制台了解详情</p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 rounded-md bg-app-accent text-white text-sm hover:bg-app-accent-hover transition-colors"
          >
            重新加载编辑器
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ===== 工具栏配置 =====

/**
 * 自定义编辑器工具栏
 * 仅保留指定功能按钮，tooltip 使用中文
 */
const toolbarCommands = [
  { ...mdCommands.bold, name: '加粗', keyCommand: 'bold' },
  { ...mdCommands.italic, name: '斜体', keyCommand: 'italic' },
  { ...mdCommands.title, name: '标题', keyCommand: 'title' },
  { ...mdCommands.quote, name: '引用', keyCommand: 'quote' },
  { ...mdCommands.codeBlock, name: '代码块', keyCommand: 'codeBlock' },
  { ...mdCommands.link, name: '插入链接', keyCommand: 'link' },
  { ...mdCommands.image, name: '插入图片', keyCommand: 'image' },
  { ...mdCommands.unorderedListCommand, name: '无序列表', keyCommand: 'unorderedList' },
  { ...mdCommands.orderedListCommand, name: '有序列表', keyCommand: 'orderedList' },
  { ...mdCommands.table, name: '插入表格', keyCommand: 'table' },
]

// ===== 主组件 =====

/**
 * 内容编辑页面
 * 提供 Markdown 编辑器、文件导入、智能解析和统计功能
 */
export default function ContentEdit() {
  // Markdown 原始内容
  const [content, setContent] = useState<string>('')
  // 解析结果面板是否展开
  const [analysisOpen, setAnalysisOpen] = useState<boolean>(false)
  // JSON 展示面板是否展开
  const [jsonOpen, setJsonOpen] = useState<boolean>(false)
  // 复制按钮文字（用于反馈"已复制"）
  const [copyLabel, setCopyLabel] = useState<string>('📋 复制 JSON')
  // 隐藏文件选择器引用
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ---- 事件处理 ----

  /** 点击导入按钮 → 触发隐藏的 <input type="file"> */
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  /** 用户选择文件后，用 FileReader 读取文本内容填入编辑器 */
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text === 'string') {
        setContent(text)
      }
    }
    reader.onerror = () => {
      alert('文件读取失败，请检查文件格式')
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  /** 编辑器内容变化 → 更新 content 状态 */
  const handleContentChange = useCallback((value?: string) => {
    setContent(value ?? '')
  }, [])

  /** 切换解析结果面板展开/折叠 */
  const toggleAnalysis = useCallback(() => {
    setAnalysisOpen((prev) => !prev)
  }, [])

  /** 切换 JSON 面板展开/折叠 */
  const toggleJson = useCallback(() => {
    setJsonOpen((prev) => !prev)
  }, [])

  /** 复制完整 ContentMetadata JSON 到剪贴板 */
  const handleCopyJson = useCallback((metadata: ContentMetadata) => {
    const json = JSON.stringify(metadata, null, 2)
    navigator.clipboard.writeText(json).then(() => {
      setCopyLabel('✅ 已复制')
      setTimeout(() => setCopyLabel('📋 复制 JSON'), 2000)
    }).catch(() => {
      // 降级方案：使用传统方法复制
      const textarea = document.createElement('textarea')
      textarea.value = json
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        setCopyLabel('✅ 已复制')
        setTimeout(() => setCopyLabel('📋 复制 JSON'), 2000)
      } catch {
        alert('复制失败，请手动选择 JSON 文本后 Ctrl+C')
      }
      document.body.removeChild(textarea)
    })
  }, [])

  // ---- 解析 Markdown 内容（实时计算，仅依赖 content）----

  /** 调用解析引擎，获取结构化元数据和统计摘要 */
  const parsed = useMemo(() => {
    const result = parseMarkdown(content)
    if (!result.success || !result.data) {
      return {
        metadata: null as ContentMetadata | null,
        stats: { totalChars: 0, paragraphCount: 0, hasCodeBlock: false, hasTable: false, imageCount: 0, linkCount: 0 },
        error: result.error ?? null,
      }
    }
    return {
      metadata: result.data,
      stats: getContentStats(result.data),
      error: null,
    }
  }, [content])

  // ---- 渲染 ----

  return (
    <div className="flex flex-col h-full p-4">
      {/* 页面标题 */}
      <h1 className="text-xl font-bold text-app-text-primary mb-2">内容编辑</h1>

      {/* 文件导入按钮行 */}
      <div className="flex items-center gap-3 mb-3 flex-shrink-0">
        <button
          onClick={handleImportClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-app-border
                     bg-app-bg-tertiary text-sm text-app-text-secondary
                     hover:bg-app-bg-hover hover:text-app-text-primary transition-colors"
        >
          <span>📄</span>
          <span>导入 Markdown 文件</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.txt,.markdown,.text"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* 解析错误提示 */}
        {parsed.error && (
          <span className="text-xs text-app-error flex items-center gap-1">
            <span>⚠️</span>
            <span>{parsed.error.message}</span>
          </span>
        )}
      </div>

      {/* Markdown 编辑器区域 — 由 ErrorBoundary 包裹防止白屏 */}
      <div className="flex-shrink-0">
        <EditorErrorBoundary>
          <div data-color-mode="dark">
            <MDEditor
              value={content}
              onChange={handleContentChange}
              preview="live"
              height="calc(100vh - 200px)"
              minHeight={400}
              visibleDragbar={true}
              commands={toolbarCommands}
              textareaProps={{
                placeholder: '请输入或粘贴 Markdown 内容，支持标题、代码块、表格、图片...',
              }}
            />
          </div>
        </EditorErrorBoundary>
      </div>

      {/* 内容解析结果 — 折叠面板 */}
      <div className="mt-3 flex-shrink-0 border border-app-border rounded-lg overflow-hidden">
        {/* 面板标题栏 */}
        <button
          onClick={toggleAnalysis}
          className="flex items-center gap-2 w-full px-4 py-2.5 bg-app-bg-tertiary
                     text-sm text-app-text-secondary hover:bg-app-bg-hover transition-colors"
        >
          <span className="text-xs transition-transform">
            {analysisOpen ? '▼' : '▶'}
          </span>
          <span>📊 内容解析结果</span>
        </button>

        {analysisOpen && (
          <div className="px-4 py-3 bg-app-bg-secondary border-t border-app-border space-y-3">
            {/* 统计摘要 */}
            <pre className="text-xs text-app-text-secondary font-mono leading-6 whitespace-pre-wrap select-text">
{`总字符数：  ${parsed.stats.totalChars}
段落数：    ${parsed.stats.paragraphCount}
包含代码块：${parsed.stats.hasCodeBlock ? '是' : '否'}
包含表格：  ${parsed.stats.hasTable ? '是' : '否'}
图片数量：  ${parsed.stats.imageCount}
外链数量：  ${parsed.stats.linkCount}`}
            </pre>

            {/* JSON 元数据折叠面板 */}
            {parsed.metadata && (
              <div className="border-t border-app-border pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={toggleJson}
                    className="flex items-center gap-1.5 text-xs text-app-text-secondary
                               hover:text-app-text-primary transition-colors"
                  >
                    <span className="transition-transform">
                      {jsonOpen ? '▼' : '▶'}
                    </span>
                    <span>📋 结构化元数据（JSON）</span>
                  </button>
                  <button
                    onClick={() => handleCopyJson(parsed.metadata!)}
                    className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded text-xs
                               bg-app-accent text-white hover:bg-app-accent-hover transition-colors"
                  >
                    {copyLabel}
                  </button>
                </div>
                {jsonOpen && (
                  <pre className="text-xs text-app-text-secondary font-mono leading-5
                                  whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto
                                  bg-app-bg-primary rounded p-3 border border-app-border select-text">
{JSON.stringify(parsed.metadata, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
