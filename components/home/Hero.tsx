'use client'

import type { MouseEvent } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FaRocket, FaUniversity } from 'react-icons/fa'
import HeadingHighlight from '@/components/HeadingHighlight'

export default function Hero() {
  const getEntryDirection = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left

    return x < rect.width / 2 ? 'left' : 'right'
  }

  const handleCtaMouseEnter = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.dataset.direction = getEntryDirection(event)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent">
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:28px_28px]" />

      {/* Very subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300/50 dark:via-white/[0.06] to-transparent" />

      {/* Content */}
      <div className="relative z-10 container-custom px-4 sm:px-6 py-20 sm:py-24 md:py-32 text-center">
        {/* CSS-driven entrance (see .hero-* in globals.css). These used to be
            framer-motion, which shipped opacity:0 in the SSR HTML and held the
            hero invisible until hydration — the LCP render delay. */}
        <div className="hero-rise">
          {/* Badge */}
          <div className="inline-block mb-6 px-6 py-2 glass-chip hero-pop hero-d1">
            <span className="text-slate-700 dark:text-gray-300 font-medium text-sm md:text-base">
              AI-Powered Career Growth Platform 🧬
            </span>
          </div>
          <br />

          {/* Logo */}
          <div className="relative inline-block mb-6 hero-pop hero-d2">
            {/* This is the LCP element. Explicit dimensions let the browser
                reserve the box before the bytes land (no layout shift), and
                fetchPriority pulls it ahead of the deferred third-party scripts
                that were previously winning the race for bandwidth. */}
            <img
              src="/logos/logo-light.png"
              alt="matriXO"
              width={1200}
              height={276}
              fetchPriority="high"
              decoding="async"
              className="h-14 md:h-32 lg:h-20 w-auto mx-auto block dark:hidden"
            />
            <img
              src="/logos/logo-dark.png"
              alt="matriXO"
              width={1200}
              height={278}
              fetchPriority="high"
              decoding="async"
              className="h-14 md:h-32 lg:h-20 w-auto mx-auto transform hidden dark:block"
            />
          </div>

          {/* Headline — an <h1>, not a <p>: the page had no h1 at all and jumped
              straight to <h2>, which fails both the SEO and heading-order audits.
              Classes are unchanged, so this renders exactly as before. */}
          <h1 className="text-xl md:text-3xl lg:text-4xl font-light text-slate-700 dark:text-gray-300 mb-4 max-w-4xl mx-auto hero-fade hero-d3">
            <HeadingHighlight text="Where AI Meets Your Career Journey" />
          </h1>

          {/* Bold tagline */}
          <p className="text-2xl md:text-3xl font-display font-bold text-slate-800 dark:text-white mb-12 hero-fade hero-d4">
            <HeadingHighlight text="Map Your Skills. Grow Smarter. Prove Your Worth." />
          </p>

          {/* Description */}
          <p className="text-lg md:text-xl text-slate-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto hero-fade hero-d5">
            AI-driven skill analysis, personalized learning paths, blockchain-verified credentials,
            and AI-matched mentorship — everything you need to become industry-ready, in one platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center hero-rise hero-d6">
            <Link href="/events">
              <motion.button
                onMouseEnter={handleCtaMouseEnter}
                whileTap={{ scale: 0.98 }}
                className="hero-cta"
              >
                <FaRocket />
                <span>Explore Events</span>
              </motion.button>
            </Link>

            <motion.button
              type="button"
              onClick={() => {
                document.getElementById('feature-card')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                })
              }}
              onMouseEnter={handleCtaMouseEnter}
              whileTap={{ scale: 0.98 }}
              className="hero-cta"
            >
              <FaRocket />
              <span>Explore Features</span>
            </motion.button>

            <Link href="/contact">
              <motion.button
                onMouseEnter={handleCtaMouseEnter}
                whileTap={{ scale: 0.98 }}
                className="hero-cta"
              >
                <FaUniversity />
                <span>For Colleges</span>
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-gray-300/60 dark:border-white/[0.12] rounded-full flex justify-center backdrop-blur-sm"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
