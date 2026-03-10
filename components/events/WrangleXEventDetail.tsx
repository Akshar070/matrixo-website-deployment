'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { format } from 'date-fns'
import {
  FaCalendar,
  FaMapMarkerAlt,
  FaClock,
  FaExternalLinkAlt,
  FaChevronDown,
  FaTag
} from 'react-icons/fa'

export default function WrangleXEventDetail({ event }: { event: any }) {
  const eventsSectionRef = useRef<HTMLDivElement>(null)

  const scrollToEvents = () => {
    eventsSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  const subEvents = event.subEvents || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1c] via-[#0d1529] to-[#0a0f1c]">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1c] via-[#0d1830] to-[#0a0f1c]" />

          {/* Animated grid */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.12) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(168, 85, 247, 0.12) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }} />
          </div>

          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-purple-400 rounded-full animate-float opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 20}s`,
              }}
            />
          ))}

          {/* Glow orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left - Poster */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="w-full lg:w-1/2 max-w-lg"
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">
                <Image
                  src={event.images.banner}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>

            {/* Right - Info */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="w-full lg:w-1/2 text-center lg:text-left"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
                <span className="text-purple-400 text-sm font-medium">INFOQUEST 2026</span>
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight">
                <span className="bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                  {event.title}
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-purple-300/80 font-light mb-8">
                {event.tagline}
              </p>

              {/* Event Meta */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                  <FaCalendar className="text-purple-400" />
                  <span className="text-white text-sm">{format(new Date(event.date), 'MMM dd')} – {format(new Date(event.endDate), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                  <FaMapMarkerAlt className="text-purple-400" />
                  <span className="text-white text-sm">{event.location}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                  <FaClock className="text-purple-400" />
                  <span className="text-white text-sm">3 Events</span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <motion.button
                  onClick={scrollToEvents}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full font-bold text-lg text-white
                           shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Explore Events
                    <FaChevronDown className="group-hover:translate-y-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>

                <motion.a
                  href={event.externalRegistrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-purple-500/50 rounded-full font-semibold text-purple-400
                           hover:bg-purple-500/10 hover:border-purple-400 transition-all duration-300 flex items-center gap-2"
                >
                  Register Now
                  <FaExternalLinkAlt className="text-sm" />
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-purple-400/50 animate-bounce"
        >
          <FaChevronDown className="text-2xl" />
        </motion.div>
      </section>

      {/* ABOUT SECTION */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              About WRANGLEX
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* SUB-EVENTS SECTION */}
      <section ref={eventsSectionRef} className="py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Events Under WRANGLEX
            </h2>
            <p className="text-gray-400 text-lg">Choose your event and register</p>
          </motion.div>

          <div className="space-y-12">
            {subEvents.map((subEvent: any, index: number) => (
              <motion.div
                key={subEvent.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl overflow-hidden
                         hover:border-purple-500/30 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Event Poster */}
                  <div className="relative w-full lg:w-2/5 h-64 lg:h-auto min-h-[280px]">
                    <Image
                      src={subEvent.image}
                      alt={subEvent.title}
                      fill
                      className="object-cover"
                    />
                    {/* Category badge */}
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {subEvent.category.toUpperCase()}
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                        {subEvent.title}
                      </h3>
                      <p className="text-purple-400/80 text-base mb-4">{subEvent.tagline}</p>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                        <FaCalendar className="text-purple-400" />
                        <span>{format(new Date(subEvent.date), 'MMMM dd, yyyy • hh:mm a')}</span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line mb-6 line-clamp-6">
                        {subEvent.description}
                      </p>

                      {/* Pricing */}
                      <div className="flex flex-wrap gap-3 mb-6">
                        {subEvent.tickets.map((ticket: any, i: number) => (
                          <div key={i} className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2">
                            <span className="text-gray-400 text-xs block">{ticket.name}</span>
                            <span className="text-white font-bold text-lg">₹{ticket.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Register Button */}
                    <motion.a
                      href={subEvent.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600
                               text-white font-bold rounded-full shadow-lg shadow-purple-500/20
                               hover:shadow-purple-500/40 transition-all duration-300 w-full sm:w-auto text-center"
                    >
                      Register Now
                      <FaExternalLinkAlt className="text-xs" />
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS SECTION */}
      {event.highlights && event.highlights.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Why WRANGLEX?
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {event.highlights.map((highlight: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4"
                  >
                    <span className="text-purple-400 mt-0.5">✓</span>
                    <span className="text-gray-300">{highlight}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* VENUE & INFO */}
      <section className="py-16 md:py-24 border-t border-white/[0.06]">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Venue */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-purple-400" />
                Venue
              </h3>
              <p className="text-gray-300 font-semibold mb-1">{event.venue}</p>
              <p className="text-gray-400">{event.location}</p>
            </motion.div>

            {/* Organizer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Organized By</h3>
              <p className="text-gray-300">{event.organizer}</p>
            </motion.div>
          </div>

          {/* Tags */}
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <FaTag className="text-gray-500" />
            {event.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-white/[0.05] text-gray-400 text-xs rounded-full border border-white/[0.06]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Participate?</h2>
            <p className="text-gray-400 mb-8 text-lg">Register now for WRANGLEX events</p>
            <motion.a
              href={event.externalRegistrationLink}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full
                       font-bold text-lg text-white shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300"
            >
              Register for WRANGLEX
              <FaExternalLinkAlt />
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
