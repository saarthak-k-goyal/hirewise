import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { analyzeAPI } from '../api/client.js'
import { useToast } from '../hooks/useToast.js'
import ScoreRing from '../components/ScoreRing.jsx'
import { MatchedSkillBadge, MissingSkillBadge } from '../components/SkillBadge.jsx'
import BulletCard from '../components/BulletCard.jsx'
import { AnalysisSkeleton } from '../components/SkeletonLoader.jsx'
import {
  CheckCircle2, AlertCircle, TrendingUp, Mail, Copy,
  ChevronDown, ChevronUp, ArrowLeft, LayoutDashboard,
  Calendar, Sparkles
} from 'lucide-react'

function CoverLetterSection({ coverLetter }) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const toast = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter)
      setCopied(true)
      toast.success('Cover letter copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy. Please select and copy manually.')
    }
  }

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left
                   hover:bg-dark-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-500/10 border border-purple-500/20 rounded-xl
                          flex items-center justify-center">
            <Mail size={18} className="text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Cover Letter</h3>
            <p className="text-xs text-dark-400">AI-generated, tailored to this job</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-dark-500 hidden sm:block">
            {isOpen ? 'Collapse' : 'Expand'}
          </span>
          {isOpen
            ? <ChevronUp size={18} className="text-dark-400" />
            : <ChevronDown size={18} className="text-dark-400" />
          }
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-dark-700">
          <div className="p-6">
            <div className="flex justify-end mb-4">
              <button
                onClick={handleCopy}
                className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={14} className="text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy to Clipboard
                  </>
                )}
              </button>
            </div>
            <div className="bg-dark-700/30 rounded-xl p-6 border border-dark-600">
              <pre className="text-dark-200 text-sm leading-relaxed whitespace-pre-wrap
                              font-sans">
                {coverLetter}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Results() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const fetchedRef = useRef(false)

  // Use data passed from Dashboard if available — zero flash, zero API call
  const [analysis, setAnalysis] = useState(
    location.state?.analysisData || null
  )
  const [isLoading, setIsLoading] = useState(
    // Only show loading if we don't already have data
    !location.state?.analysisData
  )
  const [error, setError] = useState(null)

  const fetchAnalysis = useCallback(async () => {
    // Already have data from navigation state — skip fetch entirely
    if (fetchedRef.current) return
    fetchedRef.current = true

    setIsLoading(true)
    setError(null)

    try {
      const response = await analyzeAPI.getAnalysis(id)
      setAnalysis(response.data)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to load analysis'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [id, toast])

  useEffect(() => {
    // If we already have data from router state, skip the API call
    if (analysis) {
      setIsLoading(false)
      return
    }
    fetchAnalysis()
  }, [analysis, fetchAnalysis])

  if (isLoading) return <AnalysisSkeleton />

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl
                          flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Analysis not found</h2>
          <p className="text-dark-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Link to="/app" className="btn-primary flex items-center gap-2">
              <LayoutDashboard size={16} />
              New Analysis
            </Link>
            <Link to="/history" className="btn-secondary">
              View History
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!analysis) return null

  const { result, created_at, jd_preview } = analysis
  const {
    match_score,
    matched_skills,
    missing_skills,
    weak_bullets,
    cover_letter,
    summary,
  } = result

  const createdDate = new Date(created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="btn-ghost flex items-center gap-1.5 text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <span className="text-dark-600">/</span>
          <Link to="/history" className="btn-ghost text-sm">
            History
          </Link>
          <span className="text-dark-600">/</span>
          <span className="text-dark-400 text-sm">Results</span>
        </div>

        {/* Header Card */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="shrink-0">
              <ScoreRing score={match_score} size={160} animate />
            </div>

            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center gap-2 text-dark-400 text-sm mb-3
                              justify-center lg:justify-start">
                <Calendar size={14} />
                {createdDate}
              </div>

              <h1 className="text-2xl font-bold text-white mb-3">
                Resume Analysis Results
              </h1>

              <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-brand-400" />
                  <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider">
                    AI Verdict
                  </span>
                </div>
                <p className="text-dark-200 leading-relaxed">{summary}</p>
              </div>

              {jd_preview && (
                <p className="text-xs text-dark-500 font-mono line-clamp-2">
                  JD: {jd_preview}
                </p>
              )}
            </div>

            <div className="shrink-0 grid grid-cols-2 gap-3 w-full lg:w-auto">
              <div className="card p-4 text-center">
                <p className="text-2xl font-bold text-green-400">
                  {matched_skills.length}
                </p>
                <p className="text-xs text-dark-400 mt-1">Matched Skills</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-2xl font-bold text-red-400">
                  {missing_skills.length}
                </p>
                <p className="text-xs text-dark-400 mt-1">Missing Skills</p>
              </div>
              <div className="card p-4 text-center col-span-2">
                <p className="text-2xl font-bold text-orange-400">
                  {weak_bullets.length}
                </p>
                <p className="text-xs text-dark-400 mt-1">Bullets Improved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-500/10 border border-green-500/20 rounded-lg
                              flex items-center justify-center">
                <CheckCircle2 size={16} className="text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Matched Skills</h3>
                <p className="text-xs text-dark-400">Found in both resume and JD</p>
              </div>
            </div>
            {matched_skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {matched_skills.map((skill) => (
                  <MatchedSkillBadge key={skill} skill={skill} />
                ))}
              </div>
            ) : (
              <p className="text-dark-500 text-sm italic">No matched skills found</p>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-500/10 border border-red-500/20 rounded-lg
                              flex items-center justify-center">
                <AlertCircle size={16} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Missing Skills</h3>
                <p className="text-xs text-dark-400">Required by JD, not in resume</p>
              </div>
            </div>
            {missing_skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {missing_skills.map((skill) => (
                  <MissingSkillBadge key={skill} skill={skill} />
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 size={16} />
                <span className="text-sm font-medium">
                  No critical skills missing.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bullet Rewrites */}
        {weak_bullets.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-orange-500/10 border border-orange-500/20 rounded-lg
                              flex items-center justify-center">
                <TrendingUp size={16} className="text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">
                  Bullet Point Improvements
                </h3>
                <p className="text-xs text-dark-400">
                  AI rewrote these with metrics and action verbs
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {weak_bullets.map((bullet, i) => (
                <BulletCard
                  key={i}
                  index={i}
                  original={bullet.original}
                  improved={bullet.improved}
                />
              ))}
            </div>
          </div>
        )}

        {/* Cover Letter */}
        <div className="mb-6">
          <CoverLetterSection coverLetter={cover_letter} />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/app" className="btn-primary flex items-center justify-center gap-2">
            <Sparkles size={16} />
            Analyze Another Resume
          </Link>
          <Link
            to="/history"
            className="btn-secondary flex items-center justify-center gap-2"
          >
            View All Analyses
          </Link>
        </div>
      </div>
    </div>
  )
}