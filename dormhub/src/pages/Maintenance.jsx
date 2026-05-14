import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Badge, Modal, FormField, PageHeader, Spinner } from '../components/ui'
import { mockMaintenance } from '../lib/mockData'
import { getMaintenanceRequests, saveMaintenanceRequest, updateMaintenanceStatus, usesLiveData } from '../lib/data'

const STATUSES = ['pending', 'in-progress', 'resolved']
const STATUS_COLORS = { pending: '#fbbf24', 'in-progress': '#818cf8', resolved: '#6ee7b7' }

const EMPTY_FORM = { issue: '', description: '', priority: 'medium', room: '', tenant: '' }

export default function Maintenance() {
  const [requests,  setRequests]  = useState(mockMaintenance)
  const [showModal, setShowModal] = useState(false)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [loading,   setLoading]   = useState(usesLiveData)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    let active = true
    getMaintenanceRequests()
      .then(data => active && setRequests(data))
      .catch(err => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const updateStatus = async (id, status) => {
    try {
      if (usesLiveData) {
        const saved = await updateMaintenanceStatus(id, status)
        setRequests(requests.map(r => r.id === id ? saved : r))
      } else {
        setRequests(requests.map(r => r.id === id ? { ...r, status } : r))
      }
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSave = async () => {
    try {
      if (usesLiveData) {
        const saved = await saveMaintenanceRequest(form)
        setRequests([saved, ...requests])
      } else {
        setRequests([{ id: Date.now(), ...form, status: 'pending', date: new Date().toISOString().slice(0,10), assigned: null }, ...requests])
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
        title="Maintenance"
        subtitle="Track and manage repair requests"
        action={
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Request
          </button>
        }
      />
      {error && <div className="alert-error">{error}</div>}

      {/* Kanban */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {STATUSES.map(statusGroup => {
          const cards = requests.filter(r => r.status === statusGroup)
          return (
            <div key={statusGroup}>
              {/* Column header */}
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <span className="dot" style={{ background: STATUS_COLORS[statusGroup] }} />
                <span style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:14, textTransform:'capitalize' }}>
                  {statusGroup.replace('-',' ')}
                </span>
                <span className="badge badge-blue">{cards.length}</span>
              </div>

              {cards.length === 0 && (
                <div style={{ border:'2px dashed var(--border)', borderRadius:12, padding:'24px 16px', textAlign:'center', color:'var(--muted)', fontSize:13 }}>
                  No requests
                </div>
              )}

              {cards.map(r => (
                <div key={r.id} className="card" style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                    <Badge status={r.priority} />
                    <span style={{ fontSize:12, color:'var(--muted)' }}>{r.date}</span>
                  </div>
                  <div style={{ fontWeight:500, fontSize:14, marginBottom:6 }}>{r.issue}</div>
                  <div style={{ fontSize:12, color:'var(--muted)', marginBottom:12 }}>
                    {r.tenant} · Room {r.room}
                  </div>
                  {r.assigned && (
                    <div style={{ fontSize:12, color:'var(--accent2)', marginBottom:12 }}>
                      👤 {r.assigned}
                    </div>
                  )}
                  <div style={{ display:'flex', gap:6 }}>
                    {statusGroup === 'pending' && (
                      <>
                        <button className="btn-ghost" style={{ flex:1, fontSize:12, padding:'6px' }}
                          onClick={() => updateStatus(r.id, 'in-progress')}>
                          Start
                        </button>
                        <button className="btn-danger" style={{ fontSize:12, padding:'6px 10px' }}
                          onClick={() => updateStatus(r.id, 'cancelled')}>
                          ✕
                        </button>
                      </>
                    )}
                    {statusGroup === 'in-progress' && (
                      <button className="btn-primary" style={{ flex:1, fontSize:12, padding:'6px', justifyContent:'center' }}
                        onClick={() => updateStatus(r.id, 'resolved')}>
                        ✓ Resolve
                      </button>
                    )}
                    {statusGroup === 'resolved' && (
                      <span style={{ fontSize:12, color:'var(--accent)', textAlign:'center', flex:1, padding:'6px' }}>
                        ✓ Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title="Submit Maintenance Request" onClose={() => setShowModal(false)}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <FormField label="Tenant Name">
                <input className="input-field" placeholder="Your name" value={form.tenant} onChange={e => setForm({...form, tenant:e.target.value})} />
              </FormField>
              <FormField label="Room Number">
                <input className="input-field" placeholder="e.g. 101" value={form.room} onChange={e => setForm({...form, room:e.target.value})} />
              </FormField>
            </div>
            <FormField label="Issue Title">
              <input className="input-field" placeholder="Brief description of the issue" value={form.issue} onChange={e => setForm({...form, issue:e.target.value})} />
            </FormField>
            <FormField label="Detailed Description">
              <textarea className="input-field" placeholder="Describe the problem in detail…" value={form.description} onChange={e => setForm({...form, description:e.target.value})} />
            </FormField>
            <FormField label="Priority">
              <select className="input-field" value={form.priority} onChange={e => setForm({...form, priority:e.target.value})}>
                <option value="low">Low – Not urgent</option>
                <option value="medium">Medium – Needs attention</option>
                <option value="high">High – Urgent</option>
              </select>
            </FormField>
            <div>
              <label className="form-label">Upload Photo (optional)</label>
              <label style={{ display:'block', border:'2px dashed var(--border)', borderRadius:8, padding:'20px', textAlign:'center', color:'var(--muted)', fontSize:13, cursor:'pointer' }}>
                <input type="file" accept="image/*" style={{ display:'none' }} onChange={async e => {
                  // const file = e.target.files[0]
                  // const { data } = await supabase.storage.from('maintenance').upload(`${Date.now()}-${file.name}`, file)
                  // setForm({ ...form, image_url: data.path })
                }} />
                📷 Click to upload or drag & drop
              </label>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:20 }}>
            <button className="btn-ghost" style={{ flex:1 }} onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" style={{ flex:2, justifyContent:'center' }} onClick={handleSave}>Submit Request</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
