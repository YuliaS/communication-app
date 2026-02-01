import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export function useProgress() {
  const [completedDays, setCompletedDays] = useState(new Set())
  const [currentDay, setCurrentDay] = useState(1)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  const useSupabase = isSupabaseConfigured()

  // Load from localStorage (fallback or when not logged in)
  const loadLocalProgress = useCallback(() => {
    try {
      const saved = localStorage.getItem('commtrainer_progress')
      if (saved) {
        const data = JSON.parse(saved)
        setCompletedDays(new Set(data.completedDays || []))
        setCurrentDay(data.currentDay || 1)
        setStreak(data.streak || 0)
      }
    } catch (e) {
      console.warn('Error loading local progress:', e)
    }
    setLoading(false)
  }, [])

  // Save to localStorage
  const saveLocalProgress = useCallback((days, day, str) => {
    try {
      localStorage.setItem('commtrainer_progress', JSON.stringify({
        completedDays: Array.from(days),
        currentDay: day,
        streak: str,
        updatedAt: new Date().toISOString()
      }))
    } catch (e) {
      console.warn('Error saving local progress:', e)
    }
  }, [])

  // Check auth state
  useEffect(() => {
    if (!useSupabase || !supabase) {
      setAuthLoading(false)
      loadLocalProgress()
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [useSupabase, loadLocalProgress])

  // Load progress when user changes
  useEffect(() => {
    if (authLoading) return

    if (user && useSupabase && supabase) {
      loadSupabaseProgress()
    } else {
      loadLocalProgress()
    }
  }, [user, authLoading, useSupabase, loadLocalProgress])

  // Load from Supabase
  async function loadSupabaseProgress() {
    if (!supabase) {
      loadLocalProgress()
      return
    }
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setCompletedDays(new Set(data.completed_days || []))
        setCurrentDay(data.current_day || 1)
        setStreak(data.streak || 0)
      } else if (error?.code === 'PGRST116') {
        // No record exists, create one and migrate local data
        const localData = localStorage.getItem('commtrainer_progress')
        let initialData = { user_id: user.id }
        
        if (localData) {
          const parsed = JSON.parse(localData)
          initialData = {
            ...initialData,
            completed_days: parsed.completedDays || [],
            current_day: parsed.currentDay || 1,
            streak: parsed.streak || 0
          }
          setCompletedDays(new Set(parsed.completedDays || []))
          setCurrentDay(parsed.currentDay || 1)
          setStreak(parsed.streak || 0)
        }
        
        await supabase.from('user_progress').insert(initialData)
      }
    } catch (e) {
      console.error('Error loading Supabase progress:', e)
      loadLocalProgress() // Fallback to local
    }
    setLoading(false)
  }

  // Save to Supabase
  async function saveSupabaseProgress(days, day, str) {
    if (!user || !useSupabase || !supabase) return

    try {
      await supabase
        .from('user_progress')
        .update({
          completed_days: Array.from(days),
          current_day: day,
          streak: str,
          last_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
    } catch (e) {
      console.error('Error saving to Supabase:', e)
    }
  }

  // Calculate streak
  function calculateStreak(days) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let currentStreak = 0
    let checkDate = new Date(today)
    
    // Check if completed today or yesterday to start counting
    const dayOfYear = (date) => {
      const start = new Date(date.getFullYear(), 0, 0)
      const diff = date - start
      return Math.floor(diff / (1000 * 60 * 60 * 24))
    }
    
    // Simple streak: count consecutive completed days from today backwards
    for (let i = 0; i < 30; i++) {
      const dayNum = days.size > 0 ? Math.max(...Array.from(days)) - i : 0
      if (days.has(dayNum) && dayNum > 0) {
        currentStreak++
      } else if (i > 0) {
        break
      }
    }
    
    return currentStreak
  }

  // Toggle day completion
  const toggleDay = useCallback((day) => {
    setCompletedDays(prev => {
      const newDays = new Set(prev)
      if (newDays.has(day)) {
        newDays.delete(day)
      } else {
        newDays.add(day)
      }
      
      const newStreak = calculateStreak(newDays)
      setStreak(newStreak)
      
      // Save progress
      saveLocalProgress(newDays, currentDay, newStreak)
      saveSupabaseProgress(newDays, currentDay, newStreak)
      
      return newDays
    })
  }, [currentDay, saveLocalProgress])

  // Update current day
  const updateCurrentDay = useCallback((day) => {
    setCurrentDay(day)
    saveLocalProgress(completedDays, day, streak)
    if (user && useSupabase) {
      saveSupabaseProgress(completedDays, day, streak)
    }
  }, [completedDays, streak, user, useSupabase, saveLocalProgress])

  // Auth functions
  async function signInWithEmail(email, password) {
    if (!useSupabase || !supabase) return { error: { message: 'Supabase not configured' } }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  async function signUpWithEmail(email, password) {
    if (!useSupabase || !supabase) return { error: { message: 'Supabase not configured' } }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    return { data, error }
  }

  async function signInWithMagicLink(email) {
    if (!useSupabase || !supabase) return { error: { message: 'Supabase not configured' } }
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    })
    return { data, error }
  }

  async function signOut() {
    if (!useSupabase || !supabase) return
    await supabase.auth.signOut()
    setUser(null)
  }

  return {
    completedDays,
    currentDay,
    streak,
    progress: completedDays.size,
    loading: loading || authLoading,
    user,
    useSupabase,
    toggleDay,
    updateCurrentDay,
    signInWithEmail,
    signUpWithEmail,
    signInWithMagicLink,
    signOut
  }
}
