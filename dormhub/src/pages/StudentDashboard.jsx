import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Badge, Spinner } from '../components/ui'
import { mockPayments, mockMaintenance, mockRooms } from '../lib/mockData'
import { getDashboardData, usesLiveData } from '../lib/data'

export default function StudentDashboard() {
  const { profile } = useAuth()
  const [data, setData] = useState({ rooms: mockRooms, payments: mockPayments, maintenance: mockMaintenance })
  const [loading, setLoading] = useState(usesLiveData)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    getDashboardData()
      .then(nextData => active && setData(nextData))
      .catch(err => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const room = data.rooms.find(r => r.room_number === profile?.room) || data.rooms[0]
  const myPayments = data.payments.filter(p => p.room === profile?.room || p.tenant_id === profile?.tenant_id).slice(0, 4)
  const myRequests = data.maintenance.filter(m => m.room === profile?.room || m.tenant_id === profile?.tenant_id).slice(0, 3)

  if (loading) return <Spinner />

  return (
    <div className="fade-in">
      {error && <div className="alert-error">{error}</div>}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:26 }}>
          Welcome, {profile?.full_name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color:'var(--muted)', fontSize:14, marginTop:4 }}>
          Here's your dormitory overview
        </p>
      </div>

      {/* Room summary */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
        <div className="card" style={{ borderColor:'var(--accent)', background:'rgba(110,231,183,0.04)' }}>
          <div style={{ fontSize:12, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>My Room</div>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:40, color:'var(--accent)' }}>#{room?.room_number}</div>
          <div style={{ color:'var(--muted)', fontSize:13, marginTop:4 }}>Floor {room?.floor} · {room?.type}</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:12 }}>
            {room?.amenities?.map(a => <span key={a} className="badge badge-blue" style={{ fontSize:11 }}>{a}</span>)}
          </div>
          <div style={{ marginTop:14, fontWeight:600, fontSize:18, color:'var(--accent)' }}>
            ₱{room?.price?.toLocaleString()}<span style={{ fontSize:13, fontWeight:400, color:'var(--muted)' }}>/month</span>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {/* Next payment */}
          <div className="card">
            <div style={{ fontSize:12, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Next Payment</div>
            {(() => {
              const pending = myPayments.find(p => p.status !== 'paid')
              return pending ? (
                <>
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:22, color:'#fbbf24' }}>₱{pending.amount.toLocaleString()}</div>
                  <div style={{ fontSize:13, color:'var(--muted)', marginTop:4 }}>Due {pending.due}</div>
                  <Badge status={pending.status} />
                </>
              ) : (
                <div style={{ color:'var(--accent)', fontSize:14, marginTop:4 }}>✓ All payments up to date!</div>
              )
            })()}
          </div>
          {/* Maintenance */}
          <div className="card">
            <div style={{ fontSize:12, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Open Requests</div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:28, color:'var(--accent2)' }}>
              {myRequests.filter(r => r.status !== 'resolved').length}
            </div>
            <div style={{ fontSize:13, color:'var(--muted)', marginTop:4 }}>maintenance requests</div>
          </div>
        </div>
      </div>

      {/* Recent payments */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div className="card">
          <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, marginBottom:16 }}>Payment History</h3>
          {myPayments.length === 0 ? (
            <p style={{ color:'var(--muted)', fontSize:13 }}>No payment records yet.</p>
          ) : myPayments.map(p => (
            <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:500 }}>{p.month}</div>
                <div style={{ fontSize:12, color:'var(--muted)' }}>Via {p.method}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--accent)' }}>₱{p.amount.toLocaleString()}</div>
                <Badge status={p.status} />
              </div>
            </div>
          ))}
        </div>

        {/* Recent requests */}
        <div className="card">
          <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, marginBottom:16 }}>My Requests</h3>
          {myRequests.length === 0 ? (
            <p style={{ color:'var(--muted)', fontSize:13 }}>No maintenance requests yet.</p>
          ) : myRequests.map(r => (
            <div key={r.id} style={{ padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ fontSize:14, fontWeight:500, flex:1, marginRight:8 }}>{r.issue}</div>
                <Badge status={r.status} />
              </div>
              <div style={{ fontSize:12, color:'var(--muted)', marginTop:4 }}>{r.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
