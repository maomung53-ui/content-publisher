import { Platform, platformRules } from '../config/platformRules'
import type { PlatformRule } from '../config/platformRules'

// ===== 配置常量 =====

/** DeepSeek API 端点 */
const API_BASE = 'https://api.deepseek.com/v1/chat/completions'

/** 模型名称 */
const MODEL = 'deepseek-chat'

/** 请求超时毫秒数 */
const REQUEST_TIMEOUT_MS = 20000

/** 最大输出 token 数 */
const MAX_TOKENS = 2048

// ===== 类型定义 =====

/** 文案风格基调 */
export type StyleTone = 'professional' | 'casual' | 'balanced'

/** AI 改写强度 */
export type AdaptationIntensity = 'low' | 'medium' | 'high'

// ===== 平台 System Prompt 字典 =====

/**
 * 各平台对应的 AI 角色设定
 * 根据平台内容消费习惯定制 Prompt，引导模型产出匹配风格的文案
 */
const PLATFORM_SYSTEM_PROMPTS: Record<Platform, string> = {
  [Platform.wechat]:
    '你是资深科技媒体编辑。将以下内容改写为专业、严谨的公众号文章风格：保留完整逻辑结构，去除口语化表达，段落分明。',

  [Platform.zhihu]:
    '你是知乎高赞答主。将以下内容改写为知乎回答风格：开篇点题、逻辑严密、适度使用专业术语、结尾引发讨论。',

  [Platform.xiaohongshu]:
    '你是小红书爆款文案写手。将以下内容改写为小红书种草风格：短句分段、加适当 emoji、口语化表达、突出亮点、结尾加 3-5 个相关话题标签。严格保留原文核心信息。',

  [Platform.bilibili]:
    '你是B站知名UP主。将以下内容改写为B站视频简介风格：活泼但不浮夸、分段清晰、突出视频看点、控制字数。',
}

/**
 * 改写强度的 Prompt 修饰词
 * low → 仅调整格式，保留原始语气
 * medium → 正常风格改写
 * high → 大胆改写，仅保留核心事实
 */
const INTENSITY_MODIFIERS: Record<AdaptationIntensity, string> = {
  low: '（要求：仅润色格式和排版，不改动原始语气和用词风格）',
  medium: '',
  high: '（要求：大胆改写，可以重新组织结构和措辞，但必须保留所有核心事实和数据）',
}

// ===== 工具函数 =====

/** 从环境变量获取 API Key（Vite 在构建时注入） */
function getApiKey(): string {
  return import.meta.env.VITE_DEEPSEEK_API_KEY || ''
}

/**
 * 构建发送给 DeepSeek 的 messages 数组
 */
function buildMessages(platform: Platform, intensity: AdaptationIntensity, content: string) {
  const basePrompt = PLATFORM_SYSTEM_PROMPTS[platform]
  const modifier = INTENSITY_MODIFIERS[intensity]
  const systemPrompt = basePrompt + modifier

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content },
  ]
}

// ===== 公共 API =====

/**
 * 调用 DeepSeek API 将内容改写为指定平台的文案风格
 *
 * @param content — 待改写的内容文本
 * @param platform — 目标平台
 * @param intensity — 改写强度：low=仅润色 / medium=微调 / high=大胆改写
 * @returns AI 改写后的文本
 */
export async function aiAdaptContent(
  content: string,
  platform: Platform,
  intensity: AdaptationIntensity = 'medium',
): Promise<string> {
  // 空内容直接返回
  if (!content || content.trim().length === 0) {
    return content
  }

  const apiKey = getApiKey()
  if (!apiKey) {
    return 'AI 适配失败：未配置 API Key，请在 .env 文件中设置 VITE_DEEPSEEK_API_KEY'
  }

  const messages = buildMessages(platform, intensity, content)

  // 创建 AbortController 用于超时控制
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: intensity === 'high' ? 0.9 : 0.5,
        max_tokens: MAX_TOKENS,
      }),
      signal: controller.signal,
    })

    // 请求超时
    if (controller.signal.aborted) {
      return 'AI 适配失败：请求超时（20 秒），请稍后重试'
    }

    // HTTP 错误
    if (!response.ok) {
      let errorDetail = ''
      try {
        const errorBody = await response.json()
        errorDetail =
          (errorBody as Record<string, unknown>).error
            ? ((errorBody as Record<string, unknown>).error as Record<string, string>).message || ''
            : ''
      } catch {
        errorDetail = ''
      }
      if (response.status === 401) {
        return 'AI 适配失败：API Key 无效或已过期，请检查密钥配置'
      }
      if (response.status === 429) {
        return 'AI 适配失败：请求频率超限，请稍后重试'
      }
      if (response.status >= 500) {
        return 'AI 适配失败：DeepSeek 服务繁忙，请稍后重试'
      }
      return `AI 适配失败：API 返回错误 (${response.status})${errorDetail ? ` — ${errorDetail}` : ''}`
    }

    // 解析成功响应
    const data = await response.json()
    const typedData = data as {
      choices?: Array<{ message?: { content?: string } }>
    }

    const aiText = typedData.choices?.[0]?.message?.content
    if (!aiText) {
      return 'AI 适配失败：API 返回了空内容，请重试'
    }

    return aiText.trim()
  } catch (error: unknown) {
    // AbortController 触发的超时
    if (error instanceof DOMException && error.name === 'AbortError') {
      return 'AI 适配失败：请求超时（20 秒），请稍后重试'
    }

    // 网络错误
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return 'AI 适配失败：网络连接异常，请检查网络后重试'
    }

    // 其他错误
    const message = error instanceof Error ? error.message : String(error)
    return `AI 适配失败：${message}`
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * 并发对多个平台执行 AI 风格适配
 *
 * 使用 Promise.allSettled 确保单个平台失败不影响其他平台。
 *
 * @param originalText — 原始内容文本
 * @param platforms — 目标平台列表
 * @param intensity — 改写强度
 * @returns Map<Platform, string> — 每个平台对应的改写结果（失败平台为错误提示文本）
 */
export async function aiAdaptMultiplePlatforms(
  originalText: string,
  platforms: Platform[],
  intensity: AdaptationIntensity = 'medium',
): Promise<Map<Platform, string>> {
  const resultMap = new Map<Platform, string>()

  // 并发发起所有平台的 AI 适配请求
  const promises = platforms.map(async (platform) => {
    const result = await aiAdaptContent(originalText, platform, intensity)
    return { platform, result }
  })

  const settled = await Promise.allSettled(promises)

  for (const item of settled) {
    if (item.status === 'fulfilled') {
      resultMap.set(item.value.platform, item.value.result)
    } else {
      // Promise 级别的致命错误（如内存溢出），记录为错误提示
      resultMap.set(
        Platform.wechat, // 这里 platform 不可知，记录到第一个
        'AI 适配失败：处理异常，请重试',
      )
      // 遍历所有平台，为失败的设置错误
      for (const p of platforms) {
        if (!resultMap.has(p)) {
          resultMap.set(p, `AI 适配失败：${item.reason instanceof Error ? item.reason.message : '未知错误'}`)
        }
      }
    }
  }

  return resultMap
}
