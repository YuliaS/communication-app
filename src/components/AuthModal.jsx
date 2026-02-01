import { useState } from 'react'

export function AuthModal({ onClose, signInWithEmail, signUpWithEmail, signInWithMagicLink }) {
  const [mode, setMode] = useState('magic') // magic, login, signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleMagicLink = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    
    const { error } = await signInWithMagicLink(email)
    
    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your email for the login link!')
    }
    setLoading(false)
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    
    const fn = mode === 'login' ? signInWithEmail : signUpWithEmail
    const { error } = await fn(email, password)
    
    if (error) {
      setError(error.message)
    } else if (mode === 'signup') {
      setMessage('Check your email to confirm your account!')
    } else {
      onClose()
    }
    setLoading(false)
  }

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>×</button>
        
        <h2>Sync Your Progress</h2>
        <p className="auth-subtitle">Sign in to save your progress across devices</p>
        
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${mode === 'magic' ? 'active' : ''}`}
            onClick={() => setMode('magic')}
          >
            Magic Link
          </button>
          <button 
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button 
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        {mode === 'magic' ? (
          <form onSubmit={handleMagicLink} className="auth-form">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="auth-input"
            />
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleEmailAuth} className="auth-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="auth-input"
            />
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>
        )}

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-message">{message}</p>}
        
        <p className="auth-note">
          Your progress is saved locally. Sign in to sync across devices.
        </p>
      </div>
    </div>
  )
}
