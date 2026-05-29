import React, { useState, useCallback, useMemo, useRef, Component } from 'react'
import MDEditor from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import * as mdCommands from '@uiw/react-md-editor/commands'

// ===== 类型定义 =====

/** 内容统计数据 */
interface ContentStats {
  /** 总字符数 */
  totalChars: number
  /** 段落数（以空行分隔） */
  paragraphCount: number
  /** 是否包含代码块（```标记） */
  hasCodeBlock: boolean
  /** 是否包含表格（| 标记） */
  hasTable: boolean
  /** 图片数量（![]()语法） */
  imageCount: number
  /** 外链数量（[]()语法，排除图片） */
  linkCount: number
}

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
        <div className="flex flex-col items-center justify-center rounded-lg border border-app-border bg-app-bg-tertiary"
             style={{ height: 'calc(100vh - 200px)', minHeight: 400 }}>
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
 * 提供 Markdown 编辑器、文件导入和内容解析统计功能
 */
export default function ContentEdit() {
  // Markdown 内容
  const [content, setContent] = useState<string>('')
  // 解析结果面板是否展开
  const [analysisOpen, setAnalysisOpen] = useState<boolean>(false)
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
    // 重置 input.value 以便重复选择同一文件时仍能触发 onChange
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

  // ---- 内容统计（实时计算，仅依赖 content）----

  const stats = useMemo<ContentStats>(() => {
    const text = content || ''
    // 以空行分隔段落
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
    // 匹配非图片链接: 前面没有 ! 的 []() 语法
    const linkRegex = /(?<!!)\[.*?\]\(.*?\)/g
    // 匹配图片: ![]() 语法
    const imageRegex = /!\[.*?\]\(.*?\)/g

    return {
      totalChars: text.length,
      paragraphCount: paragraphs.length,
      hasCodeBlock: /```/.test(text),
      hasTable: /\|/.test(text),
      imageCount: (text.match(imageRegex) || []).length,
      linkCount: (text.match(linkRegex) || []).length,
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
        {/* 隐藏的文件选择器 */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.txt,.markdown,.text"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Markdown 编辑器区域 — 由 ErrorBoundary 包裹防止白屏 */}
      <div className="flex-shrink-0">
        <EditorErrorBoundary>
          <div data-color-mode="dark">
            <MDEditor
              value={content}
              onChange={handleContentChange}
              // 分栏模式：左侧编辑，右侧实时预览
              preview="live"
              // 高度占满可用空间，最小 400px
              height="calc(100vh - 200px)"
              minHeight={400}
              // 允许拖拽调整编辑/预览比例
              visibleDragbar={true}
              // 自定义工具栏（仅保留指定按钮 + 中文 tooltip）
              commands={toolbarCommands}
              // 编辑器 placeholder
              textareaProps={{
                placeholder: '请输入或粘贴 Markdown 内容，支持标题、代码块、表格、图片...',
              }}
            />
          </div>
        </EditorErrorBoundary>
      </div>

      {/* 内容解析结果 — 折叠面板 */}
      <div className="mt-3 flex-shrink-0 border border-app-border rounded-lg overflow-hidden">
        {/* 面板标题栏（可点击折叠/展开） */}
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

        {/* 面板内容 — 仅在展开时渲染 */}
        {analysisOpen && (
          <div className="px-4 py-3 bg-app-bg-secondary border-t border-app-border">
            <pre className="text-xs text-app-text-secondary font-mono leading-6 whitespace-pre-wrap select-text">
{`总字符数：  ${stats.totalChars}
段落数：    ${stats.paragraphCount}
包含代码块：${stats.hasCodeBlock ? '是' : '否'}
包含表格：  ${stats.hasTable ? '是' : '否'}
图片数量：  ${stats.imageCount}
外链数量：  ${stats.linkCount}`}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
