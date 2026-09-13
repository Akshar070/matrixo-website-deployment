'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaGoogle, FaArrowRight, FaShieldAlt, FaBolt, FaLock, FaCheckCircle, FaSignOutAlt, FaEnvelope } from 'react-icons/fa'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { toast } from 'sonner'
import { signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth'
import { auth, firebaseReady } from '@/lib/firebaseConfig'

export default function AuthPage() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const [isLogin, setIsLogin] = useState(mode !== 'register')
  const requestedReturnUrl = searchParams.get('returnUrl')
  const returnUrl = requestedReturnUrl?.startsWith('/') ? requestedReturnUrl : '/'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const router = useRouter()
  const { user, signIn, signUp, signInWithGoogle, logout } = useAuth()

  // Keep login/register mode in sync with URL aliases (/login, /register)
  useEffect(() => {
    setIsLogin(mode !== 'register')
  }, [mode])

  // If user is already logged in and came from a returnUrl, redirect them
  useEffect(() => {
    if (user && returnUrl !== '/') {
      router.push(returnUrl)
    }
  }, [user, returnUrl, router])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return
    setLoading(true)
    try {
      if (!firebaseReady || !auth) {
        toast.error('Authentication is not configured. Please try again later.')
        return
      }
      // Sign in temporarily to resend verification
      const userCredential = await signInWithEmailAndPassword(auth, verificationEmail, formData.password)
      await sendEmailVerification(userCredential.user)
      await signOut(auth)
      toast.success('Verification email resent! Check your inbox.')
      setResendCooldown(60)
    } catch (error: any) {
      toast.error('Failed to resend verification email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password)
        toast.success('Welcome back!')
        router.push(returnUrl)
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match')
          setLoading(false)
          return
        }
        if (formData.password.length < 6) {
          toast.error('Password should be at least 6 characters')
          setLoading(false)
          return
        }
        await signUp(formData.email, formData.password, formData.name)
        setVerificationEmail(formData.email)
        setShowVerification(true)
        setResendCooldown(60)
        toast.success('Account created! Please check your email to verify.')
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already in use')
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters')
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address')
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error('Invalid email or password')
      } else if (error.code === 'auth/email-not-verified') {
        setVerificationEmail(formData.email)
        setShowVerification(true)
        setResendCooldown(60)
        toast.info('Please verify your email to continue.')
      } else {
        toast.error(error.message || 'Authentication failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      if (!firebaseReady) {
        toast.error('Authentication is not configured. Please try again later.')
        return
      }
      const signInMethod = await signInWithGoogle()
      if (signInMethod === 'redirect') {
        return
      }
      toast.success('Signed in successfully!')
      router.push(returnUrl)
    } catch (error: any) {
      const code = error?.code || 'unknown'
      const message = error?.message || 'Unknown Google auth error'
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'unknown-host'
      const isBetaHost = currentHost === 'beta.matrixo.in'

      console.error('Google Auth Error:', {
        code,
        message,
        currentHost,
        customData: error?.customData || null
      })

      if (code === 'auth/popup-closed-by-user') {
        toast.info('Sign-in cancelled')
        return
      }

      if (code === 'auth/popup-blocked') {
        toast.error('Popup blocked! Please allow popups.')
      } else if (code === 'auth/unauthorized-domain') {
        toast.error(`Domain "${currentHost}" is not authorized for Google sign-in.`)
      } else if (code === 'auth/operation-not-allowed') {
        toast.error('Google sign-in is not enabled in Firebase Authentication.')
      } else if (code === 'auth/invalid-api-key') {
        toast.error('Invalid Firebase API key. Check beta environment variables.')
      } else if (code === 'auth/network-request-failed') {
        toast.error('Network error during Google sign-in. Check HTTPS/connection and retry.')
      } else {
        const fallbackMessage = message.replace(/^Firebase:\s*/i, '').split(' (auth/')[0]
        toast.error(isBetaHost ? `${fallbackMessage} (${code})` : fallbackMessage)
      }
      return
    } finally {
      setLoading(false)
    }
  }



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="auth-page min-h-[100dvh] relative overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="auth-grid absolute inset-0" />

      <div className="relative z-10 flex items-start sm:items-center justify-center min-h-[100dvh] px-3 sm:px-6 lg:px-8 py-[max(1rem,env(safe-area-inset-top))] sm:py-20">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-start sm:items-center">

          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left space-y-6 hidden lg:block"
          >
            <div className="space-y-4">
              <div>
                <h1 className="auth-heading-primary text-5xl font-bold mb-2">
                  Experience
                </h1>
                <h2 className="auth-heading-accent text-5xl font-bold pb-1 leading-tight">
                  Personalized Learning
                </h2>
              </div>
              <p className="auth-text-secondary text-2xl font-light">
                Vision Platform for Next-Gen Education
              </p>
            </div>

            <div className="space-y-4 pt-8">
              <div className="flex items-start gap-4 group">
                <div className="auth-feature-icon p-3 rounded-xl transition-colors">
                  <FaShieldAlt className="text-2xl" />
                </div>
                <div>
                  <h3 className="auth-heading-primary text-xl font-semibold">Enterprise Security</h3>
                  <p className="auth-text-secondary">End-to-end encryption & data protection</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="auth-feature-icon p-3 rounded-xl transition-colors">
                  <FaBolt className="text-2xl" />
                </div>
                <div>
                  <h3 className="auth-heading-primary text-xl font-semibold">Lightning Fast</h3>
                  <p className="auth-text-secondary">Instant access to all platform features</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="auth-feature-icon p-3 rounded-xl transition-colors">
                  <FaLock className="text-2xl" />
                </div>
                <div>
                  <h3 className="auth-heading-primary text-xl font-semibold">Privacy First</h3>
                  <p className="auth-text-secondary">Your data, your control, always</p>
                </div>
              </div>
            </div>

            <div className="auth-text-muted pt-8 flex items-center gap-4 text-sm">
              <span>Trusted by 10,000+ students</span>
              <span>•</span>
              <span>500+ institutions</span>
            </div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <div className="auth-card p-4 sm:p-6 lg:p-8">
              {/* Mobile Logo */}
              <div className="lg:hidden mb-6 sm:mb-8 flex justify-center relative h-10 sm:h-12">
                {/* Light Mode Logo (Black) */}
                <img
                  src="/logos/logo-light.png"
                  alt="matriXO Logo"
                  className="h-10 sm:h-12 w-auto object-contain dark:hidden"
                />
                {/* Dark Mode Logo (White) */}
                <img
                  src="/logos/logo-dark.png"
                  alt="matriXO Logo"
                  className="h-10 sm:h-12 w-auto object-contain hidden dark:block"
                />
              </div>

              {/* Already Logged In State */}
              {user ? (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                    <FaCheckCircle className="text-3xl" style={{ color: '#22c55e' }} />
                  </div>
                  <div>
                    <h3 className="auth-heading-primary text-xl font-bold mb-1">
                      Welcome back!
                    </h3>
                    <p className="auth-text-secondary">
                      You&apos;re already signed in as
                    </p>
                    <p className="auth-heading-primary font-semibold mt-1">
                      {user.displayName || user.email}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Link href="/">
                      <button className="auth-btn-primary w-full py-3 px-5 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group">
                        <span>Go to Home</span>
                        <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                    <button
                      onClick={async () => { await logout(); toast.success('Signed out successfully') }}
                      className="auth-btn-outline w-full py-3 px-5 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <FaSignOutAlt />
                      <span>Sign out & use another account</span>
                    </button>
                  </div>
                </div>
              ) : showVerification ? (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center" style={{ background: 'var(--auth-icon-bg)' }}>
                    <FaEnvelope className="text-4xl" style={{ color: 'var(--auth-primary)' }} />
                  </div>
                  <div>
                    <h3 className="auth-heading-primary text-2xl font-bold mb-2">
                      Verify Your Email
                    </h3>
                    <p className="auth-text-secondary mb-1">
                      We&apos;ve sent a verification link to
                    </p>
                    <p className="font-semibold text-lg" style={{ color: 'var(--auth-primary)' }}>
                      {verificationEmail}
                    </p>
                  </div>
                  <div className="auth-info-box rounded-xl p-4 text-left">
                    <p className="auth-info-heading text-sm">
                      <strong>Steps to verify:</strong>
                    </p>
                    <ol className="auth-text-secondary text-sm mt-2 space-y-1 list-decimal list-inside">
                      <li>Check your inbox (and spam folder)</li>
                      <li>Click the verification link in the email</li>
                      <li>Come back here and sign in</li>
                    </ol>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={handleResendVerification}
                      disabled={loading || resendCooldown > 0}
                      className="auth-btn-outline w-full py-3 px-5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : 'Resend Verification Email'}
                    </button>
                    <button
                      onClick={() => {
                        setShowVerification(false)
                        setIsLogin(true)
                      }}
                      className="auth-btn-primary w-full py-3 px-5 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
                    >
                      <span>Go to Sign In</span>
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ) : (
                <>

                  {/* Tab Switcher */}
                  <div className="auth-tab-container flex gap-2 mb-6 p-1 rounded-xl">
                    <button
                      onClick={() => setIsLogin(true)}
                      className={`flex-1 py-2.5 px-5 rounded-lg font-medium transition-all ${isLogin ? 'auth-tab-active' : 'auth-tab-inactive'}`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setIsLogin(false)}
                      className={`flex-1 py-2.5 px-5 rounded-lg font-medium transition-all ${!isLogin ? 'auth-tab-active' : 'auth-tab-inactive'}`}
                    >
                      Sign Up
                    </button>
                  </div>

                  {/* OAuth Buttons */}
                  <div className="space-y-2.5 mb-6">
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="auth-btn-google w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
                      ) : (
                        <>
                          <FaGoogle className="text-xl" />
                          <span>Continue with Google</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="auth-divider w-full" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="auth-divider-text px-4">Or continue with</span>
                    </div>
                  </div>

                  {/* Email Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode="wait">
                      {!isLogin && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            required={!isLogin}
                            className="auth-input w-full py-3 px-5 rounded-2xl outline-none transition-all"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="auth-input w-full py-3 px-5 rounded-2xl outline-none transition-all"
                    />

                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="auth-input w-full py-3 px-5 rounded-2xl outline-none transition-all"
                    />

                    <AnimatePresence mode="wait">
                      {!isLogin && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required={!isLogin}
                            className="auth-input w-full py-3 px-5 rounded-2xl outline-none transition-all"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isLogin && (
                      <div className="flex justify-end">
                        <Link href="/forgot-password" className="auth-link text-sm transition-colors">
                          Forgot password?
                        </Link>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="auth-btn-primary w-full py-3 px-5 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                          <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="auth-text-muted mt-8 text-center text-sm">
                    By continuing, you agree to our{' '}
                    <Link href="/terms" className="auth-link transition-colors">
                      Terms
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="auth-link transition-colors">
                      Privacy Policy
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
