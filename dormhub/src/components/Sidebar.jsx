import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BedDouble, Users, CreditCard, Wrench, UserCheck, Bell, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Avatar } from './ui'

const NAV_ADMIN = [
  { to:'/',              label:'Dashboard',      Icon:LayoutDashboard },
  { to:'/rooms',         label:'Rooms',          Icon:BedDouble },
  { to:'/tenants',       label:'Tenants',        Icon:Users },
  { to:'/payments',      label:'Payments',       Icon:CreditCard },
  { to:'/maintenance',   label:'Maintenance',    Icon:Wrench },
  { to:'/visitors',      label:'Visitors',       Icon:UserCheck },
  { to:'/notifications', label:'Notifications',  Icon:Bell },
  { to:'/setup',         label:'Supabase Setup', Icon:Settings },
]

const NAV_STUDENT = [
  { to:'/student',              label:'My Dashboard',   Icon:LayoutDashboard },
  { to:'/student/room',         label:'My Room',        Icon:BedDouble },
  { to:'/student/payments',     label:'My Payments',    Icon:CreditCard },
  { to:'/student/maintenance',  label:'Maintenance',    Icon:Wrench },
  { to:'/notifications',        label:'Notifications',  Icon:Bell },
]

const NAV_STAFF = [
  { to:'/',              label:'Dashboard',   Icon:LayoutDashboard },
  { to:'/maintenance',   label:'Maintenance', Icon:Wrench },
  { to:'/visitors',      label:'Visitors',    Icon:UserCheck },
  { to:'/notifications', label:'Notifications', Icon:Bell },
]

const ROLE_COLOR = { admin:'#6ee7b7', student:'#818cf8', staff:'#f472b6' }
const ROLE_EMOJI = { admin:'👑', student:'🎓', staff:'🔧' }

export default function Sidebar({ unreadCount = 0 }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const role = profile?.role || 'student'

  const NAV = role === 'admin' ? NAV_ADMIN : role === 'staff' ? NAV_STAFF : NAV_STUDENT
  const color = ROLE_COLOR[role] || '#6ee7b7'

  const handleLogout = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding:'24px 20px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:38, height:38, background:'rgba(110,231,183,0.15)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🏠</div>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:18 }}>DormHub</div>
            <div style={{ fontSize:11, color:'var(--muted)' }}>Management System</div>
          </div>
        </div>
      </div>

      {/* User */}
      <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Avatar name={profile?.full_name || 'User'} color={color} size={36} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:14, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{profile?.full_name || 'User'}</div>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:2 }}>
              <span style={{ fontSize:12 }}>{ROLE_EMOJI[role]}</span>
              <span style={{ fontSize:11, color, textTransform:'uppercase', letterSpacing:'0.05em' }}>{role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'12px', overflowY:'auto' }}>
        {NAV.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} end={to === '/' || to === '/student'} style={{ textDecoration:'none' }}>
            {({ isActive }) => (
              <div className={`nav-item${isActive ? ' active' : ''}`}>
                <Icon size={18} />
                <span>{label}</span>
                {label === 'Notifications' && unreadCount > 0 && (
                  <span style={{ marginLeft:'auto', background:'#f85149', color:'white', fontSize:11, padding:'1px 7px', borderRadius:10, fontWeight:600 }}>
                    {unreadCount}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding:'12px', borderTop:'1px solid var(--border)' }}>
        <button onClick={handleLogout} className="nav-item"
          style={{ width:'100%', background:'none', border:'none', cursor:'pointer', textAlign:'left' }}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
