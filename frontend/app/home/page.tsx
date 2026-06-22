"use client"
import { useAuth } from '../../context/AuthContext'
import styles from '../page.module.css'
import Link from 'next/link'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(88, 166, 255, 0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'scan 1s linear infinite' }}></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className={styles.container}>
      <section className={`${styles.hero} animate-fade-in`}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Intelligence for <br/>
            <span className="gradient-text">Structural Integrity</span>
          </h1>
          <p className={styles.subtitle}>
            Detect surface defects, evaluate severity, and receive actionable engineering guidance—instantly on any device.
          </p>
          <div className={styles.ctaGroup}>
            <Link href="/dashboard">
              <button className="btn-primary">Start Analysis</button>
            </Link>
            <Link href="/history">
              <button className="btn-secondary">View History</button>
            </Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={`glass-panel ${styles.dashboardPreview}`}>
            {/* Abstract visual representing the analysis UI */}
            <div className={styles.mockHeader}></div>
            <div className={styles.mockBody}>
              <div className={styles.mockImage}></div>
              <div className={styles.mockStats}>
                <div className={styles.mockLine}></div>
                <div className={styles.mockLine} style={{ width: '60%' }}></div>
                <div className={styles.mockBadge}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className={`glass-panel ${styles.featureCard}`}>
          <h3>📸 Cross-Platform Capture</h3>
          <p>Take a photo on your phone, analyze it instantly, and view the comprehensive report on your laptop.</p>
        </div>
        <div className={`glass-panel ${styles.featureCard}`}>
          <h3>🔍 OpenCV Detection</h3>
          <p>Mathematical precision identifying cracks, corrosion, and dimensional severity.</p>
        </div>
        <div className={`glass-panel ${styles.featureCard}`}>
          <h3>🧠 AI Reasoning</h3>
          <p>Claude API acts as an engineering consultant, estimating causes and progression forecast.</p>
        </div>
      </section>
    </div>
  )
}
