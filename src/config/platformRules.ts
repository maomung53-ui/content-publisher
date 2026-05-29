// ===== 平台枚举 =====

/** 支持的平台标识 */
export enum Platform {
  /** 微信公众号 */
  wechat = 'wechat',
  /** 知乎 */
  zhihu = 'zhihu',
  /** 小红书 */
  xiaohongshu = 'xiaohongshu',
  /** B站 */
  bilibili = 'bilibili',
}

// ===== 规则接口 =====

/** 单平台适配规则 */
export interface PlatformRule {
  /** 平台中文名称 */
  name: string
  /** 简介字数上限，0 表示不限制 */
  maxDescriptionLength: number
  /** 标签数量上限，0 表示不限制 */
  maxTags: number
  /** 图片数量上限，0 表示不限制 */
  maxImages: number
  /** 是否移除正文中的外链 */
  removeExternalLinks: boolean
  /** 是否移除标题中的 emoji */
  removeEmojiFromTitle: boolean
  /** 是否强制短句分段（每句不超过 30 字） */
  shortSentenceSplit: boolean
  /** 需要追加的默认话题标签 */
  addDefaultTopics: string[]
}

// ===== 平台规则配置表 =====

export const platformRules: Record<Platform, PlatformRule> = {
  [Platform.wechat]: {
    name: '微信公众号',
    maxDescriptionLength: 0,
    maxTags: 0,
    maxImages: 0,
    removeExternalLinks: true,
    removeEmojiFromTitle: false,
    shortSentenceSplit: false,
    addDefaultTopics: [],
  },

  [Platform.zhihu]: {
    name: '知乎',
    maxDescriptionLength: 0,
    maxTags: 5,
    maxImages: 0,
    removeExternalLinks: false,
    removeEmojiFromTitle: true,
    shortSentenceSplit: false,
    addDefaultTopics: ['科技', '互联网'],
  },

  [Platform.xiaohongshu]: {
    name: '小红书',
    maxDescriptionLength: 0,
    maxTags: 10,
    maxImages: 9,
    removeExternalLinks: false,
    removeEmojiFromTitle: false,
    shortSentenceSplit: true,
    addDefaultTopics: [],
  },

  [Platform.bilibili]: {
    name: 'B站',
    maxDescriptionLength: 250,
    maxTags: 10,
    maxImages: 0,
    removeExternalLinks: false,
    removeEmojiFromTitle: false,
    shortSentenceSplit: false,
    addDefaultTopics: [],
  },
}

/** 平台对应的品牌色 */
export const platformColors: Record<Platform, string> = {
  [Platform.wechat]: '#07C160',
  [Platform.zhihu]: '#0066FF',
  [Platform.xiaohongshu]: '#FF2442',
  [Platform.bilibili]: '#FB7299',
}
