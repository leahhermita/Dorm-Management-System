import { useState } from 'react'
import { PageHeader } from '../components/ui'
import SQL from '../../supabase-schema.sql?raw'

const STEPS = [
  { step: '1', icon: 'Start', title: 'Create Supabase Project', desc: 'Create a Supabase project, then copy the Project URL and anon key from Settings > API.' },
  { step: '2', icon: 'SQL', title: 'Run SQL Schema', desc: 'Open SQL Editor, paste the schema below, and run it once before using the live app.' },
  { step: '3', icon: 'Auth', title: 'Configure Auth', desc: 'Enable Email auth and set your Site URL to your deployed app domain.' },
  { step: '4', icon: 'Env', title: 'Set Environment Variables', desc: 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY locally and in your hosting dashboard.' },
  { step: '5', icon: 'Build', title: 'Deploy', desc: 'Use npm run build as the build command and dist as the output directory.' },
]

export default function SetupPage() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(SQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fade-in">
      <PageHeader title="Supabase Setup" subtitle="Live database schema and deployment checklist" />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14, marginBottom:28 }}>
        {STEPS.map(s => (
          <div key={s.step} className="card-sm" style={{ display:'flex', gap:14 }}>
            <div className="badge badge-blue" style={{ alignSelf:'flex-start' }}>{s.icon}</div>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <span className="badge badge-green">Step {s.step}</span>
                <span style={{ fontWeight:600, fontSize:14 }}>{s.title}</span>
              </div>
              <p style={{ fontSize:13, color:'var(--muted)', lineHeight:1.5 }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div>
            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16 }}>Complete SQL Schema</h3>
            <p style={{ color:'var(--muted)', fontSize:13, marginTop:2 }}>
              Tables, policies, trigger, indexes, and tenant contact fields
            </p>
          </div>
          <button className="btn-primary" onClick={copy}>
            {copied ? 'Copied' : 'Copy SQL'}
          </button>
        </div>
        <pre style={{
          background:'var(--bg)',
          border:'1px solid var(--border)',
          borderRadius:10,
          padding:20,
          fontSize:12,
          overflow:'auto',
          maxHeight:500,
          color:'var(--muted)',
          lineHeight:1.7,
        }}>
          <code>{SQL}</code>
        </pre>
      </div>
    </div>
  )
}
