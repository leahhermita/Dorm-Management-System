import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Badge, Modal, FormField, PageHeader, Spinner } from '../components/ui'
import { mockMaintenance } from '../lib/mockData'
import { useAuth } from '../contexts/AuthContext'
import { getMaintenanceRequests, saveMaintenanceRequest, usesLiveData } from '../lib/data'

const EMPTY_FORM = { issue:'', description:'', priority:'medium' }

export default function StudentMaintenance() {
  const { profile } = useAuth()
  const [requests,  setRequests]  = useState(mockMaintenance.filter(m => m.room === profile?.room))
  const [showModal, setShowModal] = useState(false)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [loading,   setLoading]   = useState(usesLiveData)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    let active = true
    getMaintenanceRequests()
      .then(data => {
        if (!active) return
        setRequests(data.filter(m => m.room === profile?.room || m.tenant_id === profile?.tenant_id))
      })
      .catch(err => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [profile?.room, profile?.tenant_id])

  const handleSubmit = async () => {
    if (!form.issue.trim()) return
    try {
      if (usesLiveData) {
        const saved = await saveMaintenanceRequest({ ...form, tenant_id: profile?.tenant_id, tenant: profile?.full_name, room: profile?.room })
        setRequests([saved, ...requests])
      } else {
        setRequests([{
          id: Date.now(), ...form,
          tenant: profile?.full_name,
          room: profile?.room,
          status: 'pending',
          date: new Date().toISOString().slice(0,10),
          assigned: null,
        }, ...requests])
      }
      setShowModal(false)
      setForm(EMPTY_FORM)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const STATUS_COLOR = { pending:'#fbbf24', 'in-progress':'#818cf8', resolved:'#6ee7b7', cancelled:'#f85149' }

  if (loading) return <Spinner />

  return (
    <div className="fade-in">
      <PageHeader
        title="Maintenance Requests"
        subtitle="Submit and track your repair requests"
        action={<button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16}/> New Request</button>}
      />
      {error && <div className="alert-error">{error}</div>}

      {requests.length === 0 ? (
        <div style={{ textAlign:'center', padding:'64px 20px', color:'var(--muted)' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🔧</div>
          <p>No maintenance requests yet.</p>
          <button className="btn-primary" style={{ marginTop:16 }} onClick={() => setShowModal(true)}>Submit your first request</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {requests.map(r => (
            <div key={r.id} className="card" style={{ borderLeft:`3px solid ${STATUS_COLOR[r.status] || 'var(--border)'}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:15, marginBottom:6 }}>{r.issue}</div>
                  {r.description && <div style={{ fontSize:13, color:'var(--muted)', marginBottom:8 }}>{r.description}</div>}
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <Badge status={r.priority} />
                    <span style={{ fontSize:12, color:'var(--muted)' }}>Submitted: {r.date}</span>
                    {r.assigned && <span style={{ fontSize:12, color:'var(--accent2)' }}>👤 {r.assigned}</span>}
                  </div>
                </div>
                <Badge status={r.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Submit Maintenance Request" onClose={() => setShowModal(false)}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <FormField label="Issue Title">
              <input className="input-field" placeholder="e.g. Leaking faucet in bathroom" value={form.issue} onChange={e => setForm({...form, issue:e.target.value})} />
            </FormField>
            <FormField label="Detailed Description">
              <textarea className="input-field" placeholder="Describe the problem in detail…" value={form.description} onChange={e => setForm({...form, description:e.target.value})} />
            </FormField>
            <FormField label="Priority Level">
              <select className="input-field" value={form.priority} onChange={e => setForm({...form, priority:e.target.value})}>
                <option value="low">Low – Not urgent</option>
                <option value="medium">Medium – Needs attention soon</option>
                <option value="high">High – Urgent</option>
              </select>
            </FormField>
            <div>
              <label className="form-label">Upload Photo (optional)</label>
              <label style={{ display:'block', border:'2px dashed var(--border)', borderRadius:8, padding:'20px', textAlign:'center', color:'var(--muted)', fontSize:13, cursor:'pointer' }}>
                <input type="file" accept="image/*" style={{ display:'none' }} />
                📷 Click to upload photo of the issue
              </label>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:20 }}>
            <button className="btn-ghost" style={{ flex:1 }} onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" style={{ flex:2, justifyContent:'center' }} onClick={handleSubmit}>Submit Request</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
