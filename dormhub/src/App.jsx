import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Sidebar from './components/Sidebar'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Rooms from './pages/Rooms'
import Tenants from './pages/Tenants'
import Payments from './pages/Payments'
import Maintenance from './pages/Maintenance'
import Visitors from './pages/Visitors'
import Notifications from './pages/Notifications'
import SetupPage from './pages/SetupPage'
import StudentDashboard from './pages/StudentDashboard'
import StudentRoom from './pages/StudentRoom'
import StudentPayments from './pages/StudentPayments'
import StudentMaintenance from './pages/StudentMaintenance'
import { mockNotifications } from './lib/mockData'
import { Spinner } from './components/ui'

function ProtectedLayout() {
  const { user, profile, loading } = useAuth()

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <Spinner />
    </div>
  )
  if (!user) return <Navigate to="/auth" replace />

  const role = profile?.role || 'student'
  const unread = mockNotifications.filter(n => !n.read).length

  return (
    <div className="layout">
      <Sidebar unreadCount={unread} />
      <main className="main-content">
        <Routes>
          {/* ADMIN routes */}
          {role === 'admin' && <>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/rooms"         element={<Rooms />} />
            <Route path="/tenants"       element={<Tenants />} />
            <Route path="/payments"      element={<Payments />} />
            <Route path="/maintenance"   element={<Maintenance />} />
            <Route path="/visitors"      element={<Visitors />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/setup"         element={<SetupPage />} />
            <Route path="*"              element={<Navigate to="/" replace />} />
          </>}

          {/* STUDENT routes */}
          {role === 'student' && <>
            <Route path="/student"             element={<StudentDashboard />} />
            <Route path="/student/room"        element={<StudentRoom />} />
            <Route path="/student/payments"    element={<StudentPayments />} />
            <Route path="/student/maintenance" element={<StudentMaintenance />} />
            <Route path="/notifications"       element={<Notifications />} />
            <Route path="*"                    element={<Navigate to="/student" replace />} />
          </>}

          {/* STAFF routes */}
          {role === 'staff' && <>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/maintenance"   element={<Maintenance />} />
            <Route path="/visitors"      element={<Visitors />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="*"              element={<Navigate to="/" replace />} />
          </>}
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/*"   element={<ProtectedLayout />} />
      </Routes>
    </AuthProvider>
  )
}
