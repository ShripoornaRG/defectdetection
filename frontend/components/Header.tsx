"use client"
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { usePathname } from 'next/navigation'

export default function Header() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  // Helper to determine if link is active
  const isActive = (path: string) => pathname === path

  return (
    <header className="app-header">
      {/* Logo */}
      <Link href={user ? '/home' : '/'} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'inherit' }}>
        <div style={{ fontSize: '1.4rem', fontWeight: 850, letterSpacing: '-0.03em' }}>
          Defect<span className="gradient-text">Vision</span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="app-nav">
        {user ? (
          <>
            <Link 
              href="/home" 
              style={{ 
                color: isActive('/home') ? 'var(--primary)' : 'var(--foreground)', 
                fontWeight: isActive('/home') ? 600 : 500,
                fontSize: '0.95rem',
                transition: 'color 0.2s ease'
              }}
            >
              Home
            </Link>
            <Link 
              href="/dashboard" 
              style={{ 
                color: isActive('/dashboard') ? 'var(--primary)' : 'var(--foreground)', 
                fontWeight: isActive('/dashboard') ? 600 : 500,
                fontSize: '0.95rem',
                transition: 'color 0.2s ease'
              }}
            >
              Dashboard
            </Link>
            <Link 
              href="/history" 
              style={{ 
                color: isActive('/history') ? 'var(--primary)' : 'var(--foreground)', 
                fontWeight: isActive('/history') ? 600 : 500,
                fontSize: '0.95rem',
                transition: 'color 0.2s ease'
              }}
            >
              History
            </Link>

            {/* User Badge / Sign Out */}
            <div className="user-auth-section">
              <span style={{ fontSize: '0.85rem', color: '#8b949e', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                👤 {user.email}
              </span>
              <button 
                onClick={signOut}
                className="btn-secondary"
                style={{ 
                  padding: '6px 14px', 
                  fontSize: '0.85rem', 
                  borderRadius: '6px',
                  backgroundColor: 'rgba(248, 81, 73, 0.08)',
                  borderColor: 'rgba(248, 81, 73, 0.2)',
                  color: '#ff7b72',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(248, 81, 73, 0.15)'
                  e.currentTarget.style.borderColor = 'rgba(248, 81, 73, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(248, 81, 73, 0.08)'
                  e.currentTarget.style.borderColor = 'rgba(248, 81, 73, 0.2)'
                }}
              >
                Sign Out
              </button>
            </div>
          </>
        ) : (
          <span style={{ fontSize: '0.85rem', color: '#8b949e' }}>
            Inspection Operator Portal
          </span>
        )}
      </nav>
    </header>
  )
}
