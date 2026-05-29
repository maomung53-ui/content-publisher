import { marked } from 'marked'
import type { Token, Tokens } from 'marked'

// ===== 数据类型定义 =====

/** 图片信息 */
export interface ImageInfo {
  /** 图片替代文本 */
  alt: string
  /** 图片 URL */
  url: string
  /** 所在行号（1-based） */
  lineNumber: number
}

/** 代码块信息 */
export interface CodeBlockInfo {
  /** 编程语言，未指定时为 "plaintext" */
  language: string
  /** 代码内容 */
  code: string
  /** 起始行号（1-based） */
  lineNumber: number
}

/** 表格信息 */
export interface TableInfo {
  /** 表头列名数组 */
  headers: string[]
  /** 数据行，每行为一个字符串数组 */
  rows: string[][]
  /** 起始行号（1-based） */
  lineNumber: number
}

/** 外链信息 */
export interface LinkInfo {
  /** 链接显示文本 */
  text: string
  /** 链接 URL */
  url: string
  /** 所在行号（1-based） */
  lineNumber: number
}

/** 解析后的内容元数据 */
export interface ContentMetadata {
  /** 文档标题（从一级标题提取，没有则为 null） */
  title: string | null
  /** 段落文本数组（按出现顺序） */
  paragraphs: string[]
  /** 文档中所有图片 */
  images: ImageInfo[]
  /** 文档中所有代码块 */
  codeBlocks: CodeBlockInfo[]
  /** 文档中所有表格 */
  tables: TableInfo[]
  /** 文档中所有外链 */
  links: LinkInfo[]
  /** 从正文中提取的话题标签（#xxx 格式，不含 #） */
  tags: string[]
}

/** 解析错误信息 */
export interface ParseError {
  /** 出错行号（无法定位时为 0） */
  line: number
  /** 错误描述 */
  message: string
  /** 修复建议 */
  suggestion: string
}

/** 解析结果 — 成功/失败联合类型 */
export interface ParseResult {
  success: boolean
  /** 成功时的解析数据 */
  data?: ContentMetadata
  /** 失败时的错误详情 */
  error?: ParseError
}

/** 内容统计摘要 */
export interface ContentStats {
  /** 总字符数 */
  totalChars: number
  /** 段落数 */
  paragraphCount: number
  /** 是否包含代码块 */
  hasCodeBlock: boolean
  /** 是否包含表格 */
  hasTable: boolean
  /** 图片数量 */
  imageCount: number
  /** 外链数量 */
  linkCount: number
}

// ===== 内部工具函数 =====

/**
 * 统计文本中的换行符数量
 * 用于在遍历 token 时推进行号计数
 */
function countNewlines(text: string): number {
  const matches = text.match(/\n/g)
  return matches ? matches.length : 0
}

/**
 * 递归遍历 token 树，提取所有 Link 类型 token
 * 处理嵌套结构：paragraph > strong > link 等任意深度
 */
function collectLinks(tokens: Token[], results: LinkInfo[], baseLine: number): void {
  for (const token of tokens) {
    if (token.type === 'link') {
      const link = token as Tokens.Link
      results.push({
        text: extractPlainText(link.tokens),
        url: link.href,
        lineNumber: baseLine,
      })
    }
    // 递归处理包含子 token 的节点（strong, em, del, paragraph, heading 等）
    if ('tokens' in token && Array.isArray(token.tokens)) {
      collectLinks(token.tokens, results, baseLine)
    }
    // 列表节点：遍历每个列表项的子 token
    if (token.type === 'list') {
      const list = token as Tokens.List
      for (const item of list.items) {
        if (item.tokens) {
          collectLinks(item.tokens, results, baseLine)
        }
      }
    }
  }
}

/**
 * 递归遍历 token 树，提取所有 Image 类型 token
 */
function collectImages(tokens: Token[], results: ImageInfo[], baseLine: number): void {
  for (const token of tokens) {
    if (token.type === 'image') {
      const img = token as Tokens.Image
      results.push({
        alt: img.text,
        url: img.href,
        lineNumber: baseLine,
      })
    }
    if ('tokens' in token && Array.isArray(token.tokens)) {
      collectImages(token.tokens, results, baseLine)
    }
    if (token.type === 'list') {
      const list = token as Tokens.List
      for (const item of list.items) {
        if (item.tokens) {
          collectImages(item.tokens, results, baseLine)
        }
      }
    }
  }
}

/**
 * 从 token 数组中提取纯文本内容
 * 递归拼接所有 Text 类型 token 的文本，忽略格式标记
 */
function extractPlainText(tokens: Token[]): string {
  let result = ''
  for (const token of tokens) {
    if (token.type === 'text') {
      result += (token as Tokens.Text).text
    } else if ('tokens' in token && Array.isArray(token.tokens)) {
      result += extractPlainText(token.tokens)
    }
  }
  return result
}

/**
 * 从段落文本中提取话题标签（匹配 #中文 或 #english 格式）
 * 返回去掉 # 前缀的标签列表，自动去重
 */
function extractTags(text: string): string[] {
  // 匹配 # 后跟中文、字母、数字、下划线的组合
  const matches = text.match(/#[一-龥一-鿿\w]+/g)
  if (!matches) return []
  // 去重
  return [...new Set(matches.map((t) => t.slice(1)))]
}

// ===== 公共 API =====

/**
 * 解析 Markdown 内容为结构化元数据
 *
 * 使用 marked 库的 Lexer 将原始 Markdown 文本解析为 Token 数组，
 * 然后按类型分类提取到 ContentMetadata 结构中。
 *
 * @param content — 原始 Markdown 字符串
 * @returns ParseResult — 成功时包含 data，失败时包含 error
 */
export function parseMarkdown(content: string): ParseResult {
  try {
    // 空内容直接返回空元数据
    if (!content || content.trim().length === 0) {
      return {
        success: true,
        data: {
          title: null,
          paragraphs: [],
          images: [],
          codeBlocks: [],
          tables: [],
          links: [],
          tags: [],
        },
      }
    }

    // 使用 marked Lexer 解析为 token 列表
    const tokens = marked.Lexer.lex(content)

    const metadata: ContentMetadata = {
      title: null,
      paragraphs: [],
      images: [],
      codeBlocks: [],
      tables: [],
      links: [],
      tags: [],
    }

    // 追踪当前行号，用于定位元素在原文中的位置
    let currentLine = 1
    // 收集到的所有标签（使用 Set 去重）
    const tagSet = new Set<string>()

    for (const token of tokens) {
      // ---- 标题 ----
      if (token.type === 'heading') {
        const heading = token as Tokens.Heading
        // 取第一个一级标题作为文档标题
        if (!metadata.title && heading.depth === 1) {
          metadata.title = heading.text
        }
        // 标题中可能包含内联链接和图片
        collectLinks(heading.tokens, metadata.links, currentLine)
        collectImages(heading.tokens, metadata.images, currentLine)
        // 提取标题中的标签
        extractTags(heading.text).forEach((t) => tagSet.add(t))
      }

      // ---- 段落 ----
      else if (token.type === 'paragraph') {
        const para = token as Tokens.Paragraph
        metadata.paragraphs.push(para.text)
        // 段落中提取内联链接和图片
        collectLinks(para.tokens, metadata.links, currentLine)
        collectImages(para.tokens, metadata.images, currentLine)
        // 段落中提取话题标签
        extractTags(para.text).forEach((t) => tagSet.add(t))
      }

      // ---- 代码块 ----
      else if (token.type === 'code') {
        const code = token as Tokens.Code
        metadata.codeBlocks.push({
          language: code.lang || 'plaintext',
          code: code.text,
          lineNumber: currentLine,
        })
      }

      // ---- 表格 ----
      else if (token.type === 'table') {
        const table = token as Tokens.Table
        metadata.tables.push({
          headers: table.header.map((cell) => cell.text),
          rows: table.rows.map((row) => row.map((cell) => cell.text)),
          lineNumber: currentLine,
        })
      }

      // ---- 独立图片（块级，非内联）----
      else if (token.type === 'image') {
        const img = token as Tokens.Image
        metadata.images.push({
          alt: img.text,
          url: img.href,
          lineNumber: currentLine,
        })
      }

      // ---- 引用块 ----
      else if (token.type === 'blockquote') {
        const bq = token as Tokens.Blockquote
        // 将引用块文本加入正文（去除 > 前缀）
        const cleanedText = bq.text.replace(/^[> ]+/gm, '').trim()
        if (cleanedText) {
          metadata.paragraphs.push(cleanedText)
          collectLinks(bq.tokens, metadata.links, currentLine)
          collectImages(bq.tokens, metadata.images, currentLine)
          extractTags(cleanedText).forEach((t) => tagSet.add(t))
        }
      }

      // ---- 列表 ----
      else if (token.type === 'list') {
        const list = token as Tokens.List
        // 遍历列表项，提取文本加入正文、内联链接、图片、标签
        for (const item of list.items) {
          const itemText = item.text || extractPlainText(item.tokens)
          if (itemText.trim()) {
            metadata.paragraphs.push(itemText.trim())
            extractTags(itemText).forEach((t) => tagSet.add(t))
          }
          if (item.tokens) {
            collectLinks(item.tokens, metadata.links, currentLine)
            collectImages(item.tokens, metadata.images, currentLine)
          }
        }
      }

      // ---- HTML 块 ----
      else if (token.type === 'html') {
        const htmlToken = token as Tokens.HTML
        // HTML 块中的纯文本也加入正文
        const textOnly = htmlToken.text.replace(/<[^>]*>/g, '').trim()
        if (textOnly) {
          metadata.paragraphs.push(textOnly)
        }
      }

      // 根据当前 token 的原始 Markdown 推进行号
      currentLine += countNewlines(token.raw)
    }

    // 将 Set 转为排序数组
    metadata.tags = [...tagSet].sort()

    return { success: true, data: metadata }
  } catch (e: unknown) {
    // 捕获所有异常，返回结构化错误，绝不向调用方抛未捕获异常
    const err = e instanceof Error ? e : new Error(String(e))
    return {
      success: false,
      error: {
        line: 0,
        message: err.message,
        suggestion: '请检查 Markdown 语法是否正确，尝试简化内容后重新解析',
      },
    }
  }
}

/**
 * 基于已解析的 ContentMetadata 生成统计摘要
 *
 * @param metadata — parseMarkdown 返回的元数据
 * @returns ContentStats — 各类统计数字
 */
export function getContentStats(metadata: ContentMetadata): ContentStats {
  // 总字符数 = 所有段落 + 所有代码块内容的总长度（近似原文）
  const paragraphChars = metadata.paragraphs.reduce((sum, p) => sum + p.length, 0)
  const codeChars = metadata.codeBlocks.reduce((sum, cb) => sum + cb.code.length, 0)

  return {
    totalChars: paragraphChars + codeChars,
    paragraphCount: metadata.paragraphs.length,
    hasCodeBlock: metadata.codeBlocks.length > 0,
    hasTable: metadata.tables.length > 0,
    imageCount: metadata.images.length,
    linkCount: metadata.links.length,
  }
}
