import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DefectVision | AI Surface Analysis',
  description: 'AI-Based Surface Defect Detection & Analysis System',
  manifest: '/manifest.json',
  themeColor: '#0d1117',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <header style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', background: 'rgba(13, 17, 23, 0.8)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Defect<span className="gradient-text">Vision</span>
            </div>
            <nav style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="/" style={{ color: 'var(--foreground)', fontWeight: 500 }}>Home</a>
              <a href="/dashboard" style={{ color: 'var(--foreground)', fontWeight: 500 }}>Dashboard</a>
              <a href="/history" style={{ color: 'var(--foreground)', fontWeight: 500 }}>History</a>
            </nav>
          </header>
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {children}
          </main>
          <footer style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border)', color: '#8b949e', fontSize: '0.9rem' }}>
            © {new Date().getFullYear()} DefectVision System. Phase 1 Prototype.
          </footer>
        </div>
      </body>
    </html>
  )
}
