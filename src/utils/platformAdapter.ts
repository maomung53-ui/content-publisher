import type { ContentMetadata } from './contentParser'
import { Platform, platformRules } from '../config/platformRules'
import type { PlatformRule } from '../config/platformRules'

// ===== 类型定义 =====

/** 适配后的平台内容 */
export interface AdaptedContent {
  /** 目标平台 */
  platform: Platform
  /** 适配后的标题 */
  title: string
  /** 适配后的正文（段落用 \n\n 拼接） */
  body: string
  /** 适配后的标签列表 */
  tags: string[]
  /** 实际使用的图片数量 */
  imageCount: number
  /** 适配过程中产生的警告信息 */
  warnings: string[]
}

// ===== 内部工具函数 =====

/** Emoji 正则 — 覆盖常见 Unicode emoji 范围 */
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{200C}]+/gu

/** 外链正则 — 匹配 Markdown 链接语法 [文本](url) */
const LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/g

/** 短句分段上限字数 */
const MAX_SENTENCE_LENGTH = 30

/**
 * 移除标题中的 emoji 字符
 * 使用 Unicode 范围正则匹配并删除
 */
function removeEmoji(text: string): string {
  return text.replace(EMOJI_REGEX, '').trim()
}

/**
 * 替换正文中的 Markdown 外链为纯文本提示
 * 例如：[点击这里](https://example.com) → 点击这里（详见原文链接）
 *
 * @param text — 段落原文（可能包含 Markdown 链接语法）
 * @returns 替换后的文本
 */
function removeLinks(text: string): string {
  return text.replace(LINK_REGEX, (_fullMatch, linkText: string) => {
    return `${linkText}（详见原文链接）`
  })
}

/**
 * 对段落文本执行短句分段
 *
 * 1. 按中文标点（。！？）和英文句尾标点（! ? .）拆分句子
 * 2. 对超过 30 字的句子，每 30 字插入一个换行（保留标点不拆分）
 * 3. 用换行符重新拼接所有句子
 *
 * @param text — 单段文本
 * @returns 短句分段后的文本
 */
function splitShortSentences(text: string): string {
  if (text.length <= MAX_SENTENCE_LENGTH) return text

  // 按句末标点拆分（保留标点在句子末尾）
  const sentencePattern = /([^。！？!?.\n]+[。！？!?.]?)/g
  const sentences: string[] = []
  let match: RegExpExecArray | null

  while ((match = sentencePattern.exec(text)) !== null) {
    sentences.push(match[1])
  }

  // 如果没有匹配到任何句子，直接对原文分段
  if (sentences.length === 0) {
    return forceInsertBreaks(text, MAX_SENTENCE_LENGTH)
  }

  // 对每个句子检查长度，超长则强制分段
  const processed = sentences.map((sentence) => {
    if (sentence.length <= MAX_SENTENCE_LENGTH) return sentence
    return forceInsertBreaks(sentence, MAX_SENTENCE_LENGTH)
  })

  return processed.join('\n')
}

/**
 * 对超长文本每 N 个字符强制插入换行符
 */
function forceInsertBreaks(text: string, chunkSize: number): string {
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize))
  }
  return chunks.join('\n')
}

// ===== 公共 API =====

/**
 * 将解析后的内容元数据适配到指定平台
 *
 * 根据平台规则对标题、正文、标签、图片进行转换和限制。
 * 纯函数，不修改输入参数。
 *
 * @param metadata — 解析引擎产出的内容元数据
 * @param platform — 目标平台
 * @returns 适配后的内容，包含可能产生的警告信息
 */
export function adaptForPlatform(metadata: ContentMetadata, platform: Platform): AdaptedContent {
  const rule: PlatformRule = platformRules[platform]
  const warnings: string[] = []

  // ---- 标题处理 ----

  let title = metadata.title ?? ''
  if (rule.removeEmojiFromTitle) {
    const cleaned = removeEmoji(title)
    if (cleaned !== title) {
      warnings.push('已移除标题中的 emoji 字符')
      title = cleaned
    }
  }

  // ---- 正文处理 ----

  let paragraphs: string[] = [...metadata.paragraphs]

  // 规则：移除正文外链
  if (rule.removeExternalLinks) {
    const beforeCount = paragraphs.reduce((sum, p) => sum + (p.match(LINK_REGEX) || []).length, 0)
    paragraphs = paragraphs.map((p) => removeLinks(p))
    if (beforeCount > 0) {
      warnings.push(`已将 ${beforeCount} 处外链替换为文字提示`)
    }
  }

  // 规则：短句分段
  if (rule.shortSentenceSplit) {
    paragraphs = paragraphs.map((p) => splitShortSentences(p))
    warnings.push('已对正文进行短句分段处理')
  }

  const body: string = paragraphs.join('\n\n')

  // 规则：字数上限截断
  if (rule.maxDescriptionLength > 0 && body.length > rule.maxDescriptionLength) {
    warnings.push(
      `正文长度 ${body.length} 字超出平台上限 ${rule.maxDescriptionLength} 字，已截断`,
    )
    // 在字符边界截断，尝试在最近的空格/换行处断开
    const truncated = body.slice(0, rule.maxDescriptionLength)
    const lastBreak = Math.max(truncated.lastIndexOf('\n'), truncated.lastIndexOf('。'), truncated.lastIndexOf('！'))
    // 如果有合适的断点且在最后 50 字以内，从断点处截断
    const cutPoint = lastBreak > rule.maxDescriptionLength - 50 ? lastBreak + 1 : rule.maxDescriptionLength
    return {
      platform,
      title,
      body: body.slice(0, cutPoint).trimEnd(),
      tags: clampTags(metadata.tags, rule, metadata, warnings),
      imageCount: clampImages(metadata.images.length, rule, metadata, warnings),
      warnings,
    }
  }

  return {
    platform,
    title,
    body,
    tags: clampTags(metadata.tags, rule, metadata, warnings),
    imageCount: clampImages(metadata.images.length, rule, metadata, warnings),
    warnings,
  }
}

/**
 * 对所有选中平台执行适配
 *
 * @param metadata — 内容元数据
 * @param selectedPlatforms — 需要适配的平台列表
 * @returns 每个平台对应一个 AdaptedContent 结果
 */
export function adaptAllPlatforms(metadata: ContentMetadata, selectedPlatforms: Platform[]): AdaptedContent[] {
  return selectedPlatforms.map((platform) => adaptForPlatform(metadata, platform))
}

// ===== 内部辅助 =====

/**
 * 根据规则裁剪标签列表，超出上限时截断并添加警告
 */
function clampTags(
  tags: string[],
  rule: PlatformRule,
  metadata: ContentMetadata,
  warnings: string[],
): string[] {
  // 合并默认话题
  const merged = [...tags]
  for (const topic of rule.addDefaultTopics) {
    if (!merged.includes(topic)) {
      merged.push(topic)
    }
  }

  if (rule.maxTags > 0 && merged.length > rule.maxTags) {
    const exceeded = merged.length - rule.maxTags
    warnings.push(`标签数量 ${merged.length} 超出平台上限 ${rule.maxTags}，已截断（移除 ${exceeded} 个）`)
    return merged.slice(0, rule.maxTags)
  }
  return merged
}

/**
 * 根据规则限制图片数量，超出上限时添加警告
 */
function clampImages(
  imageCount: number,
  rule: PlatformRule,
  metadata: ContentMetadata,
  warnings: string[],
): number {
  if (rule.maxImages > 0 && imageCount > rule.maxImages) {
    warnings.push(`图片数量 ${imageCount} 超出平台上限 ${rule.maxImages}，将仅上传前 ${rule.maxImages} 张`)
    return rule.maxImages
  }
  return imageCount
}
