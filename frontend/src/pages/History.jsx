import { useEffect, useState, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { analyzeAPI } from '../api/client.js'
import { useToast } from '../hooks/useToast.js'
import { HistorySkeleton } from '../components/SkeletonLoader.jsx'
import {
  History as HistoryIcon, ChevronRight, Trash2, AlertCircle,
  Calendar, Target, Sparkles, Plus
} from 'lucide-react'

function ScorePill({ score }) {
  const color =
    score >= 70 ? 'text-green-400 bg-green-500/10 border-green-500/20' :
    score >= 50 ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
    score >= 30 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                  'text-red-400 bg-red-500/10 border-red-500/20'

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                      text-xs font-bold border ${color}`}>
      <Target size={10} />
      {score}%
    </span>
  )
}

function HistoryCard({ item, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const toast = useToast()

  const createdDate = new Date(item.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const handleDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!window.confirm('Delete this analysis? This cannot be undone.')) return

    setIsDeleting(true)
    try {
      await analyzeAPI.deleteAnalysis(item.id)
      toast.success('Analysis deleted')
      onDelete(item.id)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to delete analysis'
      toast.error(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Link
      to={`/results/${item.id}`}
      className="card-hover block p-5 group"
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center
                         shrink-0 font-bold text-sm transition-all duration-200
                         ${item.match_score >= 70
                           ? 'bg-green-500/10 border-green-500/20 text-green-400 group-hover:bg-green-500/20'
                           : item.match_score >= 50
                           ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 group-hover:bg-orange-500/20'
                           : item.match_score >= 30
                           ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 group-hover:bg-yellow-500/20'
                           : 'bg-red-500/10 border-red-500/20 text-red-400 group-hover:bg-red-500/20'
                         }`}>
          {item.match_score}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-dark-200 text-sm leading-relaxed line-clamp-2 mb-2">
            {item.jd_preview || 'No preview available'}
          </p>
          {item.summary && (
            <p className="text-dark-500 text-xs line-clamp-1 mb-2">
              {item.summary}
            </p>
          )}
          <div className="flex items-center gap-3">
            <ScorePill score={item.match_score} />
            <span className="text-dark-500 text-xs flex items-center gap-1">
              <Calendar size={10} />
              {createdDate}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-dark-600 hover:text-red-400 transition-colors rounded-lg
                       hover:bg-red-500/10 disabled:opacity-50"
            title="Delete analysis"
          >
            <Trash2 size={16} />
          </button>
          <ChevronRight size={16} className="text-dark-600 group-hover:text-dark-400
                                              transition-colors" />
        </div>
      </div>
    </Link>
  )
}

export default function History() {
  const toast = useToast()
  const fetchedRef = useRef(false)

  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchHistory = useCallback(async (force = false) => {
    // Prevent double-fetch on mount in dev / strict mode
    if (fetchedRef.current && !force) return
    fetchedRef.current = true

    setIsLoading(true)
    setError(null)

    try {
      const response = await analyzeAPI.getHistory({ limit: 50, skip: 0 })
      setItems(response.data.items)
      setTotal(response.data.total)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to load history'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleDelete = useCallback((deletedId) => {
    setItems((prev) => prev.filter((item) => item.id !== deletedId))
    setTotal((prev) => prev - 1)
  }, [])

  const avgScore = items.length > 0
    ? Math.round(items.reduce((sum, i) => sum + i.match_score, 0) / items.length)
    : 0
  const bestScore = items.length > 0
    ? Math.max(...items.map((i) => i.match_score))
    : 0

  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <HistoryIcon size={20} className="text-brand-400" />
              <h1 className="text-2xl font-bold text-white">Analysis History</h1>
            </div>
            <p className="text-dark-400 text-sm">
              {total > 0
                ? `${total} analysis${total !== 1 ? 'es' : ''} saved`
                : 'No analyses yet'
              }
            </p>
          </div>

          <Link to="/app" className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} />
            New Analysis
          </Link>
        </div>

        {items.length > 0 && !isLoading && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-white">{total}</p>
              <p className="text-xs text-dark-400 mt-1">Total Analyses</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-brand-400">{avgScore}%</p>
              <p className="text-xs text-dark-400 mt-1">Average Score</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{bestScore}%</p>
              <p className="text-xs text-dark-400 mt-1">Best Score</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <HistorySkeleton />
        ) : error ? (
          <div className="card p-8 text-center">
            <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
            <p className="text-dark-300 font-medium mb-2">Failed to load history</p>
            <p className="text-dark-500 text-sm mb-4">{error}</p>
            <button
              onClick={() => fetchHistory(true)}
              className="btn-secondary text-sm"
            >
              Try Again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-brand-500/10 border border-brand-500/20 rounded-2xl
                            flex items-center justify-center mx-auto mb-4">
              <Sparkles size={28} className="text-brand-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No analyses yet</h3>
            <p className="text-dark-400 mb-6 max-w-sm mx-auto">
              Upload your resume and paste a job description to get your first
              AI-powered analysis and match score.
            </p>
            <Link to="/app" className="btn-primary inline-flex items-center gap-2">
              <Sparkles size={16} />
              Start First Analysis
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <HistoryCard key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}