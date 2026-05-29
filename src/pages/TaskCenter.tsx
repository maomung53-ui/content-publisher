import { useNavigate } from 'react-router-dom'
import GlassCard from '../components/ui/GlassCard'
import EmptyState from '../components/ui/EmptyState'

/**
 * 任务中心页 — Apple 风格 placeholder
 */
export default function TaskCenter() {
  const navigate = useNavigate()

  return (
    <div className="max-w-[1200px] mx-auto px-page-x py-section animate-fade-in">
      <h1 className="text-title text-text-primary mb-2">任务中心</h1>
      <p className="text-body text-text-secondary mb-section">查看异步任务进度、调度日志与执行历史</p>

      <GlassCard>
        <EmptyState
          title="任务中心即将上线"
          description="此功能正在开发中，届时您可在此查看所有异步任务的执行进度与历史记录。"
          action={{ label: '返回首页', onClick: () => navigate('/') }}
        />
      </GlassCard>
    </div>
  )
}
