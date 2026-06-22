import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../context/AuthContext'
import Header from '../components/Header'

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
        <AuthProvider>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {children}
            </main>
            <footer style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border)', color: '#8b949e', fontSize: '0.9rem' }}>
              © {new Date().getFullYear()} DefectVision System. Phase 1 Prototype.
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
