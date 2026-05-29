import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/ui/ToastContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import ContentEdit from './pages/ContentEdit'
import PlatformAdapt from './pages/PlatformAdapt'
import PublishManage from './pages/PublishManage'
import AccountManage from './pages/AccountManage'
import TaskCenter from './pages/TaskCenter'

/**
 * 应用根组件
 * ToastProvider 包裹路由，全局通知可用
 */
export default function App() {
  return (
    <ToastProvider>
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
    </ToastProvider>
  )
}
