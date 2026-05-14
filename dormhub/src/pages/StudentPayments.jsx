import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Badge, PageHeader, EmptyState, TableHead, Spinner } from '../components/ui'
import { mockPayments } from '../lib/mockData'
import { getPayments, usesLiveData } from '../lib/data'

export default function StudentPayments() {
  const { profile } = useAuth()
  const [payments, setPayments] = useState(mockPayments)
  const [loading, setLoading] = useState(usesLiveData)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    getPayments()
      .then(data => active && setPayments(data))
      .catch(err => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const myPayments = payments.filter(p => p.room === profile?.room || p.tenant_id === profile?.tenant_id)
  const totalPaid  = myPayments.filter(p => p.status === 'paid').reduce((s,p) => s + p.amount, 0)
  const pending    = myPayments.find(p => p.status !== 'paid')

  if (loading) return <Spinner />

  return (
    <div className="fade-in">
      <PageHeader title="My Payments" subtitle="Billing history and payment status" />
      {error && <div className="alert-error">{error}</div>}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        <div className="stat-card">
          <div style={{ color:'var(--accent)', fontFamily:'var(--font-display)', fontWeight:700, fontSize:24 }}>₱{totalPaid.toLocaleString()}</div>
          <div style={{ color:'var(--muted)', fontSize:13, marginTop:4 }}>Total Paid</div>
        </div>
        <div className="stat-card">
          <div style={{ color: pending ? '#fbbf24' : 'var(--accent)', fontFamily:'var(--font-display)', fontWeight:700, fontSize:24 }}>
            {pending ? `₱${pending.amount.toLocaleString()}` : '—'}
          </div>
          <div style={{ color:'var(--muted)', fontSize:13, marginTop:4 }}>Next Due</div>
        </div>
        <div className="stat-card">
          <div style={{ color:'var(--accent)', fontFamily:'var(--font-display)', fontWeight:700, fontSize:24 }}>{myPayments.filter(p=>p.status==='paid').length}</div>
          <div style={{ color:'var(--muted)', fontSize:13, marginTop:4 }}>Payments Made</div>
        </div>
      </div>

      {myPayments.length === 0 ? <EmptyState icon="💸" message="No payment records yet." /> : (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <TableHead columns={['Period','Amount','Method','Date Paid','Due Date','Status']} />
            <tbody>
              {myPayments.map(p => (
                <tr key={p.id} className="table-row">
                  <td style={{ padding:'14px 20px', fontWeight:500 }}>{p.month}</td>
                  <td style={{ padding:'14px 20px', fontWeight:600, color:'var(--accent)' }}>₱{p.amount.toLocaleString()}</td>
                  <td style={{ padding:'14px 20px', fontSize:13 }}>{p.method}</td>
                  <td style={{ padding:'14px 20px', fontSize:13, color:'var(--muted)' }}>{p.date}</td>
                  <td style={{ padding:'14px 20px', fontSize:13, color: p.status==='overdue'?'#f85149':'var(--muted)' }}>{p.due}</td>
                  <td style={{ padding:'14px 20px' }}><Badge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
