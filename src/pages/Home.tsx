import { useNavigate } from 'react-router-dom'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'

/** 统计数据项 */
interface StatItem { label: string; value: string; icon: string }

const stats: StatItem[] = [
  { label: '内容数', value: '12', icon: '📄' },
  { label: '接入平台', value: '4', icon: '🔗' },
  { label: '发布成功率', value: '96%', icon: '✅' },
  { label: '今日任务', value: '3', icon: '📋' },
]

/** 快速入口项 */
interface QuickEntry { icon: string; title: string; desc: string; path: string }

const quickEntries: QuickEntry[] = [
  { icon: '✏️', title: '内容编辑', desc: '创作和编辑你的内容', path: '/content-edit' },
  { icon: '🔗', title: '平台适配', desc: '一键适配多平台格式', path: '/platform-adapt' },
]

/**
 * 首页 — Apple 官网 Dashboard 风格
 * Hero 大标题 + 统计卡片 staggered + 快速入口可交互卡片
 */
export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="max-w-[1200px] mx-auto px-page-x py-section animate-fade-in">
      {/* ===== Hero 区域 ===== */}
      <section className="text-center mb-section">
        <h1 className="text-hero text-text-primary mb-element">
          多平台智能内容分发
        </h1>
        <p className="text-body text-text-secondary max-w-[600px] mx-auto mb-tight">
          一次创作，全域智能适配——自动将内容转换为各平台最佳格式
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button variant="primary" size="lg" onClick={() => navigate('/content-edit')}>
            ✏️ 开始创作
          </Button>
          <Button variant="tertiary" size="lg" onClick={() => navigate('/platform-adapt')}>
            查看平台适配 →
          </Button>
        </div>
      </section>

      {/* ===== 统计卡片 — spring-in stagger ===== */}
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
              <span className="text-3xl opacity-40">{stat.icon}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* 分隔线 */}
      <hr className="divider" />

      {/* ===== 快速入口 ===== */}
      <section>
        <h2 className="text-heading text-text-primary mb-element">快速入口</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-element">
          {quickEntries.map((entry) => (
            <GlassCard
              key={entry.path}
              hoverable
              onClick={() => navigate(entry.path)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <span className="text-3xl">{entry.icon}</span>
                  <div>
                    <h3 className="text-heading text-text-primary">{entry.title}</h3>
                    <p className="text-body-sm text-text-secondary mt-1">{entry.desc}</p>
                  </div>
                </div>
                <span className="text-text-tertiary text-xl transition-all duration-[400ms] group-hover:translate-x-2">
                  →
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  )
}
