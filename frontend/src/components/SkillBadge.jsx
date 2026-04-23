import { CheckCircle2, AlertCircle } from 'lucide-react'

export function MatchedSkillBadge({ skill }) {
  return (
    <span className="badge-green">
      <CheckCircle2 size={12} />
      {skill}
    </span>
  )
}

export function MissingSkillBadge({ skill }) {
  return (
    <span className="badge-red">
      <AlertCircle size={12} />
      {skill}
    </span>
  )
}

export default function SkillBadge({ skill, type }) {
  if (type === 'matched') return <MatchedSkillBadge skill={skill} />
  return <MissingSkillBadge skill={skill} />
}