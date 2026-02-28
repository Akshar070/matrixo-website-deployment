'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  FaUniversity, FaGraduationCap, FaCodeBranch, FaEnvelope,
  FaPhone, FaIdCard, FaLinkedin, FaGithub, FaGlobe, FaLock, FaArrowLeft,
  FaDna, FaBrain, FaRocket, FaBullseye, FaFire, FaTrophy,
  FaStar, FaArrowUp, FaBriefcase, FaLightbulb, FaChartLine,
  FaCheckCircle, FaClock, FaSignal, FaBook, FaCode,
  FaExclamationTriangle, FaExclamationCircle, FaInfoCircle,
  FaHistory, FaMapSigns, FaUserGraduate, FaAward, FaLanguage
} from 'react-icons/fa'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebaseConfig'
import { UserProfile, PrivacySettings, DEFAULT_PRIVACY } from '@/lib/ProfileContext'
import { SkillDNAProfile, SkillDNAUserDocument, OnboardingData, CareerGoal } from '@/lib/skilldna/types'
import { getScoreGrade, getScoreColor, getScoreGradient } from '@/lib/skilldna/scoring'
import ProfileDownload from '@/components/skilldna/ProfileDownload'
import Link from 'next/link'
import Image from 'next/image'

// ============================================================
// Full LinkedIn-Style Public Profile Page
// Shows user info + SkillDNA genome + achievements + goals
// ============================================================

interface FullProfileData {
  userProfile: UserProfile
  skillDNAProfile: SkillDNAProfile | null
  onboardingData: OnboardingData | null
  careerGoals: CareerGoal | null
}

export default function PublicProfilePage() {
  const params = useParams()
  const username = params.username as string
  const profileRef = useRef<HTMLDivElement>(null)

  const [data, setData] = useState<FullProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Step 1: Look up username -> uid
        const usernameRef = doc(db, 'Usernames', username.toLowerCase())
        const usernameSnap = await getDoc(usernameRef)

        if (!usernameSnap.exists()) {
          setNotFound(true)
          setLoading(false)
          return
        }

        const uid = usernameSnap.data().uid

        // Step 2: Fetch UserProfile
        const profileDocRef = doc(db, 'UserProfiles', uid)
        const profileSnap = await getDoc(profileDocRef)

        if (!profileSnap.exists()) {
          setNotFound(true)
          setLoading(false)
          return
        }

        const userProfile = profileSnap.data() as UserProfile

        if (userProfile.privacy?.profileVisibility === 'private') {
          setNotFound(true)
          setLoading(false)
          return
        }

        // Step 3: Fetch SkillDNA data (if privacy allows)
        let skillDNAProfile: SkillDNAProfile | null = null
        let onboardingData: OnboardingData | null = null
        let careerGoals: CareerGoal | null = null
        const showSkillDNA = userProfile.privacy?.showSkillDNA !== false

        if (showSkillDNA) {
          try {
            const skillDNARef = doc(db, 'skillDNA_users', uid)
            const skillDNASnap = await getDoc(skillDNARef)
            if (skillDNASnap.exists()) {
              const skillDNAData = skillDNASnap.data() as SkillDNAUserDocument
              skillDNAProfile = skillDNAData.skillDNA || null
              onboardingData = skillDNAData.onboardingData || null
              careerGoals = skillDNAData.profile?.goals || null
            }
          } catch {
            // SkillDNA data not available, continue without it
          }
        }

        setData({ userProfile, skillDNAProfile, onboardingData, careerGoals })
      } catch (error) {
        console.error('Error fetching profile:', error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    if (username) fetchProfile()
  }, [username])

  // --- Loading ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-blue-950/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-gray-700 border-t-purple-400 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading profile...</p>
        </div>
      </div>
    )
  }

  // --- Not Found ---
  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-blue-950/20 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-white/[0.04] border border-white/[0.08]">
            <FaLock className="text-gray-400 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
          <p className="text-gray-500 mb-6">This profile doesn&apos;t exist or is set to private.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-purple-500/20 transition-all">
            <FaArrowLeft className="text-sm" /> Go Home
          </Link>
        </motion.div>
      </div>
    )
  }

  const { userProfile, skillDNAProfile, onboardingData, careerGoals } = data
  const privacy: PrivacySettings = userProfile.privacy || DEFAULT_PRIVACY
  const hasSkillDNA = skillDNAProfile !== null

  // Compute stats
  const skillCount = skillDNAProfile?.technicalSkills?.length || 0
  const clusterCount = skillDNAProfile?.skillClusters?.length || 0
  const languagesKnown = skillDNAProfile?.technicalSkills
    ?.filter(s => s.category?.toLowerCase().includes('language') || s.category?.toLowerCase().includes('programming'))
    ?.map(s => s.name) || []
  const achievements = onboardingData?.academic?.achievements || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/10 to-blue-950/10">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 -left-48 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <div className="relative z-20 px-4 pt-6 max-w-5xl mx-auto print:hidden">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
            <FaArrowLeft className="text-sm" />
            <span>Home</span>
          </Link>
          <ProfileDownload targetRef={profileRef} userName={userProfile.username} />
        </div>
      </div>

      {/* MAIN PROFILE CONTENT */}
      <div ref={profileRef} className="relative z-10 max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* ═══════════════════════════════════════════════════════ */}
        {/* SECTION 1: PROFILE HEADER + HERO                       */}
        {/* ═══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl overflow-hidden bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-2xl"
        >
          {/* Cover gradient */}
          <div className="h-32 sm:h-40 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-30" />
            {hasSkillDNA && (
              <div className="absolute bottom-3 right-4 flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full">
                <FaDna className="text-white/80 text-xs animate-pulse" />
                <span className="text-white/80 text-xs font-medium">SkillDNA™ Verified</span>
              </div>
            )}
          </div>

          {/* Profile info */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8 -mt-16 sm:-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-4 border-gray-950 bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex-shrink-0">
                {userProfile.profilePhoto ? (
                  <Image src={userProfile.profilePhoto} alt={userProfile.fullName} width={144} height={144} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl sm:text-5xl font-bold text-gray-400">
                    {userProfile.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>

              {/* Name + Bio */}
              <div className="flex-1 min-w-0 pb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">{userProfile.fullName}</h1>
                <p className="text-gray-500 text-sm mt-0.5">@{userProfile.username}</p>
                {userProfile.bio && (
                  <p className="text-gray-400 text-sm mt-2 max-w-xl">{userProfile.bio}</p>
                )}

                {/* Quick chips */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {privacy.showCollege && userProfile.college && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-white/[0.06] border border-white/[0.08] text-gray-300">
                      <FaUniversity className="text-blue-400 text-[10px]" /> {userProfile.college}
                    </span>
                  )}
                  {privacy.showBranch && userProfile.branch && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-white/[0.06] border border-white/[0.08] text-gray-300">
                      <FaCodeBranch className="text-purple-400 text-[10px]" /> {userProfile.branch}
                    </span>
                  )}
                  {privacy.showYear && userProfile.year && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-white/[0.06] border border-white/[0.08] text-gray-300">
                      <FaGraduationCap className="text-green-400 text-[10px]" /> {userProfile.year}
                    </span>
                  )}
                  {privacy.showRollNumber && userProfile.rollNumber && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-white/[0.06] border border-white/[0.08] text-gray-300">
                      <FaIdCard className="text-amber-400 text-[10px]" /> {userProfile.rollNumber}
                    </span>
                  )}
                </div>
              </div>

              {/* Social links */}
              {(userProfile.linkedin || userProfile.github || userProfile.portfolio) && (
                <div className="flex items-center gap-2 sm:pb-1">
                  {userProfile.linkedin && (
                    <a href={userProfile.linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/[0.06] rounded-xl hover:bg-white/[0.12] transition-colors">
                      <FaLinkedin className="text-blue-400" />
                    </a>
                  )}
                  {userProfile.github && (
                    <a href={userProfile.github} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/[0.06] rounded-xl hover:bg-white/[0.12] transition-colors">
                      <FaGithub className="text-gray-400" />
                    </a>
                  )}
                  {userProfile.portfolio && (
                    <a href={userProfile.portfolio} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/[0.06] rounded-xl hover:bg-white/[0.12] transition-colors">
                      <FaGlobe className="text-green-400" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Contact info row */}
            {(privacy.showEmail || privacy.showPhone) && (
              <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-white/[0.06]">
                {privacy.showEmail && userProfile.email && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-400">
                    <FaEnvelope className="text-gray-500 text-xs" /> {userProfile.email}
                  </span>
                )}
                {privacy.showPhone && userProfile.phone && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-400">
                    <FaPhone className="text-gray-500 text-xs" /> +91 {userProfile.phone}
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* SECTION 2: SKILL DNA STAT CARDS                        */}
        {/* ═══════════════════════════════════════════════════════ */}
        {hasSkillDNA && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: 'Dynamic Score', value: skillDNAProfile!.dynamicSkillScore, suffix: '/1000', icon: FaTrophy, color: 'from-yellow-500 to-amber-500' },
              { label: 'Skills Tracked', value: skillCount, suffix: '', icon: FaCode, color: 'from-purple-500 to-fuchsia-500' },
              { label: 'Skill Clusters', value: clusterCount, suffix: '', icon: FaFire, color: 'from-orange-500 to-red-500' },
              { label: 'Career Alignment', value: `${skillDNAProfile!.careerAlignmentScore}%`, suffix: '', icon: FaBullseye, color: 'from-green-500 to-emerald-500' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-5 text-center"
              >
                <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3`}>
                  <s.icon />
                </div>
                <p className="text-2xl font-bold text-white">
                  {s.value}<span className="text-xs text-gray-500 font-normal">{s.suffix}</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Two-column layout for main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ═══════════ LEFT COLUMN (2/3) ═══════════ */}
          <div className="lg:col-span-2 space-y-6">

            {/* ═══════════════════════════════════════════════════════ */}
            {/* SECTION 3: ABOUT / EXPERIENCE                          */}
            {/* ═══════════════════════════════════════════════════════ */}
            {onboardingData?.pastExperience && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6"
              >
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <FaHistory className="text-blue-400" /> Past Experience
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">{onboardingData.pastExperience}</p>
              </motion.div>
            )}

            {/* CURRENT LEARNING */}
            {(onboardingData?.currentSituation || (skillDNAProfile?.learningPaths && skillDNAProfile.learningPaths.length > 0)) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6"
              >
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <FaRocket className="text-cyan-400" /> Currently Learning
                </h2>
                {onboardingData?.currentSituation && (
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{onboardingData.currentSituation}</p>
                )}
                {/* Rising skills */}
                {skillDNAProfile?.technicalSkills?.filter(s => s.trend === 'rising').length! > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Skills on the Rise</p>
                    <div className="flex flex-wrap gap-2">
                      {skillDNAProfile!.technicalSkills.filter(s => s.trend === 'rising').map(s => (
                        <span key={s.name} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
                          <FaArrowUp className="text-[10px]" /> {s.name} ({s.score}%)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* FUTURE GOALS */}
            {(careerGoals || onboardingData?.futureAspiration) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6"
              >
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FaMapSigns className="text-indigo-400" /> Future Goals
                </h2>
                {onboardingData?.futureAspiration && (
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{onboardingData.futureAspiration}</p>
                )}
                {careerGoals && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {careerGoals.shortTerm && (
                      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                        <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold mb-1">Short-Term</p>
                        <p className="text-gray-300 text-sm">{careerGoals.shortTerm}</p>
                      </div>
                    )}
                    {careerGoals.midTerm && (
                      <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                        <p className="text-[10px] text-purple-400 uppercase tracking-wider font-semibold mb-1">Mid-Term</p>
                        <p className="text-gray-300 text-sm">{careerGoals.midTerm}</p>
                      </div>
                    )}
                    {careerGoals.longTerm && (
                      <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                        <p className="text-[10px] text-green-400 uppercase tracking-wider font-semibold mb-1">Long-Term</p>
                        <p className="text-gray-300 text-sm">{careerGoals.longTerm}</p>
                      </div>
                    )}
                  </div>
                )}
                {careerGoals?.dreamRole && (
                  <div className="mt-4 flex items-center gap-2">
                    <FaStar className="text-yellow-400 text-sm" />
                    <span className="text-sm text-gray-400">Dream Role:</span>
                    <span className="text-sm text-white font-medium">{careerGoals.dreamRole}</span>
                  </div>
                )}
                {careerGoals?.targetIndustries && careerGoals.targetIndustries.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {careerGoals.targetIndustries.map(ind => (
                      <span key={ind} className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {ind}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* TECHNICAL SKILLS BREAKDOWN */}
            {hasSkillDNA && skillDNAProfile!.technicalSkills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6"
              >
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FaCode className="text-purple-400" /> Technical Skills
                </h2>
                <div className="space-y-3">
                  {skillDNAProfile!.technicalSkills.map((skill, i) => (
                    <div key={skill.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{skill.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.06] text-gray-500">{skill.category}</span>
                          {skill.trend === 'rising' && <span className="text-green-400 text-xs">↑</span>}
                          {skill.trend === 'declining' && <span className="text-red-400 text-xs">↓</span>}
                        </div>
                        <span className={`text-sm font-bold ${getScoreColor(skill.score)}`}>{skill.score}%</span>
                      </div>
                      <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${getScoreGradient(skill.score)} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.score}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + i * 0.04 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* BEHAVIORAL TRAITS */}
            {hasSkillDNA && skillDNAProfile!.behavioralTraits.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6"
              >
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FaLightbulb className="text-amber-400" /> Behavioral Profile
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {skillDNAProfile!.behavioralTraits.map((trait, i) => (
                    <div key={trait.name} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-300">{trait.name}</span>
                          <span className={`text-sm font-bold ${getScoreColor(trait.score)}`}>{trait.score}%</span>
                        </div>
                        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${getScoreGradient(trait.score)} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${trait.score}%` }}
                            transition={{ duration: 0.8, delay: 0.45 + i * 0.05 }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-600 mt-0.5">{trait.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* AI RECOMMENDATIONS */}
            {hasSkillDNA && (skillDNAProfile!.skillGaps.length > 0 || skillDNAProfile!.learningPaths.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 backdrop-blur-sm border border-purple-500/10 rounded-2xl p-6"
              >
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FaBrain className="text-purple-400" /> AI Recommendations
                </h2>

                {/* Skill Gaps */}
                {skillDNAProfile!.skillGaps.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Priority Skill Gaps</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {skillDNAProfile!.skillGaps.slice(0, 4).map(gap => {
                        const priorityColor = gap.priority === 'high' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                          gap.priority === 'medium' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                            'text-blue-400 bg-blue-500/10 border-blue-500/20'
                        return (
                          <div key={gap.skill} className={`p-3 rounded-xl border ${priorityColor.split(' ').slice(1).join(' ')}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-white">{gap.skill}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${priorityColor}`}>
                                {gap.priority.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              Current: {gap.currentLevel}% → Required: {gap.requiredLevel}%
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Learning Paths */}
                {skillDNAProfile!.learningPaths.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Recommended Learning Paths</p>
                    <div className="space-y-3">
                      {skillDNAProfile!.learningPaths.slice(0, 3).map(path => (
                        <div key={path.title} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-bold text-white">{path.title}</h4>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-gray-400">
                                <FaClock className="inline mr-0.5" /> {path.estimatedDuration}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">
                                <FaSignal className="inline mr-0.5" /> {path.difficulty}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{path.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {path.relatedSkills.map(s => (
                              <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-gray-400">{s}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* ═══════════ RIGHT COLUMN (1/3) ═══════════ */}
          <div className="space-y-6">

            {/* AI PERSONA CARD */}
            {hasSkillDNA && skillDNAProfile!.persona && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-500/10 via-white/[0.03] to-blue-500/10 backdrop-blur-sm border border-purple-500/15 rounded-2xl p-6"
              >
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <FaBrain className="text-purple-400" /> AI Persona
                </h3>
                <h4 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  {skillDNAProfile!.persona.headline}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">{skillDNAProfile!.persona.description}</p>

                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Personality Type</p>
                    <p className="text-sm text-white font-medium">{skillDNAProfile!.persona.personalityType}</p>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Strengths</p>
                    <div className="space-y-1">
                      {skillDNAProfile!.persona.strengths.map(s => (
                        <p key={s} className="text-xs text-gray-300 flex items-center gap-1.5">
                          <span className="text-green-400">+</span> {s}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Growth Areas</p>
                    <div className="space-y-1">
                      {skillDNAProfile!.persona.areasForGrowth.map(a => (
                        <p key={a} className="text-xs text-gray-300 flex items-center gap-1.5">
                          <span className="text-amber-400">↗</span> {a}
                        </p>
                      ))}
                    </div>
                  </div>

                  {skillDNAProfile!.persona.careerFit.length > 0 && (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Career Fit</p>
                      <div className="flex flex-wrap gap-1">
                        {skillDNAProfile!.persona.careerFit.map(fit => (
                          <span key={fit} className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            {fit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ACHIEVEMENTS */}
            {achievements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6"
              >
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <FaAward className="text-yellow-400" /> Achievements
                </h3>
                <div className="space-y-2">
                  {achievements.map((ach, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                      <FaCheckCircle className="text-yellow-400 text-[10px] mt-0.5 flex-shrink-0" />
                      <span>{ach}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* EDUCATION */}
            {onboardingData?.academic && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6"
              >
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <FaUserGraduate className="text-blue-400" /> Education
                </h3>
                <div className="space-y-1">
                  {onboardingData.academic.degree && (
                    <p className="text-sm text-white font-medium">{onboardingData.academic.degree}</p>
                  )}
                  {onboardingData.academic.field && (
                    <p className="text-xs text-gray-400">{onboardingData.academic.field}</p>
                  )}
                  {onboardingData.academic.institution && (
                    <p className="text-xs text-gray-500">{onboardingData.academic.institution}</p>
                  )}
                  {onboardingData.academic.year && (
                    <p className="text-xs text-gray-500">Class of {onboardingData.academic.year}</p>
                  )}
                  {onboardingData.academic.gpa && (
                    <p className="text-xs text-gray-500">GPA: {onboardingData.academic.gpa}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* LANGUAGES / INTERESTS */}
            {(languagesKnown.length > 0 || (onboardingData?.interests && onboardingData.interests.length > 0)) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6"
              >
                {languagesKnown.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <FaLanguage className="text-cyan-400" /> Languages & Tools
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {languagesKnown.map(l => (
                        <span key={l} className="text-xs px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {onboardingData?.interests && onboardingData.interests.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <FaStar className="text-pink-400" /> Interests
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {onboardingData.interests.map(int => (
                        <span key={int} className="text-xs px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-300 border border-pink-500/20">
                          {int}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* SKILL CLUSTERS */}
            {hasSkillDNA && skillDNAProfile!.skillClusters.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6"
              >
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <FaChartLine className="text-green-400" /> Skill Clusters
                </h3>
                <div className="space-y-3">
                  {skillDNAProfile!.skillClusters.map(cluster => (
                    <div key={cluster.name} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{cluster.name}</span>
                        <span className={`text-xs font-bold ${getScoreColor(cluster.strength)}`}>{cluster.strength}%</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mb-2">{cluster.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {cluster.skills.map(s => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300">{s}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* SCORE GAUGES */}
            {hasSkillDNA && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6"
              >
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <FaTrophy className="text-yellow-400" /> Score Summary
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Cognitive Score', value: skillDNAProfile!.cognitiveScore, icon: FaBrain, color: 'from-purple-500 to-fuchsia-500' },
                    { label: 'Learning Velocity', value: skillDNAProfile!.learningVelocity, icon: FaRocket, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Career Alignment', value: skillDNAProfile!.careerAlignmentScore, icon: FaBullseye, color: 'from-green-500 to-emerald-500' },
                  ].map(score => (
                    <div key={score.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1.5">
                          <score.icon className="text-[10px]" /> {score.label}
                        </span>
                        <span className="text-xs font-bold text-white">{score.value}/100</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${score.color} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${score.value}%` }}
                          transition={{ duration: 0.8, delay: 0.5 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* FOOTER BRANDING                                        */}
        {/* ═══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-6 border-t border-white/[0.06]"
        >
          <p className="text-xs text-gray-600">
            Profile powered by <span className="font-semibold text-gray-400">matriXO</span> · <span className="font-semibold text-purple-400">SkillDNA™</span>
          </p>
          {hasSkillDNA && (
            <p className="text-[10px] text-gray-700 mt-1">
              Last analyzed: {new Date(skillDNAProfile!.lastUpdated).toLocaleDateString()} · v{skillDNAProfile!.version} · Score: {skillDNAProfile!.dynamicSkillScore}/1000 ({getScoreGrade(skillDNAProfile!.dynamicSkillScore, 1000)})
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
