import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import {
  Zap, FileText, Search, Sparkles, Mail, History,
  ChevronRight, Star, TrendingUp, Target, CheckCircle2
} from 'lucide-react'

const FEATURES = [
  {
    icon: Target,
    title: 'ATS Match Score',
    desc: 'Get an instant 0-100% compatibility score between your resume and any job description.',
    color: 'text-brand-400',
    bg: 'bg-brand-500/10',
  },
  {
    icon: Search,
    title: 'Skill Gap Analysis',
    desc: 'Identify exactly which skills you have and which critical ones are missing for the role.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Bullet Rewrites',
    desc: 'Gemini AI transforms weak bullet points into powerful, metric-driven achievements.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Mail,
    title: 'Cover Letter Generator',
    desc: 'Get a personalized, compelling cover letter tailored to the specific role and company.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: History,
    title: 'Session History',
    desc: 'All your analyses are saved. Revisit, compare, and track your job search progress.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
  {
    icon: Sparkles,
    title: 'Powered by Gemini AI',
    desc: 'Uses Google\'s Gemini Flash for fast, accurate, and contextually aware analysis.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Upload Your Resume',
    desc: 'Upload your resume as a PDF. We parse it securely on our servers.',
  },
  {
    number: '02',
    title: 'Paste the Job Description',
    desc: 'Copy the JD from Internshala, Naukri, LinkedIn or anywhere else.',
  },
  {
    number: '03',
    title: 'Get AI Analysis',
    desc: 'Gemini analyzes both and returns a comprehensive report in seconds.',
  },
  {
    number: '04',
    title: 'Improve & Apply',
    desc: 'Use the insights to strengthen your resume and send a tailored cover letter.',
  },
]

const PLATFORMS = ['Internshala', 'LinkedIn', 'Naukri', 'AngelList', 'Unstop', 'Wellfound']

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-dark-900 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
          <div className="absolute -top-20 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          w-[600px] h-[600px] bg-brand-900/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20
                          text-brand-400 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles size={14} />
            <span>Powered by Google Gemini Flash</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1]
                         tracking-tight mb-6 text-balance">
            Land More Interviews with{' '}
            <span className="gradient-text">AI-Powered</span>{' '}
            Resume Matching
          </h1>

          <p className="text-xl text-dark-300 max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
            Upload your resume, paste any job description, and get an instant ATS score,
            skill gap analysis, improved bullet points, and a tailored cover letter.
            Built for Indian job seekers.
          </p>

          {/* Platform badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {PLATFORMS.map((platform) => (
              <span
                key={platform}
                className="px-3 py-1.5 bg-dark-800 border border-dark-700 text-dark-400
                           text-sm rounded-full"
              >
                {platform}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? '/app' : '/register'}
              className="btn-primary flex items-center gap-2 text-lg px-8 py-4"
            >
              {user ? 'Go to Dashboard' : 'Start for Free'}
              <ChevronRight size={20} />
            </Link>
            {!user && (
              <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                Sign In
              </Link>
            )}
          </div>

          {/* Social proof */}
          <p className="mt-6 text-dark-500 text-sm flex items-center justify-center gap-2">
            <CheckCircle2 size={14} className="text-green-500" />
            Free to use · No credit card required · Instant results
          </p>
        </div>

        {/* Hero visual */}
        <div className="max-w-4xl mx-auto mt-20 relative z-10">
          <div className="card p-6 relative overflow-hidden">
            {/* Mock UI */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1 flex flex-col items-center justify-center py-6">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 140 140" className="w-full h-full">
                    <circle cx="70" cy="70" r="54" fill="none" stroke="#1a1a2e" strokeWidth="8" />
                    <circle
                      cx="70" cy="70" r="54"
                      fill="none" stroke="#22c55e" strokeWidth="8"
                      strokeDasharray="339.29"
                      strokeDashoffset={339.29 * 0.24}
                      strokeLinecap="round"
                      style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', filter: 'drop-shadow(0 0 8px #22c55e80)' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-green-400">76</span>
                    <span className="text-xs text-dark-400">/ 100</span>
                  </div>
                </div>
                <span className="mt-2 text-xs text-green-400 font-semibold">Strong Match</span>
              </div>
              <div className="md:col-span-2 space-y-3">
                <div>
                  <p className="text-xs text-dark-400 uppercase tracking-wider mb-2 font-semibold">
                    Matched Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {['React', 'TypeScript', 'Node.js', 'REST APIs'].map(s => (
                      <span key={s} className="badge-green text-xs py-0.5">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-dark-400 uppercase tracking-wider mb-2 font-semibold">
                    Missing Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Docker', 'AWS', 'GraphQL'].map(s => (
                      <span key={s} className="badge-red text-xs py-0.5">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-dark-700/50 rounded-lg p-3">
                  <p className="text-xs text-dark-400 mb-1">AI Summary</p>
                  <p className="text-xs text-dark-200 leading-relaxed">
                    Strong frontend match with 76% compatibility. Core React/TypeScript skills
                    are well-represented. Adding cloud experience would make you a top candidate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 border-t border-dark-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to get hired
            </h2>
            <p className="text-dark-400 text-lg max-w-xl mx-auto">
              A complete toolkit that gives you an unfair advantage in your job search.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="card-hover p-6">
                  <div className={`w-10 h-10 ${feature.bg} rounded-xl flex items-center
                                  justify-center mb-4`}>
                    <Icon size={20} className={feature.color} />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-dark-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 border-t border-dark-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How it works
            </h2>
            <p className="text-dark-400 text-lg">
              Four simple steps to a stronger application
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="card p-6 flex gap-4">
                <div className="shrink-0">
                  <span className="text-3xl font-black text-brand-600/30 font-mono">
                    {step.number}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-dark-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 border-t border-dark-800">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600/5 to-purple-600/5" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-brand-600/20 rounded-2xl flex items-center
                              justify-center mx-auto mb-6">
                <Zap size={28} className="text-brand-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Ready to land your dream job?
              </h2>
              <p className="text-dark-400 mb-8 leading-relaxed">
                Join thousands of Indian job seekers who've improved their resume match scores
                and landed more interviews with Hirewise.
              </p>
              <Link
                to={user ? '/app' : '/register'}
                className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
              >
                {user ? 'Analyze a Resume Now' : 'Create Free Account'}
                <ChevronRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between
                        gap-4 text-dark-500 text-sm">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-brand-500" />
            <span className="font-semibold text-dark-400">Hirewise</span>
            <span>© 2024</span>
          </div>
          <p>Built for Indian job seekers · Powered by Gemini AI</p>
        </div>
      </footer>
    </div>
  )
}