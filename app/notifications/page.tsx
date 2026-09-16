'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaCheckDouble, FaGift, FaCalendarAlt, FaBullhorn, FaGraduationCap, FaArrowRight, FaBell } from 'react-icons/fa'
import { usePublicNotifications } from '@/hooks/usePublicNotifications'
import { NotificationCategory, PublicNotification } from '@/lib/publicNotifications'

function getRelativeTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function getIconForCategory(category: string, type: string) {
  if (category === 'STUDENTVAULT') return <FaGift className="text-blue-500" />
  if (type === 'NEW_HACKATHON') return <FaGraduationCap className="text-purple-500" />
  if (category === 'EVENTS') return <FaCalendarAlt className="text-pink-500" />
  return <FaBullhorn className="text-orange-500" />
}

export default function NotificationsPage() {
  const { 
    notifications, 
    readIds, 
    isLoading, 
    hasMore, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead 
  } = usePublicNotifications()

  const [activeTab, setActiveTab] = useState<'ALL' | NotificationCategory>('ALL')

  const filteredNotifications = notifications.filter(n => 
    activeTab === 'ALL' ? true : n.category === activeTab
  )

  const handleNotificationClick = (notification: PublicNotification) => {
    if (!readIds.has(notification.id)) {
      markAsRead([notification.id])
    }
    if (notification.targetUrl) {
      window.location.href = notification.targetUrl
    }
  }

  const tabs = [
    { id: 'ALL', label: 'All' },
    { id: 'EVENTS', label: 'Events' },
    { id: 'STUDENTVAULT', label: 'StudentVault' },
    { id: 'PLATFORM', label: 'Platform' }
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0F2C] pt-24 pb-12 transition-colors duration-300">
      <div className="container-custom max-w-4xl mx-auto px-4">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Notifications</h1>
            <p className="text-gray-600 dark:text-gray-400">Stay updated on the latest events and offers.</p>
          </div>
          
          <button 
            onClick={() => markAllAsRead()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 dark:bg-white/[0.05] dark:text-gray-300 dark:border-white/10 dark:hover:bg-white/10 transition-colors shadow-sm"
          >
            <FaCheckDouble /> Mark all as read
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-white/5 dark:text-gray-300 dark:border-white/10 dark:hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="glass-card-elevated rounded-2xl overflow-hidden min-h-[400px]">
          {isLoading && notifications.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                <FaBell size={24} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No notifications found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                We'll let you know when there's something new for you in this category.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/10">
              {filteredNotifications.map((notification, index) => {
                const isUnread = !readIds.has(notification.id)
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <button
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full text-left p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors flex flex-col sm:flex-row gap-4 sm:gap-6 group relative ${
                        isUnread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      {isUnread && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-500 rounded-r"></div>
                      )}
                      
                      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 group-hover:scale-110 transition-transform duration-300">
                        {getIconForCategory(notification.category, notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-1">
                          <h3 className={`text-base sm:text-lg truncate font-semibold ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                            {notification.title}
                          </h3>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {getRelativeTime(notification.publishedAt)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                          {notification.message}
                        </p>
                        
                        {notification.targetUrl && (
                          <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                            View details <FaArrowRight className="ml-1.5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        )}
                      </div>
                    </button>
                  </motion.div>
                )
              })}
            </div>
          )}
          
          {hasMore && !isLoading && (
            <div className="p-6 text-center border-t border-gray-100 dark:border-white/10">
              <button
                onClick={() => fetchNotifications(true)}
                className="px-6 py-2.5 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:shadow-sm dark:bg-white/5 dark:text-gray-300 dark:border-white/10 dark:hover:bg-white/10 transition-all duration-200"
              >
                Load older notifications
              </button>
            </div>
          )}
          
          {isLoading && notifications.length > 0 && (
            <div className="p-6 text-center border-t border-gray-100 dark:border-white/10">
              <div className="animate-pulse text-gray-500 dark:text-gray-400 text-sm">Loading more...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


