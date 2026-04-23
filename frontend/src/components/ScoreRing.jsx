import { useEffect, useState } from 'react'

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS // ≈ 339.29

function getScoreColor(score) {
  if (score >= 70) return { stroke: '#22c55e', text: 'text-green-400', label: 'Strong Match' }
  if (score >= 50) return { stroke: '#f97316', text: 'text-orange-400', label: 'Moderate Match' }
  if (score >= 30) return { stroke: '#eab308', text: 'text-yellow-400', label: 'Weak Match' }
  return { stroke: '#ef4444', text: 'text-red-400', label: 'Poor Match' }
}

export default function ScoreRing({ score = 0, size = 160, animate = true }) {
  const [displayedScore, setDisplayedScore] = useState(animate ? 0 : score)
  const [dashOffset, setDashOffset] = useState(CIRCUMFERENCE)

  const { stroke, text, label } = getScoreColor(score)
  const scaleFactor = size / 140
  const svgSize = size
  const center = svgSize / 2
  const scaledRadius = RADIUS * scaleFactor
  const scaledCircumference = 2 * Math.PI * scaledRadius

  useEffect(() => {
    if (!animate) {
      setDisplayedScore(score)
      setDashOffset(scaledCircumference * (1 - score / 100))
      return
    }

    // Animate score counter
    const duration = 1500
    const startTime = performance.now()

    const animateScore = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic

      const current = Math.round(score * eased)
      setDisplayedScore(current)
      setDashOffset(scaledCircumference * (1 - (score * eased) / 100))

      if (progress < 1) {
        requestAnimationFrame(animateScore)
      }
    }

    const frame = requestAnimationFrame(animateScore)
    return () => cancelAnimationFrame(frame)
  }, [score, animate, scaledCircumference])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="drop-shadow-lg"
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={scaledRadius}
            fill="none"
            stroke="#1a1a2e"
            strokeWidth={8 * scaleFactor}
          />

          {/* Glow effect */}
          <circle
            cx={center}
            cy={center}
            r={scaledRadius}
            fill="none"
            stroke={stroke}
            strokeWidth={8 * scaleFactor}
            strokeDasharray={scaledCircumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{
              transform: `rotate(-90deg)`,
              transformOrigin: 'center',
              filter: `drop-shadow(0 0 8px ${stroke}80)`,
              transition: 'stroke-dashoffset 0.05s linear',
            }}
          />

          {/* Inner background */}
          <circle
            cx={center}
            cy={center}
            r={scaledRadius - 12 * scaleFactor}
            fill="#0f0f1a"
          />
        </svg>

        {/* Score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-bold leading-none ${text}`}
            style={{ fontSize: `${2.2 * scaleFactor}rem` }}
          >
            {displayedScore}
          </span>
          <span
            className="text-dark-400 font-medium"
            style={{ fontSize: `${0.7 * scaleFactor}rem` }}
          >
            out of 100
          </span>
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <span
          className={`text-sm font-semibold px-3 py-1 rounded-full border ${
            score >= 70
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : score >= 50
              ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
              : score >= 30
              ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  )
}