// ============================================================
// SkillDNA™ Profile Edit Section
// User can add/remove skills, edit academic/interests/career,
// and regenerate AI persona
// ============================================================

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaPlus, FaTimes, FaSpinner, FaTrash, FaInfoCircle, FaGraduationCap, FaHeart, FaBullseye, FaSyncAlt } from 'react-icons/fa';
import { SkillDNAProfile, SkillLevel, AcademicBackground, CareerGoal } from '@/lib/skilldna/types';

interface ProfileEditSectionProps {
  profile: SkillDNAProfile;
  onSave?: () => void;
  onAddSkill?: (skill: { name: string; level: SkillLevel; category: string }) => Promise<void>;
  onRemoveSkill?: (skillName: string) => Promise<void>;
  onUpdateAcademic?: (academic: AcademicBackground) => Promise<void>;
  onUpdateInterests?: (interests: string[]) => Promise<void>;
  onUpdateCareerGoal?: (goal: CareerGoal) => Promise<void>;
  onRegeneratePersona?: () => Promise<void>;
  currentAcademic?: AcademicBackground;
  currentInterests?: string[];
  currentCareerGoal?: CareerGoal;
}

const SKILL_CATEGORIES = [
  'Programming',
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning / AI',
  'DevOps',
  'Cloud Computing',
  'Cybersecurity',
  'Database',
  'UI / UX Design',
  'Networking',
  'Business / Management',
  'Communication',
  'Other',
]

const LEVEL_INFO: Record<SkillLevel, { label: string; color: string; description: string }> = {
  beginner:     { label: 'Beginner',     color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',     description: 'Just started learning' },
  intermediate: { label: 'Intermediate', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', description: 'Can work independently' },
  advanced:     { label: 'Advanced',     color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', description: 'Deep proficiency' },
  expert:       { label: 'Expert',       color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', description: 'Industry-level mastery' },
}

const INTEREST_SUGGESTIONS = [
  'Artificial Intelligence', 'Web Development', 'Mobile Apps', 'Cloud Computing', 'Cybersecurity',
  'Data Science', 'Machine Learning', 'Blockchain', 'IoT', 'Game Development',
  'DevOps', 'UI/UX Design', 'Competitive Programming', 'Open Source', 'Robotics',
];

const MAX_INTERESTS = 10;

export default function ProfileEditSection({
  profile, onSave, onAddSkill, onRemoveSkill,
  onUpdateAcademic, onUpdateInterests, onUpdateCareerGoal, onRegeneratePersona,
  currentAcademic, currentInterests, currentCareerGoal,
}: ProfileEditSectionProps) {
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('intermediate');
  const [newSkillCategory, setNewSkillCategory] = useState('Programming');
  const [isSaving, setIsSaving] = useState(false);
  const [removingSkill, setRemovingSkill] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Academic editing state
  const [editingAcademic, setEditingAcademic] = useState(false);
  const [academic, setAcademic] = useState<AcademicBackground>(currentAcademic || { degree: '', field: '', institution: '', year: '' });
  const [savingAcademic, setSavingAcademic] = useState(false);

  // Interests editing state
  const [editingInterests, setEditingInterests] = useState(false);
  const [interests, setInterests] = useState<string[]>(currentInterests || []);
  const [newInterest, setNewInterest] = useState('');
  const [savingInterests, setSavingInterests] = useState(false);

  // Career goal editing state
  const [editingCareer, setEditingCareer] = useState(false);
  const [careerGoal, setCareerGoal] = useState<CareerGoal>(currentCareerGoal || { shortTerm: '', midTerm: '', longTerm: '', dreamRole: '', targetIndustries: [] });
  const [savingCareer, setSavingCareer] = useState(false);

  // Regenerate state
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) return;
    if (!onAddSkill) {
      setMessage({ type: 'error', text: 'Skill saving is not configured yet. Please reload the page.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      await onAddSkill({ name: newSkillName.trim(), level: newSkillLevel, category: newSkillCategory });
      setMessage({ type: 'success', text: `"${newSkillName.trim()}" added! Your SkillDNA profile has been updated.` });
      setNewSkillName('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to add skill. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSkill = async (skillName: string) => {
    if (!onRemoveSkill) return;
    setRemovingSkill(skillName);
    try {
      await onRemoveSkill(skillName);
    } catch (error: any) {
      setMessage({ type: 'error', text: `Failed to remove "${skillName}": ${error.message}` });
    } finally {
      setRemovingSkill(null);
    }
  };

  const handleSaveAcademic = async () => {
    if (!onUpdateAcademic) return;
    setSavingAcademic(true);
    try {
      await onUpdateAcademic(academic);
      setEditingAcademic(false);
      setMessage({ type: 'success', text: 'Academic background updated successfully.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update academic background.' });
    } finally {
      setSavingAcademic(false);
    }
  };

  const handleAddInterest = () => {
    const trimmed = newInterest.trim();
    if (!trimmed) return;
    if (interests.length >= MAX_INTERESTS) {
      setMessage({ type: 'error', text: `Maximum ${MAX_INTERESTS} interests allowed.` });
      return;
    }
    if (interests.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
      setMessage({ type: 'error', text: `"${trimmed}" is already in your interests.` });
      return;
    }
    setInterests([...interests, trimmed]);
    setNewInterest('');
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleSaveInterests = async () => {
    if (!onUpdateInterests) return;
    setSavingInterests(true);
    try {
      await onUpdateInterests(interests);
      setEditingInterests(false);
      setMessage({ type: 'success', text: 'Interests updated successfully.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update interests.' });
    } finally {
      setSavingInterests(false);
    }
  };

  const handleSaveCareer = async () => {
    if (!onUpdateCareerGoal) return;
    setSavingCareer(true);
    try {
      await onUpdateCareerGoal(careerGoal);
      setEditingCareer(false);
      setMessage({ type: 'success', text: 'Career goals updated successfully.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update career goals.' });
    } finally {
      setSavingCareer(false);
    }
  };

  const handleRegenerate = async () => {
    if (!onRegeneratePersona) return;
    setIsRegenerating(true);
    try {
      await onRegeneratePersona();
      setMessage({ type: 'success', text: 'AI persona regenerated! Check the Overview tab for your new profile.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to regenerate persona.' });
    } finally {
      setIsRegenerating(false);
    }
  };

  const selectedLevelInfo = LEVEL_INFO[newSkillLevel];

  return (
    <div className="space-y-6">

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <FaInfoCircle className="text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-300">
          Manage your SkillDNA™ profile below. You can edit your academic background, interests, career goals,
          add or remove skills, and regenerate your AI persona summary.
        </p>
      </div>

      {/* Global Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-xl text-sm flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            {message.type === 'error' && <FaTimes className="flex-shrink-0" />}
            {message.text}
            <button onClick={() => setMessage(null)} className="ml-auto opacity-60 hover:opacity-100">
              <FaTimes size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Academic Background ===== */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaGraduationCap className="text-blue-400" />
            Academic Background
          </h3>
          {onUpdateAcademic && (
            <button
              onClick={() => { setEditingAcademic(!editingAcademic); setAcademic(currentAcademic || { degree: '', field: '', institution: '', year: '' }); }}
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <FaEdit size={12} /> {editingAcademic ? 'Cancel' : 'Edit'}
            </button>
          )}
        </div>

        {editingAcademic ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Degree</label>
                <select
                  value={academic.degree}
                  onChange={(e) => setAcademic({ ...academic, degree: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 transition-all"
                >
                  <option value="">Select degree</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="B.E.">B.E.</option>
                  <option value="B.Sc">B.Sc</option>
                  <option value="BCA">BCA</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="M.Sc">M.Sc</option>
                  <option value="MCA">MCA</option>
                  <option value="MBA">MBA</option>
                  <option value="PhD">PhD</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Self-taught">Self-taught</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Field of Study</label>
                <input
                  type="text"
                  value={academic.field}
                  onChange={(e) => setAcademic({ ...academic, field: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 transition-all"
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Institution</label>
                <input
                  type="text"
                  value={academic.institution}
                  onChange={(e) => setAcademic({ ...academic, institution: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 transition-all"
                  placeholder="College / University name"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Year</label>
                <select
                  value={academic.year}
                  onChange={(e) => setAcademic({ ...academic, year: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 transition-all"
                >
                  <option value="">Select year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Post-Graduate">Post-Graduate</option>
                  <option value="Working Professional">Working Professional</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleSaveAcademic}
              disabled={savingAcademic}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center gap-2 text-sm font-medium"
            >
              {savingAcademic ? <FaSpinner className="animate-spin" /> : null}
              {savingAcademic ? 'Saving...' : 'Save Academic Info'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">Degree:</span> <span className="text-gray-900 dark:text-white ml-1">{currentAcademic?.degree || '—'}</span></div>
            <div><span className="text-gray-500">Field:</span> <span className="text-gray-900 dark:text-white ml-1">{currentAcademic?.field || '—'}</span></div>
            <div><span className="text-gray-500">Institution:</span> <span className="text-gray-900 dark:text-white ml-1">{currentAcademic?.institution || '—'}</span></div>
            <div><span className="text-gray-500">Year:</span> <span className="text-gray-900 dark:text-white ml-1">{currentAcademic?.year || '—'}</span></div>
          </div>
        )}
      </div>

      {/* ===== Interests ===== */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaHeart className="text-pink-400" />
            Interests
            <span className="text-sm font-normal text-gray-500">({interests.length}/{MAX_INTERESTS})</span>
          </h3>
          {onUpdateInterests && (
            <button
              onClick={() => { setEditingInterests(!editingInterests); setInterests(currentInterests || []); }}
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <FaEdit size={12} /> {editingInterests ? 'Cancel' : 'Edit'}
            </button>
          )}
        </div>

        {editingInterests ? (
          <div className="space-y-3">
            {/* Current interests as removable tags */}
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <span key={interest} className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                  {interest}
                  <button onClick={() => handleRemoveInterest(interest)} className="ml-1 hover:text-red-500">
                    <FaTimes size={10} />
                  </button>
                </span>
              ))}
              {interests.length === 0 && <p className="text-gray-500 text-sm">No interests added yet.</p>}
            </div>

            {/* Add custom interest */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddInterest(); }}}
                className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 transition-all"
                placeholder="Add a custom interest..."
                disabled={interests.length >= MAX_INTERESTS}
              />
              <button
                onClick={handleAddInterest}
                disabled={interests.length >= MAX_INTERESTS || !newInterest.trim()}
                className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all"
              >
                <FaPlus />
              </button>
            </div>

            {/* Suggestions */}
            {interests.length < MAX_INTERESTS && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Quick add:</p>
                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_SUGGESTIONS.filter(s => !interests.some(i => i.toLowerCase() === s.toLowerCase())).slice(0, 8).map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => { if (interests.length < MAX_INTERESTS) setInterests([...interests, suggestion]); }}
                      className="text-xs px-2.5 py-1 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-purple-600 hover:text-white transition-all"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSaveInterests}
              disabled={savingInterests}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center gap-2 text-sm font-medium"
            >
              {savingInterests ? <FaSpinner className="animate-spin" /> : null}
              {savingInterests ? 'Saving...' : 'Save Interests'}
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(currentInterests || []).length > 0 ? (currentInterests || []).map((interest) => (
              <span key={interest} className="text-xs px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {interest}
              </span>
            )) : <p className="text-gray-500 text-sm">No interests set.</p>}
          </div>
        )}
      </div>

      {/* ===== Career Goals ===== */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaBullseye className="text-green-400" />
            Career Goals
          </h3>
          {onUpdateCareerGoal && (
            <button
              onClick={() => { setEditingCareer(!editingCareer); setCareerGoal(currentCareerGoal || { shortTerm: '', midTerm: '', longTerm: '', dreamRole: '', targetIndustries: [] }); }}
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <FaEdit size={12} /> {editingCareer ? 'Cancel' : 'Edit'}
            </button>
          )}
        </div>

        {editingCareer ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Dream Role</label>
              <input
                type="text"
                value={careerGoal.dreamRole}
                onChange={(e) => setCareerGoal({ ...careerGoal, dreamRole: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 transition-all"
                placeholder="e.g., Senior Software Engineer"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Short-term (1 year)</label>
                <textarea
                  value={careerGoal.shortTerm}
                  onChange={(e) => setCareerGoal({ ...careerGoal, shortTerm: e.target.value })}
                  rows={2}
                  className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 transition-all resize-none"
                  placeholder="What you'll achieve in the next year"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Mid-term (2-3 years)</label>
                <textarea
                  value={careerGoal.midTerm}
                  onChange={(e) => setCareerGoal({ ...careerGoal, midTerm: e.target.value })}
                  rows={2}
                  className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 transition-all resize-none"
                  placeholder="Where you want to be in 2-3 years"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Long-term (5+ years)</label>
                <textarea
                  value={careerGoal.longTerm}
                  onChange={(e) => setCareerGoal({ ...careerGoal, longTerm: e.target.value })}
                  rows={2}
                  className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 transition-all resize-none"
                  placeholder="Your ultimate career vision"
                />
              </div>
            </div>
            <button
              onClick={handleSaveCareer}
              disabled={savingCareer}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center gap-2 text-sm font-medium"
            >
              {savingCareer ? <FaSpinner className="animate-spin" /> : null}
              {savingCareer ? 'Saving...' : 'Save Career Goals'}
            </button>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div><span className="text-gray-500">Dream Role:</span> <span className="text-gray-900 dark:text-white ml-1">{currentCareerGoal?.dreamRole || '—'}</span></div>
            <div><span className="text-gray-500">Short-term:</span> <span className="text-gray-900 dark:text-white ml-1">{currentCareerGoal?.shortTerm || '—'}</span></div>
            <div><span className="text-gray-500">Mid-term:</span> <span className="text-gray-900 dark:text-white ml-1">{currentCareerGoal?.midTerm || '—'}</span></div>
            <div><span className="text-gray-500">Long-term:</span> <span className="text-gray-900 dark:text-white ml-1">{currentCareerGoal?.longTerm || '—'}</span></div>
          </div>
        )}
      </div>

      {/* ===== Regenerate AI Persona ===== */}
      {onRegeneratePersona && (
        <div className="bg-gradient-to-br from-purple-100/40 via-white to-blue-100/40 dark:from-purple-900/20 dark:via-gray-900 dark:to-blue-900/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <FaSyncAlt className="text-purple-400" />
            Regenerate AI Persona
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            After updating your academic details, interests, or career goals, regenerate your AI persona to reflect the latest changes.
            This will re-analyze your profile using the AI engine.
          </p>
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 transition-all flex items-center gap-2 font-medium"
          >
            {isRegenerating ? <FaSpinner className="animate-spin" /> : <FaSyncAlt />}
            {isRegenerating ? 'Regenerating...' : 'Regenerate Persona'}
          </button>
        </div>
      )}

      {/* ===== Add New Skill ===== */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <FaEdit className="text-blue-400" />
          Add a Skill You Learned
        </h3>
        <p className="text-sm text-gray-400 mb-5">
          Whether from YouTube, a bootcamp, a certification, or self-study — add it here.
        </p>

        <div className="space-y-3">
          {/* Skill name */}
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isSaving && newSkillName.trim() && handleAddSkill()}
            placeholder="e.g., Docker, Figma, TensorFlow, Excel..."
            className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Category</label>
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 transition-all"
              >
                {SKILL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Level */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Proficiency Level</label>
              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value as SkillLevel)}
                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 transition-all"
              >
                {(Object.keys(LEVEL_INFO) as SkillLevel[]).map((lvl) => (
                  <option key={lvl} value={lvl}>{LEVEL_INFO[lvl].label} — {LEVEL_INFO[lvl].description}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Level preview badge + Add button */}
          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1 rounded-full border ${selectedLevelInfo.color} font-medium`}>
              {selectedLevelInfo.label}
            </span>
            <span className="text-xs text-gray-500 flex-1">{selectedLevelInfo.description}</span>
            <button
              onClick={handleAddSkill}
              disabled={isSaving || !newSkillName.trim()}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
            >
              {isSaving ? <FaSpinner className="animate-spin" /> : <FaPlus />}
              {isSaving ? 'Saving...' : 'Add Skill'}
            </button>
          </div>
        </div>
      </div>

      {/* Current Skills List */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Your Skills
          <span className="ml-2 text-sm font-normal text-gray-500">({profile.technicalSkills.length} tracked)</span>
        </h3>
        {profile.technicalSkills.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">No skills added yet. Add your first skill above!</p>
        ) : (
          <div className="space-y-2">
            {profile.technicalSkills.map((skill) => (
              <div
                key={skill.name}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-700/50 group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-gray-900 dark:text-white font-medium text-sm truncate">{skill.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex-shrink-0">
                    {skill.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-20 h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-10 text-right">{skill.score}%</span>
                  {skill.trend === 'rising'   && <span className="text-green-400 text-xs">↑</span>}
                  {skill.trend === 'declining' && <span className="text-red-400 text-xs">↓</span>}
                  {skill.trend === 'stable'    && <span className="text-gray-500 text-xs">→</span>}
                  {onRemoveSkill && (
                    <button
                      onClick={() => handleRemoveSkill(skill.name)}
                      disabled={removingSkill === skill.name}
                      className="opacity-0 group-hover:opacity-100 ml-1 p-1 text-red-400 hover:text-red-300 transition-all disabled:opacity-50"
                      title={`Remove ${skill.name}`}
                    >
                      {removingSkill === skill.name ? <FaSpinner size={12} className="animate-spin" /> : <FaTrash size={12} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Statistics */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Profile Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-gray-100/50 dark:bg-gray-800/50">
            <p className="text-2xl font-bold text-purple-400">{profile.technicalSkills.length}</p>
            <p className="text-xs text-gray-500">Skills Tracked</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-100/50 dark:bg-gray-800/50">
            <p className="text-2xl font-bold text-blue-400">{profile.skillClusters.length}</p>
            <p className="text-xs text-gray-500">Skill Clusters</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-100/50 dark:bg-gray-800/50">
            <p className="text-2xl font-bold text-amber-400">{profile.skillGaps.length}</p>
            <p className="text-xs text-gray-500">Gaps Identified</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-100/50 dark:bg-gray-800/50">
            <p className="text-2xl font-bold text-green-400">{profile.version}</p>
            <p className="text-xs text-gray-500">Profile Version</p>
          </div>
        </div>
      </div>
    </div>
  );
}