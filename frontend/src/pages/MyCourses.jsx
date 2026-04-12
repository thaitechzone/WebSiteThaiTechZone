import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Clock, CheckCircle } from 'lucide-react'
import { getMyCourses } from '../api/enrollment'

export default function MyCourses({ isDark }) {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const border = isDark ? 'border-slate-800' : 'border-slate-200'
  const muted = isDark ? 'text-gray-400' : 'text-gray-600'
  const cardBg = isDark ? 'bg-slate-900' : 'bg-slate-50'

  useEffect(() => {
    getMyCourses()
      .then(({ data }) => setEnrollments(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-3xl font-bold mb-8">คอร์สของฉัน</h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-28 rounded-2xl border-2 ${border} animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen size={64} className={`mx-auto mb-4 ${muted}`} />
          <h2 className="text-xl font-bold mb-2">ยังไม่มีคอร์ส</h2>
          <p className={`mb-6 ${muted}`}>ไปเลือกคอร์สที่คุณสนใจได้เลย</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg transition-all"
          >
            ดูคอร์สทั้งหมด
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((e) => (
            <div key={e.id} className={`p-6 rounded-2xl border-2 ${border} ${cardBg} flex gap-6 items-center`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">{e.title}</h3>
                  {e.status === 'completed' && (
                    <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle size={12} /> สำเร็จ
                    </span>
                  )}
                </div>
                <p className={`text-sm ${muted} mb-3`}>{e.description}</p>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={muted}>ความก้าวหน้า</span>
                    <span className="text-cyan-400 font-medium">{e.progress_percentage}%</span>
                  </div>
                  <div className={`h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                      style={{ width: `${e.progress_percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-end gap-2">
                <div className={`flex items-center gap-1 text-sm ${muted}`}>
                  <BookOpen size={14} /> {e.total_lessons} บท
                </div>
                <button
                  onClick={() => navigate(`/courses/${e.course_id}`)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg transition-all"
                >
                  {e.progress_percentage > 0 ? 'เรียนต่อ' : 'เริ่มเรียน'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
