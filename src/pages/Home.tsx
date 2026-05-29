/**
 * 首页 — 内容分发系统概览
 */
export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-app-text-primary mb-2">首页</h1>
      <p className="text-app-text-secondary">欢迎使用多平台智能内容分发系统</p>

      {/* 统计卡片区域 — 占位 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { label: '今日发布', value: '--' },
          { label: '待审核', value: '--' },
          { label: '已适配平台', value: '--' },
          { label: '活跃任务', value: '--' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-app-border bg-app-bg-tertiary p-4"
          >
            <span className="text-sm text-app-text-secondary">{stat.label}</span>
            <p className="text-2xl font-bold text-app-text-primary mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
