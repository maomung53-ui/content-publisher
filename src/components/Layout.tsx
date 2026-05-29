import { NavLink, Outlet } from 'react-router-dom'
import IconHome from './icons/IconHome'
import IconEdit from './icons/IconEdit'
import IconLink from './icons/IconLink'
import IconSend from './icons/IconSend'
import IconUser from './icons/IconUser'
import IconTask from './icons/IconTask'

const navItems = [
  { path: '/', label: '首页', Icon: IconHome },
  { path: '/content-edit', label: '内容编辑', Icon: IconEdit },
  { path: '/platform-adapt', label: '平台适配', Icon: IconLink },
  { path: '/publish-manage', label: '发布管理', Icon: IconSend },
  { path: '/account-manage', label: '账号管理', Icon: IconUser },
  { path: '/task-center', label: '任务中心', Icon: IconTask },
]

/**
 * 全局布局 — 液态玻璃侧边栏
 */
export default function Layout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-page">
      {/* 侧边栏 — 液态玻璃效果 */}
      <aside className="liquid-glass-plain flex flex-col w-[220px] min-w-[220px] h-full rounded-none">
        {/* Logo */}
        <div className="flex items-center gap-2 h-14 px-5 border-b border-divider-light">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <rect x="1" y="1" width="14" height="14" rx="3" />
            <circle cx="8" cy="8" r="3" />
            <path d="M8 1v6m0 2v6M1 8h6m2 0h6" strokeWidth="1" />
          </svg>
          <span className="text-heading text-text-primary font-semibold tracking-tight">
            内容分发中心
          </span>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-0.5 px-3">
            {navItems.map(({ path, label, Icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end={path === '/'}
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
                      <Icon className={isActive ? 'text-accent-blue' : 'text-text-tertiary'} />
                      <span>{label}</span>
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

      {/* 右侧内容区 */}
      <main className="flex-1 overflow-y-auto bg-surface-page">
        <Outlet />
      </main>
    </div>
  )
}
