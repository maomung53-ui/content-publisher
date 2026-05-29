import { useNavigate } from 'react-router-dom'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'

interface StatItem { label: string; value: string }

const stats: StatItem[] = [
  { label: '内容数', value: '12' },
  { label: '接入平台', value: '4' },
  { label: '发布成功率', value: '96%' },
  { label: '今日任务', value: '3' },
]

interface QuickEntry { title: string; desc: string; path: string }

const quickEntries: QuickEntry[] = [
  { title: '内容编辑', desc: '创作和编辑你的内容', path: '/content-edit' },
  { title: '平台适配', desc: '一键适配多平台格式', path: '/platform-adapt' },
]

/**
 * 首页 — 液态玻璃 Dashboard
 */
export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="max-w-[1200px] mx-auto px-page-x py-section animate-fade-in">
      {/* Hero */}
      <section className="text-center mb-section">
        <h1 className="text-hero text-text-primary mb-element">
          多平台智能内容分发
        </h1>
        <p className="text-body text-text-secondary max-w-[600px] mx-auto mb-tight">
          一次创作，全域智能适配——自动将内容转换为各平台最佳格式
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button variant="primary" size="lg" onClick={() => navigate('/content-edit')}>
            开始创作
          </Button>
          <Button variant="tertiary" size="lg" onClick={() => navigate('/platform-adapt')}>
            查看平台适配
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 7h12m-4-4l4 4-4 4" />
            </svg>
          </Button>
        </div>
      </section>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-element mb-section">
        {stats.map((stat, i) => (
          <GlassCard key={stat.label} hoverable animationDelay={`${i * 0.1}s`}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-label text-text-secondary uppercase tracking-wider">
                  {stat.label}
                </span>
                <p className="text-display text-text-primary mt-tight">
                  {stat.value}
                </p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* 分隔线 */}
      <hr className="divider" />

      {/* 快速入口 */}
      <section>
        <h2 className="text-heading text-text-primary mb-element">快速入口</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-element">
          {quickEntries.map((entry) => (
            <GlassCard key={entry.path} hoverable onClick={() => navigate(entry.path)}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-heading text-text-primary">{entry.title}</h3>
                  <p className="text-body-sm text-text-secondary mt-1">{entry.desc}</p>
                </div>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                     className="text-text-tertiary transition-transform duration-[400ms] group-hover:translate-x-1">
                  <path d="M7 4l6 6-6 6" />
                </svg>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  )
}
