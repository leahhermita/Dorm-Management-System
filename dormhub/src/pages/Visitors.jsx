import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Avatar, Badge, Modal, FormField, PageHeader, EmptyState, TableHead, Spinner } from '../components/ui'
import { mockVisitors } from '../lib/mockData'
import { checkoutVisitor, getVisitors, saveVisitor, usesLiveData } from '../lib/data'

const EMPTY_FORM = { visitor_name: '', room: '', purpose: '', phone: '' }

export default function Visitors() {
  const [visitors,  setVisitors]  = useState(mockVisitors)
  const [showModal, setShowModal] = useState(false)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [loading,   setLoading]   = useState(usesLiveData)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    let active = true
    getVisitors()
      .then(data => active && setVisitors(data))
      .catch(err => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const insideCount = visitors.filter(v => v.status === 'inside').length

  const handleCheckout = async (id) => {
    const timeOut = new Date().toLocaleString('en-PH', { hour12: false }).slice(0,16)
    try {
      if (usesLiveData) {
        const saved = await checkoutVisitor(id)
        setVisitors(visitors.map(v => v.id === id ? saved : v))
      } else {
        setVisitors(visitors.map(v => v.id === id ? { ...v, status: 'checked-out', time_out: timeOut } : v))
      }
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRegister = async () => {
    if (!form.visitor_name.trim()) return
    const now = new Date().toLocaleString('en-PH', { hour12: false }).slice(0,16)
    try {
      if (usesLiveData) {
        const saved = await saveVisitor(form)
        setVisitors([saved, ...visitors])
      } else {
        setVisitors([{ id: Date.now(), ...form, time_in: now, time_out: null, status: 'inside' }, ...visitors])
      }
      setShowModal(false)
      setForm(EMPTY_FORM)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="fade-in">
      <PageHeader
        title="Visitor Log"
        subtitle={
          <span>
            <span className="badge badge-pink" style={{ marginRight: 8 }}>{insideCount} currently inside</span>
            Track all dormitory visitors
          </span>
        }
        action={
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Register Visitor
          </button>
        }
      />
      {error && <div className="alert-error">{error}</div>}

      {visitors.length === 0 ? <EmptyState icon="🚶" message="No visitor records yet." /> : (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <TableHead columns={['Visitor','Room Visited','Purpose','Time In','Time Out','Status','Action']} />
            <tbody>
              {visitors.map(v => (
                <tr key={v.id} className="table-row">
                  <td style={{ padding:'14px 20px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <Avatar name={v.visitor_name} color="#818cf8" size={32} />
                      <span style={{ fontWeight:500, fontSize:14 }}>{v.visitor_name}</span>
                    </div>
                  </td>
                  <td style={{ padding:'14px 20px' }}><span className="badge badge-blue">Room {v.room}</span></td>
                  <td style={{ padding:'14px 20px', fontSize:13, color:'var(--muted)' }}>{v.purpose}</td>
                  <td style={{ padding:'14px 20px', fontSize:13 }}>{v.time_in}</td>
                  <td style={{ padding:'14px 20px', fontSize:13, color:'var(--muted)' }}>{v.time_out || '—'}</td>
                  <td style={{ padding:'14px 20px' }}><Badge status={v.status} /></td>
                  <td style={{ padding:'14px 20px' }}>
                    {v.status === 'inside'
                      ? <button className="btn-primary" style={{ padding:'5px 12px', fontSize:12 }} onClick={() => handleCheckout(v.id)}>Check Out</button>
                      : <span style={{ fontSize:12, color:'var(--muted)' }}>—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Register Modal */}
      {showModal && (
        <Modal title="Register Visitor" onClose={() => setShowModal(false)}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <FormField label="Visitor Full Name">
                <input className="input-field" placeholder="Juan Santos" value={form.visitor_name} onChange={e => setForm({...form, visitor_name:e.target.value})} />
              </FormField>
              <FormField label="Phone Number">
                <input type="tel" className="input-field" placeholder="09XXXXXXXXX" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} />
              </FormField>
              <FormField label="Room to Visit">
                <input className="input-field" placeholder="e.g. 101" value={form.room} onChange={e => setForm({...form, room:e.target.value})} />
              </FormField>
              <FormField label="Purpose of Visit">
                <input className="input-field" placeholder="Family visit, delivery, etc." value={form.purpose} onChange={e => setForm({...form, purpose:e.target.value})} />
              </FormField>
            </div>
            <div style={{ padding:12, background:'var(--surface2)', borderRadius:8, fontSize:13, color:'var(--muted)' }}>
              🕐 Time-in will be recorded as: <strong style={{ color:'var(--text)' }}>{new Date().toLocaleString('en-PH')}</strong>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:20 }}>
            <button className="btn-ghost" style={{ flex:1 }} onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" style={{ flex:2, justifyContent:'center' }} onClick={handleRegister}>Register & Time In</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
