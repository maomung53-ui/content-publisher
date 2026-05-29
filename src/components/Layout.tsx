import { NavLink, Outlet } from 'react-router-dom'

// 导航菜单项配置
const navItems = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/content-edit', label: '内容编辑', icon: '✏️' },
  { path: '/platform-adapt', label: '平台适配', icon: '🔗' },
  { path: '/publish-manage', label: '发布管理', icon: '📤' },
  { path: '/account-manage', label: '账号管理', icon: '👤' },
  { path: '/task-center', label: '任务中心', icon: '📋' },
]

/**
 * 全局布局组件
 * 左侧固定导航栏 + 右侧内容区域
 */
export default function Layout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* ===== 左侧导航栏 ===== */}
      <aside className="flex flex-col w-56 min-w-[224px] h-full bg-app-bg-secondary border-r border-app-border">
        {/* Logo 区域 */}
        <div className="flex items-center h-14 px-4 border-b border-app-border">
          <span className="text-lg font-bold text-app-text-primary tracking-wide">
            内容分发中心
          </span>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors duration-150 ${
                      isActive
                        ? 'bg-app-accent text-white font-medium'
                        : 'text-app-text-secondary hover:bg-app-bg-hover hover:text-app-text-primary'
                    }`
                  }
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* 底部版本信息 */}
        <div className="px-4 py-3 border-t border-app-border text-xs text-app-text-muted">
          v1.0.0
        </div>
      </aside>

      {/* ===== 右侧内容区域 ===== */}
      <main className="flex-1 overflow-y-auto bg-app-bg-primary">
        <Outlet />
      </main>
    </div>
  )
}
