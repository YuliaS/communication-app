import { useState } from 'react'
import { useProgress } from './hooks/useProgress'
import { PROGRAM_DATA } from './data/program'
import { Timer } from './components/Timer'
import { ScriptPlayer, speak } from './components/ScriptPlayer'
import { AuthModal } from './components/AuthModal'
import './App.css'

function App() {
  const [currentDay, setCurrentDay] = useState(1)
  const [view, setView] = useState('dashboard')
  const [showAuth, setShowAuth] = useState(false)
  
  const {
    completedDays,
    progress,
    streak,
    loading,
    user,
    useSupabase,
    toggleDay,
    updateCurrentDay,
    signInWithEmail,
    signUpWithEmail,
    signInWithMagicLink,
    signOut
  } = useProgress()

  const getAllDays = () => {
    const days = []
    PROGRAM_DATA.weeks.forEach(week => {
      week.days.forEach(day => days.push({ ...day, week: week.name }))
    })
    return days
  }

  const days = getAllDays()
  const currentLesson = days.find(d => d.day === currentDay)
  const currentWeekIndex = Math.ceil(currentDay / 7) - 1

  const handleDaySelect = (day) => {
    setCurrentDay(day)
    updateCurrentDay(day)
    setView('lesson')
  }

  // Dashboard View
  const Dashboard = () => (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="user-section">
          {user ? (
            <div className="user-info">
              <span className="user-email">{user.email}</span>
              <button className="sign-out-btn" onClick={signOut}>Sign Out</button>
            </div>
          ) : (
            <button className="sign-in-btn" onClick={() => setShowAuth(true)}>
              {useSupabase ? '☁️ Sync Progress' : '💾 Saved Locally'}
            </button>
          )}
        </div>
      </header>

      <div className="hero-section">
        <div className="hero-content">
          <h1>30-Day Communication Mastery</h1>
          <p className="hero-subtitle">15 minutes a day to confident, eloquent speaking</p>
          
          <div className="progress-ring-container">
            <svg className="progress-ring" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <circle className="progress-bg" cx="50" cy="50" r="45" />
              <circle 
                className="progress-fill" 
                cx="50" 
                cy="50" 
                r="45"
                style={{
                  strokeDasharray: `${(progress / 30) * 283} 283`
                }}
              />
            </svg>
            <div className="progress-text">
              <span className="progress-number">{progress}</span>
              <span className="progress-label">/ 30 days</span>
            </div>
          </div>

          {streak > 1 && (
            <div className="streak-badge">🔥 {streak} day streak!</div>
          )}
          
          <button 
            className="start-btn"
            onClick={() => handleDaySelect(progress + 1 > 30 ? 30 : progress + 1)}
          >
            {progress === 0 ? 'Start Day 1' : `Continue Day ${Math.min(progress + 1, 30)}`}
          </button>
        </div>
      </div>

      <div className="weeks-overview">
        {PROGRAM_DATA.weeks.map((week, weekIdx) => (
          <div key={weekIdx} className={`week-card ${weekIdx === currentWeekIndex ? 'current' : ''}`}>
            <div className="week-header">
              <span className="week-number">Week {weekIdx + 1}</span>
              <h3>{week.name}</h3>
            </div>
            <div className="days-grid">
              {week.days.map(day => (
                <button
                  key={day.day}
                  className={`day-dot ${completedDays.has(day.day) ? 'completed' : ''} ${day.day === currentDay ? 'current' : ''}`}
                  onClick={() => handleDaySelect(day.day)}
                  title={day.title}
                >
                  {day.day}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <footer className="dashboard-footer">
        <p>Built with ❤️ for better communication</p>
      </footer>
    </div>
  )

  // Lesson View
  const LessonView = () => {
    if (!currentLesson) return null
    
    return (
      <div className="lesson-view">
        <header className="lesson-header">
          <button className="back-btn" onClick={() => setView('dashboard')}>
            ← Dashboard
          </button>
          <div className="lesson-nav">
            <button 
              disabled={currentDay === 1}
              onClick={() => handleDaySelect(currentDay - 1)}
              className="nav-btn"
            >
              ‹ Prev
            </button>
            <span className="day-indicator">Day {currentDay} of 30</span>
            <button 
              disabled={currentDay === 30}
              onClick={() => handleDaySelect(currentDay + 1)}
              className="nav-btn"
            >
              Next ›
            </button>
          </div>
        </header>

        <main className="lesson-content">
          <div className="lesson-title-section">
            <span className="focus-label">{currentLesson.focus}</span>
            <h1>{currentLesson.title}</h1>
          </div>

          <Timer duration={900} label="15-Min Practice Session" />

          <section className="content-section theory">
            <h2>💡 Today's Insight</h2>
            <p>{currentLesson.theory}</p>
          </section>

          <section className="content-section patterns">
            <h2>🎯 Key Patterns</h2>
            <ul>
              {currentLesson.patterns.map((pattern, i) => (
                <li key={i}>{pattern}</li>
              ))}
            </ul>
          </section>

          <section className="content-section phrases">
            <h2>💬 Phrases to Practice</h2>
            <div className="phrases-list">
              {currentLesson.phrases.map((phrase, i) => (
                <div key={i} className="phrase-item">
                  <span className="phrase-text">{phrase}</span>
                  <button 
                    className="speak-btn"
                    onClick={() => speak(phrase.replace(/→|WEAK:|STRONG:|'/g, ''), 0.85)}
                    title="Listen"
                  >
                    🔊
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="content-section exercise">
            <h2>🎙️ {currentLesson.exercise.title}</h2>
            <p className="exercise-instructions">{currentLesson.exercise.instructions}</p>
            <ScriptPlayer 
              text={currentLesson.exercise.script} 
              title="Practice Script"
            />
            <Timer duration={60} label="Exercise Timer" />
          </section>

          <section className="content-section tip">
            <h2>⭐ Today's Challenge</h2>
            <div className="tip-box">
              {currentLesson.tip}
            </div>
          </section>

          <div className="completion-section">
            <button 
              className={`complete-btn ${completedDays.has(currentDay) ? 'completed' : ''}`}
              onClick={() => toggleDay(currentDay)}
            >
              {completedDays.has(currentDay) ? '✓ Completed!' : 'Mark Day Complete'}
            </button>
            {currentDay < 30 && (
              <button 
                className="next-day-btn"
                onClick={() => handleDaySelect(currentDay + 1)}
              >
                Continue to Day {currentDay + 1} →
              </button>
            )}
          </div>
        </main>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading your progress...</p>
      </div>
    )
  }

  return (
    <div className="app">
      {view === 'dashboard' ? <Dashboard /> : <LessonView />}
      
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          signInWithEmail={signInWithEmail}
          signUpWithEmail={signUpWithEmail}
          signInWithMagicLink={signInWithMagicLink}
        />
      )}
    </div>
  )
}

export default App
