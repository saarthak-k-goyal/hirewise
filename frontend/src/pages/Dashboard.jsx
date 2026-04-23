import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useToast } from '../hooks/useToast.js'
import { analyzeAPI } from '../api/client.js'
import {
  Upload, FileText, X, Loader2, Sparkles,
  AlertCircle, CheckCircle2, ChevronRight
} from 'lucide-react'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [file, setFile] = useState(null)
  const [jdText, setJdText] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState('')
  const [percent, setPercent] = useState(0);

  const fileInputRef = useRef(null)

  const validateFile = useCallback((f) => {
    if (!f) return 'Please select a file'
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      return 'Only PDF files are accepted'
    }
    if (f.size > MAX_FILE_SIZE) {
      return 'File size must be under 10MB'
    }
    return null
  }, [])

  const handleFile = useCallback((f) => {
    const error = validateFile(f)
    if (error) {
      toast.error(error)
      return
    }
    setFile(f)
    toast.success(`Resume "${f.name}" uploaded successfully`)
  }, [validateFile, toast])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }, [handleFile])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileInput = (e) => {
    const selected = e.target.files[0]
    if (selected) handleFile(selected)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please upload your resume PDF')
      return
    }
    if (!jdText.trim() || jdText.trim().length < 50) {
      toast.error('Please paste the complete job description (at least 50 characters)')
      return
    }

    function startFakeProgress(setProgress) {
      let cancelled = false;

      const steps = [
        "Parsing your resume...",
        "Extracting key skills...",
        "Analyzing with Gemini AI...",
        "Comparing with job market...",
        "Generating insights...",
        "Writing cover letter..."
      ];

      const run = async () => {
        for (const step of steps) {
          if (cancelled) return;

          setProgress(step);

          const delay = 800 + Math.random() * 2000;
          await new Promise(res => setTimeout(res, delay));
        }
      };

      run();

      return () => {
        cancelled = true;
      };
    }

    setIsAnalyzing(true)

    const stopProgress = startFakeProgress(setProgress);

    try {
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('jd_text', jdText.trim())

      const response = await analyzeAPI.analyze(formData)
      const analysisData = response.data

      toast.success('Analysis complete! 🎉')

      setProgress("Finalizing report...");

      // Pass data via router state — Results page uses it immediately
      // No API call needed on mount, zero flash
      navigate(`/results/${analysisData.id}`, {
        state: { analysisData },
        replace: false,
      })
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        'Analysis failed. Please check your file and try again.'
      toast.error(msg)
    } finally {
      stopProgress();
      setIsAnalyzing(false)
      setProgress('')
    }
  }

  const isReady = file && jdText.trim().length >= 50

  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">
            Hey {user?.name?.split(' ')[0]}, let's analyze your resume 👋
          </h1>
          <p className="text-dark-400">
            Upload your PDF resume and paste a job description to get started.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Resume Upload */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="mb-3 flex items-center gap-2">
              <FileText size={16} className="text-brand-400" />
              <h2 className="font-semibold text-white">Resume PDF</h2>
              <span className="text-xs text-dark-500 ml-auto">Max 10MB</span>
            </div>

            {!file ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-2xl p-8 cursor-pointer
                  flex flex-col items-center justify-center text-center min-h-[220px]
                  transition-all duration-200
                  ${isDragging
                    ? 'border-brand-500 bg-brand-500/5'
                    : 'border-dark-600 hover:border-dark-500 hover:bg-dark-800/50'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4
                  transition-colors ${isDragging ? 'bg-brand-500/20' : 'bg-dark-700'}`}>
                  <Upload size={24} className={isDragging ? 'text-brand-400' : 'text-dark-400'} />
                </div>

                <p className="font-medium text-dark-200 mb-1">
                  {isDragging ? 'Drop your PDF here' : 'Click to upload or drag & drop'}
                </p>
                <p className="text-sm text-dark-500">PDF files only · Max 10MB</p>
              </div>
            ) : (
              <div className="card p-5 min-h-[220px] flex flex-col justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-500/10 border border-brand-500/20
                                  rounded-xl flex items-center justify-center shrink-0">
                    <FileText size={22} className="text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{file.name}</p>
                    <p className="text-sm text-dark-400 mt-0.5">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={removeFile}
                    className="shrink-0 text-dark-500 hover:text-red-400 transition-colors p-1"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-4 p-3 bg-green-500/5 border border-green-500/20 rounded-xl
                                flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                  <p className="text-sm text-green-400 font-medium">
                    Resume ready for analysis
                  </p>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 text-sm text-dark-400 hover:text-dark-200 transition-colors
                             flex items-center gap-1"
                >
                  <Upload size={12} />
                  Replace file
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </button>
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-brand-400" />
              <h2 className="font-semibold text-white">Job Description</h2>
              <span className="text-xs text-dark-500 ml-auto">
                {jdText.length} chars {jdText.length >= 50 ? '✓' : '(min 50)'}
              </span>
            </div>

            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder={`Paste the full job description here...

Example:
We are looking for a Frontend Developer with 2+ years of experience in React.js, TypeScript, and modern CSS frameworks. The ideal candidate should have experience with REST APIs, Git, and agile development practices...`}
              className="input-field min-h-[220px] resize-none text-sm leading-relaxed
                         font-mono"
              disabled={isAnalyzing}
            />

            {jdText.length > 0 && jdText.length < 50 && (
              <div className="mt-2 flex items-center gap-1.5 text-orange-400 text-xs">
                <AlertCircle size={12} />
                Please paste a more complete job description
              </div>
            )}
          </div>
        </div>

        {/* Analyze Button */}
        <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !isReady}
            className={`
              btn-primary w-full flex items-center justify-center gap-3 text-lg py-4
              relative overflow-hidden
              ${!isReady && !isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={22} className="animate-spin" />
                <span>{progress || 'Analyzing...'}</span>
              </>
            ) : (
              <>
                <Sparkles size={22} />
                <span>Analyze Resume</span>
                <ChevronRight size={20} />
              </>
            )}
          </button>

          {!isReady && !isAnalyzing && (
            <p className="text-center text-dark-500 text-sm mt-3">
              {!file && !jdText
                ? 'Upload your resume and paste a job description to continue'
                : !file
                  ? 'Upload your resume PDF to continue'
                  : 'Paste the job description to continue'
              }
            </p>
          )}

          {isAnalyzing && (
            <div className="mt-4 card p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-500/10 rounded-lg flex items-center justify-center">
                  <Sparkles size={16} className="text-brand-400 animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-medium text-dark-200">{progress}</p>
                  <p className="text-xs text-dark-500 mt-0.5">
                    This typically takes 15-30 seconds
                  </p>
                </div>
              </div>
              <div className="mt-3 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-600 to-brand-400
                                rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-8 card p-5 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-sm font-semibold text-dark-300 mb-3 uppercase tracking-wider">
            Tips for best results
          </h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              'Use a text-based PDF (not a scanned image)',
              'Paste the complete JD including requirements',
              'Include skills, tools, and qualifications in your resume',
              'Copy JD from Internshala, LinkedIn, or Naukri directly',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-dark-400">
                <CheckCircle2 size={14} className="text-brand-500 mt-0.5 shrink-0" />
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}