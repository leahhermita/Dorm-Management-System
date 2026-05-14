// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ name = '', color = '#6ee7b7', size = 36 }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div
      className="avatar"
      style={{
        width: size, height: size,
        background: color + '22',
        color,
        fontSize: size * 0.38,
      }}
    >
      {initials || '?'}
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
const BADGE_MAP = {
  occupied:      ['badge-blue',   'Occupied'],
  vacant:        ['badge-green',  'Vacant'],
  maintenance:   ['badge-yellow', 'Maintenance'],
  paid:          ['badge-green',  'Paid'],
  pending:       ['badge-yellow', 'Pending'],
  overdue:       ['badge-red',    'Overdue'],
  active:        ['badge-green',  'Active'],
  inactive:      ['badge-red',    'Inactive'],
  resolved:      ['badge-green',  'Resolved'],
  'in-progress': ['badge-blue',   'In Progress'],
  cancelled:     ['badge-red',    'Cancelled'],
  inside:        ['badge-pink',   'Inside'],
  'checked-out': ['badge-blue',   'Checked Out'],
  high:          ['badge-red',    'High'],
  medium:        ['badge-yellow', 'Medium'],
  low:           ['badge-blue',   'Low'],
  admin:         ['badge-pink',   'Admin'],
  student:       ['badge-blue',   'Student'],
  staff:         ['badge-green',  'Staff'],
}

export function Badge({ status }) {
  const [cls, label] = BADGE_MAP[status] ?? ['badge-blue', status]
  return <span className={`badge ${cls}`}>{label}</span>
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="stat-card fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ padding: 10, borderRadius: 10, background: color + '22', color }}>
          <Icon size={20} />
        </div>
        <span style={{ color: 'var(--muted)', fontSize: 12 }}>{sub}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color: 'var(--text)' }}>{value}</div>
      <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>{label}</div>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, maxWidth = 520 }) {
  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in" style={{ maxWidth, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>{title}</h2>
          <button className="btn-ghost" style={{ padding: '4px 10px' }} onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── FormField ────────────────────────────────────────────────────────────────
export function FormField({ label, children }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
    </div>
  )
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', message = 'No data found.' }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 14 }}>{message}</p>
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── TableHead ────────────────────────────────────────────────────────────────
export function TableHead({ columns }) {
  return (
    <thead>
      <tr style={{ background: 'var(--surface2)' }}>
        {columns.map(col => (
          <th
            key={col}
            style={{
              padding: '14px 20px',
              textAlign: 'left',
              fontSize: 12,
              color: 'var(--muted)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
            }}
          >
            {col}
          </th>
        ))}
      </tr>
    </thead>
  )
}
