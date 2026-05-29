import { useNavigate } from 'react-router-dom'
import GlassCard from '../components/ui/GlassCard'
import EmptyState from '../components/ui/EmptyState'

/**
 * 账号管理页 — Apple 风格 placeholder
 */
export default function AccountManage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-[1200px] mx-auto px-page-x py-section animate-fade-in">
      <h1 className="text-title text-text-primary mb-2">账号管理</h1>
      <p className="text-body text-text-secondary mb-section">管理各目标平台的账号绑定与授权</p>

      <GlassCard>
        <EmptyState
          title="账号管理即将上线"
          description="此功能正在开发中，届时您可在此绑定和管理各平台的发布账号。"
          action={{ label: '返回首页', onClick: () => navigate('/') }}
        />
      </GlassCard>
    </div>
  )
}
