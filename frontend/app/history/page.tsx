"use client"
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

interface HistoryRecord {
  id: string;
  severity: string;
  cause: string;
  forecast: string;
  image_url: string;
  created_at: string;
}

export default function History() {
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('defect_reports')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      if (data) setHistory(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Analysis History</h1>
      
      {loading ? (
        <p>Loading history...</p>
      ) : history.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: '#8b949e', fontSize: '1.2rem' }}>No past analyses found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {history.map((item) => (
            <div key={item.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '200px', background: `url(${item.image_url}) center/cover no-repeat`, borderBottom: '1px solid var(--border)' }} />
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge badge-${item.severity?.toLowerCase() || 'low'}`}>
                    {item.severity}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#8b949e' }}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>AI Cause Estimate</h4>
                  <p style={{ fontSize: '0.9rem', color: '#c9d1d9' }}>{item.cause}</p>
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                   <p style={{ fontSize: '0.85rem', color: 'var(--warning)' }}>Forecast: {item.forecast}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
