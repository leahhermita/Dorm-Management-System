import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Avatar, Badge, Modal, FormField, PageHeader, EmptyState, TableHead, Spinner } from '../components/ui'
import { mockTenants, mockRooms } from '../lib/mockData'
import { getRooms, getTenants, saveTenant, usesLiveData } from '../lib/data'

const EMPTY_FORM = { name: '', email: '', phone: '', course: '', year: 1, room: '', move_in: '', profile_color: '#6ee7b7' }
const COLORS = ['#6ee7b7', '#818cf8', '#f472b6', '#fbbf24', '#34d399', '#60a5fa']

export default function Tenants() {
  const [tenants,   setTenants]   = useState(mockTenants)
  const [search,    setSearch]    = useState('')
  const [showModal, setShowModal] = useState(false)
  const [viewing,   setViewing]   = useState(null)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [rooms,     setRooms]     = useState(mockRooms)
  const [loading,   setLoading]   = useState(usesLiveData)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    let active = true
    Promise.all([getTenants(), getRooms()])
      .then(([tenantRows, roomRows]) => {
        if (!active) return
        setTenants(tenantRows)
        setRooms(roomRows)
      })
      .catch(err => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const filtered = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.room.includes(search) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async () => {
    try {
      if (usesLiveData) {
        const saved = await saveTenant(form)
        setTenants([saved, ...tenants])
      } else {
        setTenants([...tenants, { id: Date.now(), ...form, status: 'active' }])
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
        title="Tenants"
        subtitle={`${tenants.length} active tenants`}
        action={
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Tenant
          </button>
        }
      />
      {error && <div className="alert-error">{error}</div>}

      <div className="search-wrap" style={{ marginBottom: 20 }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input className="input-field" placeholder="Search by name, room, email…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? <EmptyState icon="👤" message="No tenants found." /> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableHead columns={['Tenant', 'Room', 'Course / Year', 'Move-in', 'Contact', 'Status', 'Actions']} />
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="table-row">
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar name={t.name} color={t.profile_color} />
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}><span className="badge badge-blue">Room {t.room}</span></td>
                  <td style={{ padding: '14px 20px', fontSize: 13 }}>{t.course} · Yr {t.year}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--muted)' }}>{t.move_in}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13 }}>{t.phone}</td>
                  <td style={{ padding: '14px 20px' }}><Badge status={t.status} /></td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setViewing(t)}>View</button>
                      <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Tenant Modal */}
      {showModal && (
        <Modal title="Add New Tenant" onClose={() => setShowModal(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Full Name">
              <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </FormField>
            <FormField label="Email">
              <input type="email" className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </FormField>
            <FormField label="Phone Number">
              <input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </FormField>
            <FormField label="Assign Room">
              <select className="input-field" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })}>
                <option value="">Select a room</option>
                {rooms.filter(r => r.status === 'vacant' || r.room_number === form.room).map(r => (
                  <option key={r.id} value={r.room_number}>Room {r.room_number} – {r.type}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Course">
              <input className="input-field" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} />
            </FormField>
            <FormField label="Year Level">
              <select className="input-field" value={form.year} onChange={e => setForm({ ...form, year: +e.target.value })}>
                {[1,2,3,4,5].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </FormField>
            <FormField label="Move-in Date">
              <input type="date" className="input-field" value={form.move_in} onChange={e => setForm({ ...form, move_in: e.target.value })} />
            </FormField>
            <FormField label="Profile Color">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 6 }}>
                {COLORS.map(c => (
                  <div key={c} onClick={() => setForm({ ...form, profile_color: c })}
                    style={{ width: 26, height: 26, borderRadius: '50%', background: c, cursor: 'pointer', border: form.profile_color === c ? '2px solid white' : '2px solid transparent' }} />
                ))}
              </div>
            </FormField>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={handleSave}>Add Tenant</button>
          </div>
        </Modal>
      )}

      {/* View Tenant Modal */}
      {viewing && (
        <Modal title="Tenant Profile" onClose={() => setViewing(null)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: 16, background: 'var(--surface2)', borderRadius: 10 }}>
            <Avatar name={viewing.name} color={viewing.profile_color} size={56} />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>{viewing.name}</div>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>{viewing.email}</div>
              <div style={{ marginTop: 6 }}><Badge status={viewing.status} /></div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['Room',      `Room ${viewing.room}`],
              ['Phone',     viewing.phone],
              ['Course',    viewing.course],
              ['Year',      `Year ${viewing.year}`],
              ['Move-in',   viewing.move_in],
            ].map(([label, val]) => (
              <div key={label} className="card-sm">
                <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="btn-ghost" style={{ flex: 1 }}>📄 Contract</button>
            <button className="btn-ghost" style={{ flex: 1 }}>🪪 View ID</button>
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Edit Profile</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
