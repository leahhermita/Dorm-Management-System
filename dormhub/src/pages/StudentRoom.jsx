import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { mockRooms } from '../lib/mockData'
import { getRooms, usesLiveData } from '../lib/data'
import { Spinner } from '../components/ui'

export default function StudentRoom() {
  const { profile } = useAuth()
  const [rooms, setRooms] = useState(mockRooms)
  const [loading, setLoading] = useState(usesLiveData)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    getRooms()
      .then(data => active && setRooms(data))
      .catch(err => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const room = rooms.find(r => r.room_number === profile?.room) || rooms[0]

  if (loading) return <Spinner />

  return (
    <div className="fade-in">
      {error && <div className="alert-error">{error}</div>}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:26 }}>My Room</h1>
        <p style={{ color:'var(--muted)', fontSize:14, marginTop:4 }}>Room details and information</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div className="card" style={{ borderColor:'var(--accent)' }}>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:56, color:'var(--accent)', marginBottom:8 }}>#{room?.room_number}</div>
          <div style={{ fontSize:14, color:'var(--muted)', marginBottom:20 }}>Floor {room?.floor} · {room?.type} Room</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              ['Capacity',   `${room?.capacity} person(s)`],
              ['Monthly Rent', `₱${room?.price?.toLocaleString()}`],
              ['Floor',      `Floor ${room?.floor}`],
              ['Status',     room?.status],
            ].map(([label, val]) => (
              <div key={label} className="card-sm">
                <div style={{ fontSize:11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>{label}</div>
                <div style={{ fontSize:14, fontWeight:600, textTransform:'capitalize' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, marginBottom:16 }}>Amenities</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {room?.amenities?.map(a => (
              <div key={a} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:'var(--surface2)', borderRadius:8 }}>
                <span style={{ fontSize:18 }}>
                  {a === 'AC' ? '❄️' : a === 'WiFi' ? '📶' : a === 'Bathroom' ? '🚿' : a === 'Kitchen' ? '🍳' : '💡'}
                </span>
                <span style={{ fontSize:14, fontWeight:500 }}>{a}</span>
                <span style={{ marginLeft:'auto' }} className="badge badge-green">✓ Available</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop:20, padding:14, background:'rgba(110,231,183,0.05)', border:'1px solid var(--accent)33', borderRadius:10 }}>
            <div style={{ fontSize:12, color:'var(--muted)', marginBottom:4 }}>Move-in Date</div>
            <div style={{ fontSize:15, fontWeight:600 }}>January 15, 2024</div>
          </div>
        </div>
      </div>
    </div>
  )
}
