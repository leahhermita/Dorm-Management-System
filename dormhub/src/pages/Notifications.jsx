import { useEffect, useState } from 'react'
import { mockNotifications } from '../lib/mockData'
import { PageHeader, Spinner } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { getNotifications, markAllNotificationsRead, markNotificationRead, usesLiveData } from '../lib/data'

const TYPE_ICON = { payment: '💰', maintenance: '🔧', visitor: '👤', room: '🚪' }

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState(mockNotifications)
  const [loading, setLoading] = useState(usesLiveData)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    getNotifications(user?.id)
      .then(data => active && setNotifications(data))
      .catch(err => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [user?.id])

  const markAllRead = async () => {
    await markAllNotificationsRead(user?.id)
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }
  const markRead = async id => {
    await markNotificationRead(id)
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const unread = notifications.filter(n => !n.read).length

  if (loading) return <Spinner />

  return (
    <div className="fade-in">
      {error && <div className="alert-error">{error}</div>}
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread notification${unread !== 1 ? 's' : ''}`}
        action={
          unread > 0 && (
            <button className="btn-ghost" onClick={markAllRead}>Mark all read</button>
          )
        }
      />

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {notifications.map(n => (
          <div
            key={n.id}
            className="card"
            onClick={() => markRead(n.id)}
            style={{
              display:'flex',
              alignItems:'flex-start',
              gap:16,
              cursor:'pointer',
              opacity: n.read ? 0.6 : 1,
              borderLeft: n.read ? '1px solid var(--border)' : '3px solid var(--accent)',
              transition:'opacity 0.2s',
            }}
          >
            <div style={{ fontSize:24, flexShrink:0 }}>{TYPE_ICON[n.type] || '🔔'}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight: n.read ? 400 : 500 }}>{n.msg}</div>
              <div style={{ fontSize:12, color:'var(--muted)', marginTop:4 }}>{n.time}</div>
            </div>
            {!n.read && <span className="badge badge-green">New</span>}
          </div>
        ))}

        {notifications.length === 0 && (
          <div style={{ textAlign:'center', padding:'64px 20px', color:'var(--muted)' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔔</div>
            <p style={{ fontSize:14 }}>You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  )
}
