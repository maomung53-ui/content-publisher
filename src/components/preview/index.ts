import PreviewWechat from './PreviewWechat'
import PreviewZhihu from './PreviewZhihu'
import PreviewXiaohongshu from './PreviewXiaohongshu'
import PreviewBilibili from './PreviewBilibili'
import type { PreviewProps } from './PreviewWechat'

export type { PreviewProps }
export { PreviewWechat, PreviewZhihu, PreviewXiaohongshu, PreviewBilibili }

/** 根据平台标识获取对应预览组件 */
export function getPreviewComponent(platform: string) {
  switch (platform) {
    case 'wechat': return PreviewWechat
    case 'zhihu': return PreviewZhihu
    case 'xiaohongshu': return PreviewXiaohongshu
    case 'bilibili': return PreviewBilibili
    default: return null
  }
}
