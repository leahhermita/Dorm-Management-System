import { useEffect, useState } from 'react'
import { Plus, Download } from 'lucide-react'
import { Badge, Modal, FormField, PageHeader, EmptyState, TableHead, StatCard, Spinner } from '../components/ui'
import { mockPayments, mockTenants } from '../lib/mockData'
import { CreditCard, AlertCircle, Clock } from 'lucide-react'
import { getPayments, getTenants, markPaymentPaid, savePayment, usesLiveData } from '../lib/data'

const EMPTY_FORM = { tenant_id: '', tenant: '', room: '', amount: '', month: '', method: 'Cash', due: '', notes: '' }

export default function Payments() {
  const [payments,  setPayments]  = useState(mockPayments)
  const [tab,       setTab]       = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [tenants,   setTenants]   = useState(mockTenants)
  const [loading,   setLoading]   = useState(usesLiveData)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    let active = true
    Promise.all([getPayments(), getTenants()])
      .then(([paymentRows, tenantRows]) => {
        if (!active) return
        setPayments(paymentRows)
        setTenants(tenantRows)
      })
      .catch(err => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const filtered = tab === 'all' ? payments : payments.filter(p => p.status === tab)

  const totalPaid    = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
  const totalOverdue = payments.filter(p => p.status === 'overdue').length

  const markPaid = async (id) => {
    try {
      if (usesLiveData) {
        const saved = await markPaymentPaid(id)
        setPayments(payments.map(p => p.id === id ? saved : p))
      } else {
        setPayments(payments.map(p => p.id === id ? { ...p, status: 'paid', date: new Date().toISOString().slice(0,10), method: 'Cash' } : p))
      }
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSave = async () => {
    try {
      if (usesLiveData) {
        const saved = await savePayment(form)
        setPayments([saved, ...payments])
      } else {
        setPayments([...payments, { id: Date.now(), ...form, status: 'pending', amount: +form.amount }])
      }
      setShowModal(false)
      setForm(EMPTY_FORM)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const selectTenant = tenantId => {
    const tenant = tenants.find(t => String(t.id) === String(tenantId))
    setForm({ ...form, tenant_id: tenantId, tenant: tenant?.name || '', room: tenant?.room || '' })
  }

  if (loading) return <Spinner />

  return (
    <div className="fade-in">
      <PageHeader
        title="Payments"
        subtitle="Billing & payment history"
        action={
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Record Payment
          </button>
        }
      />
      {error && <div className="alert-error">{error}</div>}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard icon={CreditCard}   label="Total Collected (this month)" value={`₱${totalPaid.toLocaleString()}`}    sub={`${payments.filter(p=>p.status==='paid').length} payments`}    color="#6ee7b7" />
        <StatCard icon={Clock}        label="Outstanding Balance"           value={`₱${totalPending.toLocaleString()}`} sub={`${payments.filter(p=>p.status==='pending').length} pending`}  color="#fbbf24" />
        <StatCard icon={AlertCircle}  label="Overdue Payments"              value={String(totalOverdue)}                sub="Needs follow-up"                                                color="#f85149" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all','paid','pending','overdue'].map(t => (
          <button key={t} className={`tab${tab===t?' active':''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? <EmptyState icon="💸" message="No payments found." /> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <TableHead columns={['Tenant','Room','Period','Amount','Method','Due Date','Status','Action']} />
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="table-row">
                  <td style={{ padding:'14px 20px', fontWeight:500, fontSize:14 }}>{p.tenant}</td>
                  <td style={{ padding:'14px 20px' }}><span className="badge badge-blue">Room {p.room}</span></td>
                  <td style={{ padding:'14px 20px', fontSize:13, color:'var(--muted)' }}>{p.month}</td>
                  <td style={{ padding:'14px 20px', fontWeight:600, color:'var(--accent)' }}>₱{p.amount.toLocaleString()}</td>
                  <td style={{ padding:'14px 20px', fontSize:13 }}>{p.method}</td>
                  <td style={{ padding:'14px 20px', fontSize:13, color: p.status==='overdue'?'#f85149':'var(--muted)' }}>{p.due}</td>
                  <td style={{ padding:'14px 20px' }}><Badge status={p.status} /></td>
                  <td style={{ padding:'14px 20px' }}>
                    {p.status === 'paid'
                      ? <button className="btn-ghost" style={{ padding:'5px 12px', fontSize:12, display:'inline-flex', alignItems:'center', gap:4 }}><Download size={12}/> Receipt</button>
                      : <button className="btn-primary" style={{ padding:'5px 12px', fontSize:12 }} onClick={() => markPaid(p.id)}>✓ Mark Paid</button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Payment Modal */}
      {showModal && (
        <Modal title="Record Payment" onClose={() => setShowModal(false)}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <FormField label="Tenant Name">
              <select className="input-field" value={form.tenant_id} onChange={e => selectTenant(e.target.value)}>
                <option value="">Select tenant</option>
                {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </FormField>
            <FormField label="Room">
              <input className="input-field" placeholder="e.g. 101" value={form.room} onChange={e => setForm({...form, room:e.target.value})} />
            </FormField>
            <FormField label="Amount (₱)">
              <input type="number" className="input-field" value={form.amount} onChange={e => setForm({...form, amount:e.target.value})} />
            </FormField>
            <FormField label="Month / Period">
              <input className="input-field" placeholder="e.g. June 2025" value={form.month} onChange={e => setForm({...form, month:e.target.value})} />
            </FormField>
            <FormField label="Payment Method">
              <select className="input-field" value={form.method} onChange={e => setForm({...form, method:e.target.value})}>
                {['Cash','GCash','Bank Transfer','Maya','Check'].map(m => <option key={m}>{m}</option>)}
              </select>
            </FormField>
            <FormField label="Due Date">
              <input type="date" className="input-field" value={form.due} onChange={e => setForm({...form, due:e.target.value})} />
            </FormField>
            <div style={{ gridColumn:'1/-1' }}>
              <FormField label="Notes (optional)">
                <textarea className="input-field" value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} />
              </FormField>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:24 }}>
            <button className="btn-ghost" style={{ flex:1 }} onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" style={{ flex:2, justifyContent:'center' }} onClick={handleSave}>Save Payment</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
