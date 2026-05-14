import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Badge, Modal, FormField, PageHeader, EmptyState, Spinner } from '../components/ui'
import { mockRooms } from '../lib/mockData'
import { deleteRoom, getRooms, saveRoom, usesLiveData } from '../lib/data'

const EMPTY_FORM = { room_number: '', floor: '', type: 'Single', capacity: 1, price: '', amenities: '' }

export default function Rooms() {
  const [rooms,     setRooms]     = useState(mockRooms)
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editing,   setEditing]   = useState(null)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [loading,   setLoading]   = useState(usesLiveData)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    let active = true
    getRooms()
      .then(data => active && setRooms(data))
      .catch(err => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const filtered = rooms.filter(r => {
    const matchSearch = r.room_number.includes(search) || r.type.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || r.status === filter
    return matchSearch && matchFilter
  })

  const openAdd  = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = r  => { setEditing(r); setForm({ ...r, amenities: r.amenities.join(', ') }); setShowModal(true) }

  const handleSave = async () => {
    const payload = {
      ...form,
      amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean),
      price:     +form.price,
      capacity:  +form.capacity,
      floor:     +form.floor,
    }

    try {
      if (usesLiveData) {
        const saved = await saveRoom(payload, editing?.id)
        setRooms(prev => editing ? prev.map(r => r.id === editing.id ? saved : r) : [...prev, saved])
      } else if (editing) {
        setRooms(rooms.map(r => r.id === editing.id ? { ...r, ...payload } : r))
      } else {
        setRooms([...rooms, { id: Date.now(), ...payload, status: 'vacant' }])
      }
      setShowModal(false)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async id => {
    try {
      await deleteRoom(id)
      setRooms(rooms.filter(r => r.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="fade-in">
      <PageHeader
        title="Room Management"
        subtitle={`${rooms.length} total rooms`}
        action={
          <button className="btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Room
          </button>
        }
      />
      {error && <div className="alert-error">{error}</div>}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div className="search-wrap" style={{ flex: 1 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="input-field" placeholder="Search rooms…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['all', 'vacant', 'occupied', 'maintenance'].map(f => (
          <button key={f} className={`tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState icon="🚪" message="No rooms match your search." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
          {filtered.map(r => (
            <div key={r.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--accent)' }}>#{r.room_number}</div>
                <Badge status={r.status} />
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 8 }}>Floor {r.floor} · {r.type}</div>
              <div style={{ fontSize: 13, marginBottom: 4 }}>👥 Capacity: {r.capacity}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginBottom: 12 }}>
                ₱{r.price.toLocaleString()}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--muted)' }}>/mo</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
                {r.amenities.map(a => <span key={a} className="badge badge-blue" style={{ fontSize: 11 }}>{a}</span>)}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-ghost" style={{ flex: 1, fontSize: 12, padding: '6px 12px' }} onClick={() => openEdit(r)}>Edit</button>
                <button className="btn-danger" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => handleDelete(r.id)}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal title={editing ? 'Edit Room' : 'Add New Room'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              ['Room Number', 'room_number', 'text'],
              ['Floor',       'floor',       'number'],
              ['Capacity',    'capacity',    'number'],
              ['Monthly Rent (₱)', 'price',  'number'],
            ].map(([label, key, type]) => (
              <FormField key={key} label={label}>
                <input type={type} className="input-field" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
              </FormField>
            ))}
            <FormField label="Room Type">
              <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {['Single', 'Double', 'Triple', 'Quad'].map(t => <option key={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Amenities (comma-separated)">
              <input className="input-field" placeholder="AC, WiFi, Bathroom" value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} />
            </FormField>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={handleSave}>
              {editing ? 'Save Changes' : 'Add Room'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
