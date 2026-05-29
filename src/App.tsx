import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import ContentEdit from './pages/ContentEdit'
import PlatformAdapt from './pages/PlatformAdapt'
import PublishManage from './pages/PublishManage'
import AccountManage from './pages/AccountManage'
import TaskCenter from './pages/TaskCenter'

/**
 * 应用根组件
 * 使用 Layout 作为全局布局，嵌套子路由渲染到 <Outlet />
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/content-edit" element={<ContentEdit />} />
        <Route path="/platform-adapt" element={<PlatformAdapt />} />
        <Route path="/publish-manage" element={<PublishManage />} />
        <Route path="/account-manage" element={<AccountManage />} />
        <Route path="/task-center" element={<TaskCenter />} />
      </Route>
    </Routes>
  )
}
