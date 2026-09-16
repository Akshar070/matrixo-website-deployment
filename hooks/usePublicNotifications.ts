'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { PublicNotification } from '@/lib/publicNotifications'

const LOCAL_STORAGE_KEY = 'matrixo_public_read_notifications'

export function usePublicNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<PublicNotification[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Helper to get local read IDs
  const getLocalReadIds = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // Load notifications from API
  const fetchNotifications = useCallback(async (loadMore = false) => {
    try {
      setIsLoading(true)
      const afterId = loadMore && notifications.length > 0 
        ? notifications[notifications.length - 1].id 
        : ''
      
      const res = await fetch(`/api/notifications?limit=20${afterId ? `&after=${afterId}` : ''}`)
      if (!res.ok) throw new Error('Failed to fetch notifications')
      
      const data = await res.json()
      
      if (loadMore) {
        setNotifications(prev => [...prev, ...data.notifications])
      } else {
        setNotifications(data.notifications)
      }
      
      setHasMore(data.hasMore)
      setError(null)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error fetching notifications')
    } finally {
      setIsLoading(false)
    }
  }, [notifications])

  // Load read state
  const fetchReadState = useCallback(async () => {
    if (user) {
      try {
        const token = await user.getIdToken()
        const res = await fetch('/api/notifications/read-state', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (res.ok) {
          const data = await res.json()
          setReadIds(new Set(data.readIds || []))
          return
        }
      } catch (err) {
        console.error('Failed to fetch read state', err)
      }
    }
    
    // Fallback or visitor
    setReadIds(new Set(getLocalReadIds()))
  }, [user])

  // Initial load
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Load read state initially and on user change
  useEffect(() => {
    fetchReadState()
  }, [fetchReadState])

  // Mark as read
  const markAsRead = async (ids: string[]) => {
    if (!ids || ids.length === 0) return

    // Optimistic update
    setReadIds(prev => {
      const next = new Set(prev)
      ids.forEach(id => next.add(id))
      
      // Update local storage for everyone as fallback/visitor state
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(next)))
      
      return next
    })

    if (user) {
      try {
        const token = await user.getIdToken()
        await fetch('/api/notifications/read-state', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ notificationIds: ids })
        })
      } catch (err) {
        console.error('Failed to mark as read in API', err)
      }
    }
  }

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id)
    markAsRead(allIds)
  }

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length

  return {
    notifications,
    readIds,
    isLoading,
    hasMore,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  }
}
