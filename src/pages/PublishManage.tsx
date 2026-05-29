import { useNavigate } from 'react-router-dom'
import GlassCard from '../components/ui/GlassCard'
import EmptyState from '../components/ui/EmptyState'

/**
 * 发布管理页 — Apple 风格 placeholder
 */
export default function PublishManage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-[1200px] mx-auto px-page-x py-section animate-fade-in">
      <h1 className="text-title text-text-primary mb-2">发布管理</h1>
      <p className="text-body text-text-secondary mb-section">管理发布计划、版本与上线下线操作</p>

      <GlassCard>
        <EmptyState
          title="发布管理即将上线"
          description="此功能正在开发中，届时您可在此管理所有平台的发布计划与状态。"
          action={{ label: '返回首页', onClick: () => navigate('/') }}
        />
      </GlassCard>
    </div>
  )
}
