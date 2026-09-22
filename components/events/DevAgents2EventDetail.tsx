"use client";

import { motion } from "framer-motion";
import { FaCalendar, FaMapMarkerAlt, FaUsers, FaTrophy, FaChevronRight } from "react-icons/fa";
import { toast } from "sonner";
import { HiSparkles } from "react-icons/hi";
import Image from "next/image";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function DevAgents2EventDetail({ event }: { event: any }) {
  const handleRegisterClick = () => {
    toast.info("Registration will open soon.", {
      description: "Stay tuned for more details on DevAgentic 2.0 registrations.",
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[150px]" />
      </div>

      <div className="relative z-10">
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
            >
              <HiSparkles className="text-indigo-400" />
              <span className="text-sm font-medium tracking-wide text-indigo-300 uppercase">
                Hackathon
              </span>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
                DEVAGENTIC 2.0
              </span>
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-300 font-light mb-8 max-w-2xl mx-auto"
            >
              24 Hours AI Agents Hackathon
            </motion.p>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="text-base md:text-lg text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              A 24-hour hackathon focused on building innovative AI agents and
              autonomous AI-powered solutions.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={handleRegisterClick}
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
              >
                <span className="relative z-10">Register Now</span>
                <FaChevronRight className="relative z-10 text-xs transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* ABOUT & EXPECTATIONS SECTION */}
        <section className="py-20 px-4 sm:px-6 relative border-t border-white/5 bg-white/[0.02]">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold mb-6 text-white">About the Hackathon</h2>
              <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed">
                <p>
                  DevAgentic 2.0 is an upcoming 24-hour AI Agents hackathon by Matrixo.
                </p>
                <p className="mt-4">
                  Participants will have the opportunity to explore modern AI agent
                  technologies and build practical autonomous AI solutions.
                </p>
                <p className="mt-4 text-indigo-300 font-medium">
                  More details about the event will be announced soon.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold mb-6 text-white">What to Expect</h2>
              <ul className="space-y-4">
                {[
                  "24-hour AI development challenge",
                  "AI Agents and autonomous systems",
                  "Hands-on building",
                  "Team collaboration",
                  "Innovation-focused problem solving",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-400">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-gray-500 italic">
                * Planned focus areas. Final rules and tracks will be announced soon.
              </p>
            </motion.div>
          </div>
        </section>

        {/* EVENT DETAILS / COMING SOON GRID */}
        <section className="py-20 px-4 sm:px-6 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Event Details</h2>
              <p className="text-gray-400">Mark your calendars. Full details dropping soon.</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: FaCalendar, label: "Date", value: "Coming Soon" },
                { icon: FaMapMarkerAlt, label: "Venue", value: "Coming Soon" },
                { icon: FaUsers, label: "Team Size", value: "Coming Soon" },
                { icon: FaTrophy, label: "Prizes", value: "Coming Soon" },
              ].map((detail, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { delay: index * 0.1 } },
                  }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center backdrop-blur-sm hover:bg-white/[0.07] transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-400 text-xl">
                    <detail.icon />
                  </div>
                  <h3 className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">{detail.label}</h3>
                  <p className="text-white font-semibold text-lg">{detail.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-24 px-4 sm:px-6 relative border-t border-white/5 bg-gradient-to-b from-transparent to-indigo-950/20">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to build?
              </h2>
              <p className="text-xl text-gray-400 mb-10">
                More information and registrations will be announced soon.
              </p>
              <button
                onClick={handleRegisterClick}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] active:scale-95"
              >
                Register Now
              </button>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
