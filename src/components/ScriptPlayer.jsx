import { useState } from 'react'

// Speech synthesis helper
export const speak = (text, rate = 0.9, onEnd = null) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = rate
    utterance.pitch = 1
    
    // Try to get a natural voice
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => 
      v.name.includes('Samantha') || 
      v.name.includes('Google') || 
      v.name.includes('Natural') ||
      v.lang.startsWith('en')
    )
    if (preferredVoice) utterance.voice = preferredVoice
    
    if (onEnd) utterance.onend = onEnd
    window.speechSynthesis.speak(utterance)
    return utterance
  }
  return null
}

export function ScriptPlayer({ text, title }) {
  const [isPlaying, setIsPlaying] = useState(false)

  const play = () => {
    if (isPlaying) {
      window.speechSynthesis?.cancel()
      setIsPlaying(false)
      return
    }
    
    setIsPlaying(true)
    speak(text, 0.85, () => setIsPlaying(false))
  }

  return (
    <div className="script-player">
      <div className="script-header">
        <span className="script-title">{title}</span>
        <button 
          onClick={play}
          className={`play-btn ${isPlaying ? 'playing' : ''}`}
        >
          {isPlaying ? '⏹ Stop' : '🔊 Listen'}
        </button>
      </div>
      <div className="script-text">{text}</div>
    </div>
  )
}
