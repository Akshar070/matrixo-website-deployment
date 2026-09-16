'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBell, FaCheckDouble, FaGift, FaCalendarAlt, FaBullhorn, FaGraduationCap } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePublicNotifications } from '@/hooks/usePublicNotifications'
import { PublicNotification } from '@/lib/publicNotifications'

function getRelativeTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return date.toLocaleDateString()
}

function getIconForCategory(category: string, type: string) {
  if (category === 'STUDENTVAULT') return <FaGift className="text-blue-500" />
  if (type === 'NEW_HACKATHON') return <FaGraduationCap className="text-purple-500" />
  if (category === 'EVENTS') return <FaCalendarAlt className="text-pink-500" />
  return <FaBullhorn className="text-orange-500" />
}

export default function PublicNotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { 
    notifications, 
    readIds, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    isLoading 
  } = usePublicNotifications()

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleNotificationClick = (notification: PublicNotification) => {
    if (!readIds.has(notification.id)) {
      markAsRead([notification.id])
    }
    setIsOpen(false)
    if (notification.targetUrl) {
      router.push(notification.targetUrl)
    }
  }

  const recentNotifications = notifications.slice(0, 5)

  return (
    <div className="relative flex-shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm text-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
      >
        <FaBell size={15} className={`${unreadCount > 0 ? 'animate-pulse text-blue-600 dark:text-blue-400' : ''}`} />
        
        {unreadCount > 0 && (
          <span className="absolute top-[2px] right-[2px] flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white dark:border-[#0A0F2C]"></span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-0 sm:-right-4 mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#0A0F2C]/70 dark:backdrop-blur-2xl dark:backdrop-saturate-150 dark:backdrop-brightness-75 border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden z-[1050] isolate"
          >
            <div className="absolute inset-0 rounded-2xl hidden dark:block dark:bg-[#0A0F2C]/40 -z-10" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
              <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllAsRead();
                  }}
                  className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  <FaCheckDouble /> Mark all read
                </button>
              )}
            </div>

            {/* Content */}
            <div className="max-h-[350px] overflow-y-auto">
              {isLoading && notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500 mx-auto mb-2"></div>
                  Loading...
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No new notifications.
                </div>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-white/5">
                  {recentNotifications.map(notification => {
                    const isUnread = !readIds.has(notification.id)
                    return (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors flex gap-3 ${
                          isUnread ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <div className="mt-1 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5">
                          {getIconForCategory(notification.category, notification.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm truncate font-medium ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                              {notification.title}
                            </p>
                            {isUnread && (
                              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1.5"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 font-medium">
                            {getRelativeTime(notification.publishedAt)}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02]">
              <Link 
                href="/notifications" 
                onClick={() => setIsOpen(false)}
                className="block w-full text-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                View all notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
