import { useToastState } from '../hooks/useToast.js'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const STYLES = {
  success: 'bg-green-500/10 border-green-500/30 text-green-400',
  error: 'bg-red-500/10 border-red-500/30 text-red-400',
  warning: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
  info: 'bg-brand-500/10 border-brand-500/30 text-brand-400',
}

function ToastItem({ toast, onRemove }) {
  const Icon = ICONS[toast.type] || Info
  const style = STYLES[toast.type] || STYLES.info

  return (
    <div
      className={`toast-enter flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm
        shadow-lg shadow-black/40 max-w-sm w-full ${style}`}
    >
      <Icon size={18} className="shrink-0 mt-0.5" />
      <p className="text-sm font-medium leading-relaxed flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export function Toast() {
  const { toasts, removeToast } = useToastState()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  )
}