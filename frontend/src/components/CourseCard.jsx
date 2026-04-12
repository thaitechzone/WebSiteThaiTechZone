import { useNavigate } from 'react-router-dom'
import { Clock, Users, Star, BookOpen } from 'lucide-react'

const LEVEL_LABEL = { beginner: 'เริ่มต้น', intermediate: 'ปานกลาง', advanced: 'ขั้นสูง' }
const LEVEL_COLOR = {
  beginner: 'bg-green-500/20 text-green-400',
  intermediate: 'bg-yellow-500/20 text-yellow-400',
  advanced: 'bg-red-500/20 text-red-400',
}
const CATEGORY_ICON = {
  labview: '⚙️', automation: '🤖', python: '🐍',
  robotics: '🦾', iot: '📡', default: '📚',
}

export default function CourseCard({ course, isDark }) {
  const navigate = useNavigate()
  const border = isDark ? 'border-slate-800' : 'border-slate-200'
  const cardBg = isDark ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-50 hover:bg-slate-100'
  const muted = isDark ? 'text-gray-400' : 'text-gray-600'

  const icon = CATEGORY_ICON[course.category] || CATEGORY_ICON.default
  const levelColor = LEVEL_COLOR[course.level] || 'bg-slate-500/20 text-slate-400'
  const levelLabel = LEVEL_LABEL[course.level] || course.level

  return (
    <div
      onClick={() => navigate(`/courses/${course.course_id || course.id}`)}
      className={`p-6 rounded-2xl border-2 ${border} ${cardBg} transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group`}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 line-clamp-1">{course.title}</h3>
      <p className={`text-sm mb-4 line-clamp-2 ${muted}`}>{course.description}</p>

      <div className={`flex justify-between items-center mb-4 pb-4 border-t border-b ${border}`}>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${levelColor}`}>
          {levelLabel}
        </span>
        <div className="flex items-center gap-1">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span className={`text-sm ${muted}`}>{Number(course.rating || 0).toFixed(1)}</span>
        </div>
      </div>

      <div className={`flex justify-between items-center text-xs ${muted} mb-4`}>
        <span className="flex items-center gap-1">
          <Clock size={12} /> {course.duration_hours}h
        </span>
        <span className="flex items-center gap-1">
          <BookOpen size={12} /> {course.total_lessons} บทเรียน
        </span>
        <span className="flex items-center gap-1">
          <Users size={12} /> {course.current_students}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-cyan-400">
          ฿{Number(course.price).toLocaleString()}
        </span>
        <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white group-hover:shadow-lg group-hover:shadow-cyan-500/30 transition-all">
          ดูรายละเอียด
        </button>
      </div>
    </div>
  )
}
