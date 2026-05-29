import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/content-edit', label: '内容编辑', icon: '✏️' },
  { path: '/platform-adapt', label: '平台适配', icon: '🔗' },
  { path: '/publish-manage', label: '发布管理', icon: '📤' },
  { path: '/account-manage', label: '账号管理', icon: '👤' },
  { path: '/task-center', label: '任务中心', icon: '📋' },
]

/**
 * Apple 官网风格全局布局
 * 左侧磨砂玻璃侧边栏 + 右侧页面白底内容区
 */
export default function Layout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-page">
      {/* ===== 侧边栏 — 磨砂玻璃白底 ===== */}
      <aside
        className="flex flex-col w-[220px] min-w-[220px] h-full
                   bg-white/90 backdrop-blur-2xl
                   border-r border-divider-light"
      >
        {/* Logo */}
        <div className="flex items-center h-14 px-5 border-b border-divider-light">
          <span className="text-heading text-text-primary font-semibold tracking-tight">
            内容分发中心
          </span>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-0.5 px-3">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 px-3 py-2.5 rounded-md text-body-sm
                     transition-all duration-200
                     ${
                       isActive
                         ? 'bg-black/[0.04] text-text-primary font-medium'
                         : 'text-text-secondary hover:text-text-primary hover:bg-black/[0.03]'
                     }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5
                                         bg-accent-blue rounded-r-full" />
                      )}
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* 版本号 */}
        <div className="px-5 py-4 border-t border-divider-light text-center">
          <span className="text-label text-text-tertiary">v1.0.0</span>
        </div>
      </aside>

      {/* ===== 右侧内容区 ===== */}
      <main className="flex-1 overflow-y-auto bg-surface-page">
        <Outlet />
      </main>
    </div>
  )
}
