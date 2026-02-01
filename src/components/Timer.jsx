import { useState, useEffect, useRef } from 'react'

export function Timer({ duration, onComplete, label }) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current)
            setIsRunning(false)
            onComplete?.()
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning, timeLeft, onComplete])

  const reset = () => {
    clearInterval(intervalRef.current)
    setTimeLeft(duration)
    setIsRunning(false)
  }

  const formatTime = (s) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="timer-box">
      <div className="timer-label">{label}</div>
      <div className="timer-display">{formatTime(timeLeft)}</div>
      <div className="timer-controls">
        <button 
          onClick={() => setIsRunning(!isRunning)}
          className={`timer-btn ${isRunning ? 'pause' : 'start'}`}
        >
          {isRunning ? '⏸ Pause' : '▶ Start'}
        </button>
        <button onClick={reset} className="timer-btn reset">↺ Reset</button>
      </div>
    </div>
  )
}
