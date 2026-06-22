"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    // If user is already authenticated, redirect to home page immediately
    if (user && !loading) {
      router.push('/home')
    }
  }, [user, loading, router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setMessage(null)

    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' })
      setAuthLoading(false)
      return
    }

    try {
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        
        // Check if user is signed in immediately (depends on Supabase confirmation settings)
        if (data.session) {
          setMessage({ type: 'success', text: 'Account created successfully! Redirecting...' })
          router.push('/home')
        } else {
          setMessage({ type: 'success', text: 'Registration successful! Please check your email inbox to confirm your account.' })
        }
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' })
        router.push('/home')
      }
    } catch (error: unknown) {
      console.error('Auth error:', error)
      const messageText = error instanceof Error ? error.message : 'Authentication failed. Please check your credentials.'
      setMessage({ type: 'error', text: messageText })
    } finally {
      setAuthLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', backgroundColor: 'var(--background)' }}>
        <div className="spinner" style={{ width: '45px', height: '45px', border: '3px solid rgba(88, 166, 255, 0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'scan 1s linear infinite' }}></div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '85vh', padding: '1.5rem', position: 'relative' }}>
      
      {/* Background Glow effects */}
      <div style={{ position: 'absolute', top: '20%', left: '30%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(88, 166, 255, 0.08) 0%, rgba(0,0,0,0) 70%)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '25%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(138, 43, 226, 0.05) 0%, rgba(0,0,0,0) 70%)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '440px', zIndex: 1, animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '0.5rem' }}>
            Defect<span className="gradient-text">Vision</span>
          </h1>
          <p style={{ color: '#8b949e', fontSize: '0.95rem' }}>
            Industrial Surface Defect Inspection Platform
          </p>
        </div>

        {/* Auth Box Card */}
        <div className="glass-panel" style={{ padding: '2.5rem 2rem', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)' }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '2rem', paddingBottom: '0.5rem', gap: '1.5rem' }}>
            <button 
              onClick={() => { setIsSignUp(false); setMessage(null); }}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: !isSignUp ? 'var(--foreground)' : '#8b949e', 
                fontSize: '1.1rem', 
                fontWeight: !isSignUp ? 700 : 500,
                position: 'relative',
                padding: '4px 0',
                transition: 'all 0.2s ease'
              }}
            >
              Sign In
              {!isSignUp && (
                <div style={{ position: 'absolute', bottom: '-9px', left: 0, right: 0, height: '2px', background: 'var(--primary)', borderRadius: '2px' }} />
              )}
            </button>
            <button 
              onClick={() => { setIsSignUp(true); setMessage(null); }}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: isSignUp ? 'var(--foreground)' : '#8b949e', 
                fontSize: '1.1rem', 
                fontWeight: isSignUp ? 700 : 500,
                position: 'relative',
                padding: '4px 0',
                transition: 'all 0.2s ease'
              }}
            >
              Register
              {isSignUp && (
                <div style={{ position: 'absolute', bottom: '-9px', left: 0, right: 0, height: '2px', background: 'var(--primary)', borderRadius: '2px' }} />
              )}
            </button>
          </div>

          {/* Feedback Messages */}
          {message && (
            <div style={{ 
              padding: '0.85rem 1rem', 
              borderRadius: '8px', 
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              background: message.type === 'error' ? 'rgba(248, 81, 73, 0.12)' : 'rgba(46, 160, 67, 0.12)',
              border: `1px solid ${message.type === 'error' ? 'rgba(248, 81, 73, 0.3)' : 'rgba(46, 160, 67, 0.3)'}`,
              color: message.type === 'error' ? '#ff7b72' : '#56d364',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Email Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#8b949e', fontWeight: 500 }}>Email Address</label>
              <input 
                type="email"
                placeholder="operator@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(22, 27, 34, 0.8)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#8b949e', fontWeight: 500 }}>Password</label>
              <input 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(22, 27, 34, 0.8)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Action Button */}
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={authLoading}
              style={{ 
                marginTop: '1rem', 
                width: '100%', 
                padding: '14px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: authLoading ? 0.7 : 1,
                cursor: authLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {authLoading ? (
                <>
                  <span className="spinner" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255, 255, 255, 0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'scan 1s linear infinite' }} />
                  Processing...
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>

          </form>

        </div>

        {/* Footer/Helper info */}
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#8b949e', marginTop: '1.5rem' }}>
          By accessing this system, you agree to comply with standard industrial quality assurance protocols.
        </p>

      </div>
    </div>
  )
}
