'use client'

import { ReactNode, forwardRef, useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Briefcase, Calendar, CalendarDays, Check, ChevronDown, Circle, Clock, Edit2, Eye, IdCard, Info, LineChart, Loader2, Mail, X } from 'lucide-react'

// ============================================
// DESIGN TOKENS - Professional Color Palette
// ============================================
export const colors = {
  // Primary brand colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3B82F6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a5f',
  },
  // Neutral grays
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#050816',
  },
  // Semantic colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
}

// ============================================
// BUTTON COMPONENT (Glassmorphism)
// ============================================
interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050816]'
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-500 text-white focus:ring-primary-500 shadow-sm',
    secondary: 'bg-transparent hover:bg-slate-800 text-slate-300 focus:ring-slate-500 border border-slate-700',
    ghost: 'bg-transparent hover:bg-white/5 text-slate-400 hover:text-slate-200 focus:ring-slate-500',
    danger: 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500 shadow-sm',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500 shadow-sm',
  }
  
  const sizes = {
    sm: 'h-9 px-4 text-sm gap-1.5 rounded-full',
    md: 'h-12 px-6 text-sm gap-2 rounded-full',
    lg: 'h-14 px-8 text-base gap-2.5 rounded-full',
  }
  
  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {loading && <Loader2 className="animate-spin w-4 h-4" />}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </motion.button>
  )
})
Button.displayName = 'Button'

// ============================================
// INPUT COMPONENT
// ============================================
interface InputProps {
  label?: string
  placeholder?: string
  type?: 'text' | 'password' | 'email' | 'number' | 'date' | 'datetime-local' | 'time' | 'month'
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  icon?: ReactNode
  disabled?: boolean
  required?: boolean
  className?: string
  min?: string
  max?: string
  name?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
  icon,
  disabled = false,
  required = false,
  className = '',
  min,
  max,
  name,
}, ref) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-400">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          name={name}
          className={`
            w-full px-4 py-3 bg-white/[0.04] border rounded-xl text-slate-100 placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/40
            transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500/40 bg-red-500/5' : 'border-white/[0.08] hover:border-white/[0.12]'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
      </div>
      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1">
          <AlertTriangle className="text-xs" />
          {error}
        </p>
      )}
    </div>
  )
})
Input.displayName = 'Input'

// ============================================
// TEXTAREA COMPONENT
// ============================================
interface TextareaProps {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  error?: string
  disabled?: boolean
  required?: boolean
  rows?: number
  className?: string
  name?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  placeholder,
  value,
  onChange,
  onKeyDown,
  error,
  disabled = false,
  required = false,
  rows = 4,
  className = '',
  name,
}, ref) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-400">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        name={name}
        className={`
          w-full px-4 py-3 bg-white/[0.04] border rounded-xl text-slate-100 placeholder-slate-500
          focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/40
          transition-all duration-200 resize-none
          ${error ? 'border-red-500/40 bg-red-500/5' : 'border-white/[0.08] hover:border-white/[0.12]'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      />
      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1">
          <AlertTriangle className="text-xs" />
          {error}
        </p>
      )}
    </div>
  )
})
Textarea.displayName = 'Textarea'

// ============================================
// SELECT COMPONENT
// ============================================
interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export const Select = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null)
  const [openAbove, setOpenAbove] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Calculate dropdown position synchronously
  const calculatePosition = () => {
    if (!triggerRef.current) return null
    
    const rect = triggerRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const dropdownHeight = Math.min(320, options.length * 48)
    
    const spaceBelow = viewportHeight - rect.bottom - 8
    const spaceAbove = rect.top - 8
    
    let top: number
    let shouldOpenAbove = false
    
    if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
      top = rect.bottom + 8
      shouldOpenAbove = false
    } else {
      const actualDropdownHeight = Math.min(dropdownHeight, spaceAbove)
      top = rect.top - actualDropdownHeight - 8
      shouldOpenAbove = true
    }
    
    return { top, left: rect.left, width: rect.width, shouldOpenAbove }
  }

  // Toggle dropdown with synchronous position calculation
  const handleToggle = () => {
    if (disabled) return
    
    if (!isOpen) {
      const pos = calculatePosition()
      if (pos) {
        setDropdownPosition({ top: pos.top, left: pos.left, width: pos.width })
        setOpenAbove(pos.shouldOpenAbove)
        setIsOpen(true)
      }
    } else {
      setIsOpen(false)
    }
  }

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on scroll (parent containers)
  useEffect(() => {
    if (isOpen) {
      const handleScroll = () => setIsOpen(false)
      window.addEventListener('scroll', handleScroll, true)
      return () => window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen])

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-400">{label}</label>
      )}
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-left
            flex items-center justify-between transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/40
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/[0.12]'}
          `}
        >
          <span className={selectedOption ? 'text-slate-100' : 'text-slate-500'}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown className={`text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Dropdown rendered via Portal to escape parent stacking contexts */}
        {isOpen && dropdownPosition && typeof window !== 'undefined' && createPortal(
          <AnimatePresence>
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: openAbove ? 10 : -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: openAbove ? 10 : -10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[rgba(15,23,42,0.95)] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
              style={{
                position: 'fixed',
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                zIndex: 99999
              }}
            >
              <div className="max-h-80 overflow-y-auto">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange?.(option.value)
                      setIsOpen(false)
                    }}
                    className={`
                      w-full px-4 py-3 text-left transition-all duration-200
                      ${value === option.value 
                        ? 'bg-primary-500/15 text-primary-400 border-l-2 border-primary-500' 
                        : 'text-slate-300 hover:bg-white/[0.06] hover:text-white border-l-2 border-transparent'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
      </div>
    </div>
  )
}

// ============================================
// BADGE COMPONENT
// ============================================
interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary'
  size?: 'sm' | 'md'
  className?: string
}

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) => {
  const variants = {
    default: 'bg-slate-700/50 text-slate-300',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    error: 'bg-red-500/15 text-red-400 border border-red-500/20',
    info: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    primary: 'bg-primary-500/15 text-primary-400 border border-primary-500/20',
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }
  
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  )
}

// ============================================
// CARD COMPONENT (Glassmorphism)
// ============================================
interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  glow?: boolean
}

export const Card = ({ children, className = '', padding = 'md', hover = false, glow = false }: CardProps) => {
  const paddings = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-5 sm:p-8',
  }
  
  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.01 } : undefined}
      className={`
        bg-[rgba(15,23,42,0.60)] backdrop-blur-xl border border-white/[0.08] rounded-2xl
        ${paddings[padding]}
        ${hover ? 'transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/5 hover:border-white/[0.12]' : ''}
        ${glow ? 'shadow-sm shadow-primary-500/5' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// MODAL COMPONENT (Glassmorphism)
// ============================================
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md', className = '' }: ModalProps) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  
  if (typeof window === 'undefined') {
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`relative w-full ${sizes[size]} bg-[rgba(10,15,30,0.96)] backdrop-blur-2xl border border-white/[0.1] rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/50 max-h-[90vh] flex flex-col ${className}`}
            >
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none" />
              {title && (
                <div className="relative flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 flex-shrink-0">
                  <h3 className="text-lg sm:text-xl font-bold text-white truncate pr-2">{title}</h3>
                  <button onClick={onClose} className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg sm:rounded-xl transition-all duration-200 flex-shrink-0">
                    <X />
                  </button>
                </div>
              )}
              <div className="relative p-4 sm:p-6 overflow-y-auto flex-1">{children}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    )
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl"
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
          />
          
          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${sizes[size]} bg-[#0b101d]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/50 max-h-[90vh] flex flex-col ${className}`}
          >
            {/* Clean surface */}
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none" />
            
            {/* Header */}
            {title && (
              <div className="relative flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 flex-shrink-0">
                <h3 className="text-lg sm:text-xl font-bold text-white truncate pr-2">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg sm:rounded-xl transition-all duration-200 flex-shrink-0"
                >
                  <X />
                </button>
              </div>
            )}
            
            {/* Body */}
            <div className="relative p-4 sm:p-6 overflow-y-auto flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

// ============================================
// ALERT COMPONENT
// ============================================
interface AlertProps {
  children: ReactNode
  variant?: 'info' | 'success' | 'warning' | 'error'
  icon?: ReactNode
  className?: string
}

export const Alert = ({ children, variant = 'info', icon, className = '' }: AlertProps) => {
  const variants = {
    info: 'bg-blue-500/[0.08] border-blue-500/20 text-blue-400',
    success: 'bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/[0.08] border-amber-500/20 text-amber-400',
    error: 'bg-red-500/[0.08] border-red-500/20 text-red-400',
  }
  
  const defaultIcons = {
    info: <Info />,
    success: <Check />,
    warning: <AlertTriangle />,
    error: <AlertTriangle />,
  }
  
  return (
    <div className={`flex items-start gap-3 p-4 border rounded-xl ${variants[variant]} ${className}`}>
      <span className="flex-shrink-0 mt-0.5">{icon || defaultIcons[variant]}</span>
      <div className="text-sm">{children}</div>
    </div>
  )
}

// ============================================
// LOCAL PROFILE IMAGE FALLBACKS
// ============================================
const localProfileImages: Record<string, string> = {
  'M-A001': '/intern-images/M-A001.webp',
  'M-A005': '/intern-images/M-A005.webp',
  'M-A006': '/intern-images/M-A006.webp',
  'M-A008': '/intern-images/M-A008.webp',
  'M-A009': '/intern-images/M-A009.webp',
  'M-A010': '/intern-images/M-A010.webp',
  'M-A011': '/intern-images/M-A011.webp',
  'M-A012': '/intern-images/M-A012.webp',
  'M-A013': '/intern-images/M-A013.webp',
}

export const getLocalProfileImage = (profileImage?: string, employeeId?: string): string | undefined => {
  if (profileImage) return profileImage
  if (employeeId && localProfileImages[employeeId]) return localProfileImages[employeeId]
  return undefined
}

// ============================================
// AVATAR COMPONENT
// ============================================
interface AvatarProps {
  src?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showBorder?: boolean
  employeeId?: string
}

export const Avatar = ({ src, name = 'User', size = 'md', className = '', showBorder = true, employeeId }: AvatarProps) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  }
  
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=3B82F6&color=fff&size=200`
  const resolvedSrc = getLocalProfileImage(src, employeeId) || fallbackUrl
  
  return (
    <div 
      className={`
        ${sizes[size]} rounded-full overflow-hidden flex-shrink-0
        ${showBorder ? 'ring-2 ring-primary-500/50 ring-offset-2 ring-offset-[#050816]' : ''}
        ${className}
      `}
    >
      <img
        src={resolvedSrc}
        alt={name}
        className="w-full h-full object-cover"
        onError={(e) => { (e.target as HTMLImageElement).src = fallbackUrl }}
      />
    </div>
  )
}

// ============================================
// SKELETON LOADER
// ============================================
interface SkeletonProps {
  width?: string
  height?: string
  rounded?: 'sm' | 'md' | 'lg' | 'full'
  className?: string
}

export const Skeleton = ({ width = '100%', height = '1rem', rounded = 'md', className = '' }: SkeletonProps) => {
  const roundedStyles = {
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  }
  
  return (
    <div
      className={`animate-pulse bg-slate-800/50 ${roundedStyles[rounded]} ${className}`}
      style={{ width, height }}
    />
  )
}

// ============================================
// TAB COMPONENT
// ============================================
interface Tab {
  id: string
  label: string
  icon?: ReactNode
  badge?: string | number
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
  className?: string
}

export const Tabs = ({ tabs, activeTab, onChange, className = '' }: TabsProps) => {
  return (
    <div className={`flex items-center gap-1 p-1 bg-[rgba(15,23,42,0.60)] rounded-lg border border-white/[0.06] ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
            ${activeTab === tab.id 
              ? 'bg-primary-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
            }
          `}
        >
          {tab.icon}
          {tab.label}
          {tab.badge !== undefined && (
            <span className={`
              px-1.5 py-0.5 rounded-full text-xs font-bold
              ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-700/50'}
            `}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================
interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export const EmptyState = ({ icon, title, description, action, className = '' }: EmptyStateProps) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      {icon && (
        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-100 mb-1">{title}</h3>
      {description && <p className="text-slate-400 text-sm max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ============================================
// SPINNER COMPONENT
// ============================================
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Spinner = ({ size = 'md', className = '' }: SpinnerProps) => {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  }
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin text-primary-500 ${sizes[size]}`} />
    </div>
  )
}

// ============================================
// PROFILE INFO SYSTEM - REUSABLE OVERLAY COMPONENT
// ============================================



// Profile Data Contract
export interface ProfileInfoData {
  // Primary Info
  employeeId: string
  name: string
  profileImage?: string
  role: string
  department?: string
  specialization?: string // For interns
  designation?: string
  
  // Secondary Info
  email?: string
  joiningDate?: string
  attendancePercentage?: number
  status?: 'Active' | 'On Leave' | 'Inactive'
  
  // Admin-only Info
  lastAttendanceDate?: string
  presentCount?: number
  absentCount?: number
  leaveCount?: number
}

interface ProfileInfoProps {
  data: ProfileInfoData
  isAdmin?: boolean
  children: ReactNode
  onViewProfile?: () => void
  onEditProfile?: () => void
  disabled?: boolean
  inline?: boolean // For inline @mentions in text
}

// Main ProfileInfo Component
export const ProfileInfo = ({
  data,
  isAdmin = false,
  children,
  onViewProfile,
  onEditProfile,
  disabled = false,
  inline = false
}: ProfileInfoProps) => {
  const [showPreview, setShowPreview] = useState(false)
  const [showExpanded, setShowExpanded] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [arrowOffset, setArrowOffset] = useState(0) // Offset from center for arrow
  const triggerRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const expandedRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom'>('top') // Arrow at top or bottom

  // Handle hover
  const handleMouseEnter = () => {
    if (disabled || showExpanded) return
    hoverTimeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const cardWidth = 280 // max-w-[280px]
        const cardHeight = 150 // approximate height
        const padding = 16
        
        const originalX = rect.left + rect.width / 2
        let x = originalX - cardWidth / 2 // Left edge of card
        let y = rect.bottom + 8
        let openedAbove = false
        
        // Clamp horizontal position
        if (x < padding) x = padding
        if (x + cardWidth > viewportWidth - padding) x = viewportWidth - cardWidth - padding
        
        // Check vertical overflow - if not enough space below, open above
        if (y + cardHeight > viewportHeight - padding) {
          y = rect.top - cardHeight - 8
          openedAbove = true
        }
        
        // Arrow position: if opened above trigger, arrow at bottom; if below, arrow at top
        setArrowPosition(openedAbove ? 'bottom' : 'top')
        
        // Calculate arrow offset from card's center to trigger's center
        const cardCenter = x + cardWidth / 2
        setArrowOffset(originalX - cardCenter)
        setPosition({ x, y })
        setShowPreview(true)
      }
    }, 300)
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    // Check if moving to preview card
    const relatedTarget = e.relatedTarget as HTMLElement
    if (previewRef.current?.contains(relatedTarget)) return
    setShowPreview(false)
  }

  const handlePreviewMouseLeave = (e: React.MouseEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement
    if (triggerRef.current?.contains(relatedTarget)) return
    setShowPreview(false)
  }

  // Handle click for expanded view (disabled for inline mentions)
  const handleClick = () => {
    if (disabled || inline) return // Inline mentions are hover-only
    setShowPreview(false)
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      const cardWidth = 360
      const cardHeight = 400
      const padding = 16
      
      // Calculate horizontal position - clamp to viewport
      const originalX = rect.left + rect.width / 2
      let x = originalX - cardWidth / 2 // Left edge of card
      
      // Clamp horizontal position
      if (x < padding) x = padding
      if (x + cardWidth > viewportWidth - padding) x = viewportWidth - cardWidth - padding
      
      // Calculate vertical position
      let y = rect.bottom + 12
      if (y + cardHeight > viewportHeight - padding) {
        // Try positioning above
        y = rect.top - cardHeight - 12
        if (y < padding) {
          // If still doesn't fit, position at top with scroll
          y = padding
        }
      }
      
      // Calculate arrow offset from card's center to trigger's center
      const cardCenter = x + cardWidth / 2
      setArrowOffset(originalX - cardCenter)
      setPosition({ x, y })
    }
    setShowExpanded(true)
  }

  // Close expanded on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        expandedRef.current && 
        !expandedRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setShowExpanded(false)
      }
    }
    
    if (showExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExpanded])

  // ESC to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowExpanded(false)
        setShowPreview(false)
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  const resolvedProfileImage = getLocalProfileImage(data.profileImage, data.employeeId)
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name?.split(' ').map(n => n[0]).join('') || 'U')}&background=3B82F6&color=fff&size=200`
  
  const getRoleBadgeVariant = (role: string) => {
    if (role === 'admin' || role === 'sub-admin') return 'warning'
    if ((role || '').toLowerCase().includes('intern')) return 'info'
    return 'primary'
  }

  const getStatusColor = (status?: string) => {
    if (status === 'Active') return 'text-emerald-400'
    if (status === 'On Leave') return 'text-amber-400'
    return 'text-slate-400'
  }

  return (
    <>
      {/* Trigger Element */}
      {inline ? (
        <span
          ref={triggerRef as React.RefObject<HTMLSpanElement>}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          className={disabled ? '' : 'cursor-pointer'}
          style={{ display: 'inline' }}
        >
          {children}
        </span>
      ) : (
        <div
          ref={triggerRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          className={disabled ? '' : 'cursor-pointer'}
        >
          {children}
        </div>
      )}

      {/* Preview Card (Hover) - Rendered via Portal */}
      {showPreview && typeof window !== 'undefined' && createPortal(
        <motion.div
          ref={previewRef}
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          onMouseLeave={handlePreviewMouseLeave}
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            zIndex: 99980,
          }}
          className="bg-[rgba(10,15,30,0.97)] backdrop-blur-2xl border border-white/[0.1] rounded-xl shadow-2xl shadow-black/40 p-4 w-[280px] max-w-[calc(100vw-32px)]"
        >
          {/* Arrow - positioned dynamically based on whether hover opens above or below */}
          <div 
            className={`absolute w-4 h-4 bg-[rgba(10,15,30,1)] border-white/[0.1] ${
              arrowPosition === 'top' 
                ? '-top-2 border-l border-t' 
                : '-bottom-2 border-r border-b'
            }`}
            style={{ 
              left: `calc(50% + ${arrowOffset}px)`, 
              transform: 'translateX(-50%) rotate(45deg)' 
            }}
          />
          
          <div className="flex items-center gap-3 relative">
            <div className="relative">
              <img
                src={resolvedProfileImage || fallbackUrl}
                alt={data.name}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = fallbackUrl }}
              />
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${data.status === 'Active' ? 'bg-emerald-500' : data.status === 'On Leave' ? 'bg-amber-500' : 'bg-slate-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{data.name}</p>
              <p className="text-xs text-slate-400 truncate">{data.designation || data.department}</p>
              <p className="text-xs text-primary-400 font-mono">{data.employeeId}</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <Badge variant={getRoleBadgeVariant(data.role)} size="sm">
              {data.role === 'admin' ? '👑 Admin' : data.role === 'sub-admin' ? '⭐ Sub-Admin' : data.role}
            </Badge>
            {!inline && data.attendancePercentage !== undefined && (
              <span className="text-slate-400 flex items-center gap-1">
                <LineChart className="text-primary-400" />
                {data.attendancePercentage.toFixed(0)}% attendance
              </span>
            )}
          </div>
          
          {!inline && <p className="text-xs text-slate-500 text-center mt-2">Click for more details</p>}
        </motion.div>,
        document.body
      )}

      {/* Expanded Card (Click) - Rendered via Portal */}
      {showExpanded && typeof window !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            style={{ zIndex: 99995 }}
            onClick={() => setShowExpanded(false)}
          />
          
          {/* Expanded Card */}
          <motion.div
            ref={expandedRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              left: position.x,
              top: position.y,
              zIndex: 99996,
            }}
            className="bg-[rgba(10,15,30,0.97)] backdrop-blur-2xl border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/50 w-[360px] max-w-[calc(100vw-32px)] max-h-[80vh] overflow-auto"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowExpanded(false)}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all z-10"
            >
              <X className="text-sm" />
            </button>

            {/* Header with Gradient */}
            <div className="p-5 bg-gradient-to-br from-primary-600/10 via-transparent to-transparent border-b border-white/[0.06]">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={resolvedProfileImage || fallbackUrl}
                    alt={data.name}
                    className="relative w-16 h-16 rounded-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = fallbackUrl }}
                  />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[#0b101d] ${data.status === 'Active' ? 'bg-emerald-500' : data.status === 'On Leave' ? 'bg-amber-500' : 'bg-slate-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white truncate">{data.name}</h3>
                  <p className="text-sm text-slate-400 truncate">{data.designation || 'Employee'}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <Badge variant="primary" size="sm">{data.employeeId}</Badge>
                    <Badge variant={getRoleBadgeVariant(data.role)} size="sm">
                      {data.role === 'admin' ? '👑 Admin' : data.role === 'sub-admin' ? '⭐ Sub-Admin' : data.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Info */}
            <div className="p-4 space-y-3 border-b border-white/[0.06]">
              {data.department && (
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="text-primary-400 flex-shrink-0" />
                  <span className="text-slate-400">Department:</span>
                  <span className="text-white">{data.department}</span>
                </div>
              )}
              {data.specialization && (
                <div className="flex items-center gap-3 text-sm">
                  <IdCard className="text-blue-400 flex-shrink-0" />
                  <span className="text-slate-400">Specialization:</span>
                  <span className="text-white">{data.specialization}</span>
                </div>
              )}
              {data.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="text-primary-400 flex-shrink-0" />
                  <span className="text-slate-400">Email:</span>
                  <span className="text-white truncate">{data.email}</span>
                </div>
              )}
              {data.joiningDate && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-400">Joined:</span>
                  <span className="text-white">{data.joiningDate}</span>
                </div>
              )}
            </div>

            {/* Secondary Info */}
            <div className="p-4 space-y-3 border-b border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm">
                  <Circle className={`text-xs flex-shrink-0 ${getStatusColor(data.status)}`} />
                  <span className="text-slate-400">Status:</span>
                  <span className={`font-medium ${getStatusColor(data.status)}`}>{data.status || 'Unknown'}</span>
                </div>
                {data.attendancePercentage !== undefined && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                    <LineChart className="text-primary-400 text-sm" />
                    <span className="text-lg font-bold text-primary-400">
                      {data.attendancePercentage.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Admin-only Info */}
            {isAdmin && (data.presentCount !== undefined || data.lastAttendanceDate) && (
              <div className="p-4 bg-amber-500/5 border-b border-amber-500/10">
                <p className="text-xs text-amber-400 font-medium mb-3 flex items-center gap-1">
                  <Clock /> Admin View
                </p>
                {data.lastAttendanceDate && (
                  <div className="flex items-center gap-3 text-sm mb-2">
                    <span className="text-slate-400">Last marked:</span>
                    <span className="text-white">{data.lastAttendanceDate}</span>
                  </div>
                )}
                {data.presentCount !== undefined && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="text-center p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <div className="text-lg font-bold text-emerald-400">{data.presentCount}</div>
                      <div className="text-xs text-slate-400">Present</div>
                    </div>
                    <div className="text-center p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="text-lg font-bold text-red-400">{data.absentCount || 0}</div>
                      <div className="text-xs text-slate-400">Absent</div>
                    </div>
                    <div className="text-center p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <div className="text-lg font-bold text-amber-400">{data.leaveCount || 0}</div>
                      <div className="text-xs text-slate-400">Leave</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            {(onViewProfile || onEditProfile) && (
              <div className="p-4 flex gap-2">
                {onViewProfile && (
                  <button
                    onClick={() => {
                      setShowExpanded(false)
                      onViewProfile()
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-colors font-medium text-sm"
                  >
                    <Eye /> View Full Profile
                  </button>
                )}
                {isAdmin && onEditProfile && (
                  <button
                    onClick={() => {
                      setShowExpanded(false)
                      onEditProfile()
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors border border-white/10"
                  >
                    <Edit2 />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>,
        document.body
      )}
    </>
  )
}

// Helper function to convert EmployeeProfile to ProfileInfoData
export const employeeToProfileData = (
  employee: {
    employeeId: string
    name: string
    email?: string
    department?: string
    designation?: string
    joiningDate?: string
    profileImage?: string
    role?: string
  },
  stats?: {
    attendancePercentage?: number
    presentCount?: number
    absentCount?: number
    leaveCount?: number
    lastAttendanceDate?: string
  }
): ProfileInfoData => ({
  employeeId: employee.employeeId,
  name: employee.name,
  profileImage: getLocalProfileImage(employee.profileImage, employee.employeeId),
  role: employee.role || 'employee',
  department: employee.department,
  designation: employee.designation,
  email: employee.email,
  joiningDate: employee.joiningDate,
  attendancePercentage: stats?.attendancePercentage,
  status: 'Active', // Can be computed from recent attendance
  presentCount: stats?.presentCount,
  absentCount: stats?.absentCount,
  leaveCount: stats?.leaveCount,
  lastAttendanceDate: stats?.lastAttendanceDate
})
