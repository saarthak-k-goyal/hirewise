import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useToast } from '../hooks/useToast.js'
import { Zap, History, LogOut, User, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate('/', { replace: true })
    } catch {
      toast.error('Logout failed. Please try again.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-40 glass border-b border-dark-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? '/app' : '/'} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center
                            group-hover:bg-brand-500 transition-colors">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">Hirewise</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {user ? (
              <>
                <Link
                  to="/app"
                  className={`btn-ghost flex items-center gap-2 text-sm
                    ${isActive('/app') ? 'text-brand-400 bg-brand-500/10' : ''}`}
                >
                  <LayoutDashboard size={16} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>

                <Link
                  to="/history"
                  className={`btn-ghost flex items-center gap-2 text-sm
                    ${isActive('/history') ? 'text-brand-400 bg-brand-500/10' : ''}`}
                >
                  <History size={16} />
                  <span className="hidden sm:inline">History</span>
                </Link>

                <div className="h-6 w-px bg-dark-700 mx-1 hidden sm:block" />

                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5">
                  <div className="w-7 h-7 bg-brand-600/30 border border-brand-500/30 rounded-full
                                  flex items-center justify-center">
                    <User size={14} className="text-brand-400" />
                  </div>
                  <span className="text-sm text-dark-300 max-w-[120px] truncate">
                    {user.name}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="btn-ghost flex items-center gap-2 text-sm text-dark-400
                             hover:text-red-400"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}