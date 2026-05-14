import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Users, BedDouble, CreditCard, Wrench } from 'lucide-react'
import { StatCard, Badge, Spinner } from '../components/ui'
import { mockPayments, mockMaintenance, revenueData, mockRooms } from '../lib/mockData'
import { getDashboardData, usesLiveData } from '../lib/data'

export default function Dashboard() {
  const [data, setData] = useState({
    rooms: mockRooms,
    tenants: [],
    payments: mockPayments,
    maintenance: mockMaintenance,
    revenue: revenueData,
  })
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

  const stats = useMemo(() => {
    const totalRooms = data.rooms.length
    const occupiedRooms = data.rooms.filter(r => r.status === 'occupied').length
    const paidPayments = data.payments.filter(p => p.status === 'paid')
    const monthlyRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0)
    const pendingRequests = data.maintenance.filter(m => m.status === 'pending').length
    const highPriority = data.maintenance.filter(m => m.priority === 'high' && m.status !== 'resolved').length
    const roomStatus = [
      { label: 'Occupied', count: occupiedRooms, total: totalRooms || 1, color: '#818cf8' },
      { label: 'Vacant', count: data.rooms.filter(r => r.status === 'vacant').length, total: totalRooms || 1, color: '#6ee7b7' },
      { label: 'Maintenance', count: data.rooms.filter(r => r.status === 'maintenance').length, total: totalRooms || 1, color: '#fbbf24' },
    ]
    return { totalRooms, occupiedRooms, monthlyRevenue, paidPayments, pendingRequests, highPriority, roomStatus }
  }, [data])

  if (loading) return <Spinner />

  return (
    <div className="fade-in">
      {error && <div className="alert-error">{error}</div>}
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26 }}>Dashboard</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
          Welcome back, Admin · {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard icon={Users}     label="Total Tenants"    value={String(data.tenants.length || 5)} sub="Active records" color="#6ee7b7" />
        <StatCard icon={BedDouble} label="Occupied Rooms"   value={`${stats.occupiedRooms} / ${stats.totalRooms}`} sub={`${Math.round((stats.occupiedRooms / (stats.totalRooms || 1)) * 100)}% occupancy`} color="#818cf8" />
        <StatCard icon={CreditCard} label="Monthly Revenue" value={`₱${stats.monthlyRevenue.toLocaleString()}`} sub={`${stats.paidPayments.length} paid`} color="#f472b6" />
        <StatCard icon={Wrench}    label="Pending Requests" value={String(stats.pendingRequests)} sub={`${stats.highPriority} high priority`} color="#fbbf24" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Revenue chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Revenue Trend</h3>
            <span className="badge badge-green">Monthly</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data.revenue} barCategoryGap="30%">
              <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
                formatter={v => [`₱${v.toLocaleString()}`, 'Revenue']}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {data.revenue.map((_, i) => (
                  <Cell key={i} fill={i === data.revenue.length - 1 ? 'var(--accent)' : 'var(--surface2)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Occupancy */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Room Status</h3>
          {stats.roomStatus.map(r => (
            <div key={r.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span>{r.label}</span>
                <span style={{ color: r.color, fontWeight: 600 }}>{r.count}/{r.total}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(r.count / r.total) * 100}%`, background: r.color }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 16, padding: 12, background: 'var(--surface2)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--accent)' }}>{Math.round((stats.occupiedRooms / (stats.totalRooms || 1)) * 100)}%</div>
            <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>Overall Occupancy</div>
          </div>
        </div>
      </div>

      {/* Recent rows */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Payments */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Recent Payments</h3>
          {data.payments.slice(0, 4).map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{p.tenant}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Room {p.room} · {p.month}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>₱{p.amount.toLocaleString()}</div>
                <Badge status={p.status} />
              </div>
            </div>
          ))}
        </div>

        {/* Maintenance */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Maintenance Requests</h3>
          {data.maintenance.slice(0, 4).map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{m.issue.length > 32 ? m.issue.slice(0, 32) + '…' : m.issue}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{m.tenant} · Room {m.room}</div>
              </div>
              <Badge status={m.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
