import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, Users, Star, BookOpen, ChevronLeft, CheckCircle } from 'lucide-react'
import { getCourse } from '../api/courses'
import { enroll } from '../api/enrollment'
import { useAuth } from '../context/AuthContext'

const LEVEL_LABEL = { beginner: 'เริ่มต้น', intermediate: 'ปานกลาง', advanced: 'ขั้นสูง' }

export default function CourseDetail({ isDark }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [message, setMessage] = useState(null)
  const border = isDark ? 'border-slate-800' : 'border-slate-200'
  const muted = isDark ? 'text-gray-400' : 'text-gray-600'

  useEffect(() => {
    getCourse(id)
      .then(({ data }) => setCourse(data.data))
      .catch(() => navigate('/courses'))
      .finally(() => setLoading(false))
  }, [id])

  const handleEnroll = async () => {
    if (!isLoggedIn) return navigate('/login')
    setEnrolling(true)
    try {
      const { data } = await enroll(course.course_id)
      setMessage({ type: 'success', text: 'ลงทะเบียนสำเร็จ! ไปที่คอร์สของฉัน' })
      if (data.requiresPayment) navigate('/my-courses')
    } catch (err) {
      const msg = err.response?.data?.error || 'เกิดข้อผิดพลาด'
      setMessage({ type: 'error', text: msg })
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <div className={`h-96 rounded-2xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
    </div>
  )

  if (!course) return null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <button
        onClick={() => navigate('/courses')}
        className={`flex items-center gap-2 mb-8 ${muted} hover:text-cyan-400 transition-colors`}
      >
        <ChevronLeft size={20} /> กลับไปหน้าคอร์ส
      </button>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400`}>
                {course.category?.toUpperCase()}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400`}>
                {LEVEL_LABEL[course.level] || course.level}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
            <p className={`text-lg ${muted}`}>{course.description}</p>
          </div>

          <div className={`flex gap-6 py-4 border-t border-b ${border}`}>
            <div className="flex items-center gap-2">
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
              <span className="font-semibold">{Number(course.rating || 0).toFixed(1)}</span>
              <span className={`text-sm ${muted}`}>({course.total_ratings} รีวิว)</span>
            </div>
            <div className={`flex items-center gap-2 ${muted}`}>
              <Users size={16} /> {course.current_students} นักเรียน
            </div>
            <div className={`flex items-center gap-2 ${muted}`}>
              <Clock size={16} /> {course.duration_hours} ชั่วโมง
            </div>
            <div className={`flex items-center gap-2 ${muted}`}>
              <BookOpen size={16} /> {course.total_lessons} บทเรียน
            </div>
          </div>

          {course.learning_outcomes?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">สิ่งที่จะได้เรียนรู้</h2>
              <ul className="grid md:grid-cols-2 gap-2">
                {course.learning_outcomes.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-cyan-400 mt-0.5 shrink-0" />
                    <span className={`text-sm ${muted}`}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className={`p-6 rounded-2xl border-2 ${border} ${isDark ? 'bg-slate-900' : 'bg-slate-50'} h-fit sticky top-24`}>
          <div className="text-3xl font-bold text-cyan-400 mb-4">
            ฿{Number(course.price).toLocaleString()}
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {message.text}
            </div>
          )}

          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-60 mb-3"
          >
            {enrolling ? 'กำลังลงทะเบียน...' : 'ลงทะเบียนเลย'}
          </button>

          <div className={`space-y-2 text-sm ${muted}`}>
            <div className="flex justify-between"><span>ระดับ</span><span className="font-medium">{LEVEL_LABEL[course.level]}</span></div>
            <div className="flex justify-between"><span>เวลา</span><span className="font-medium">{course.duration_hours} ชม.</span></div>
            <div className="flex justify-between"><span>บทเรียน</span><span className="font-medium">{course.total_lessons} บท</span></div>
            {course.max_students && (
              <div className="flex justify-between"><span>รับได้สูงสุด</span><span className="font-medium">{course.max_students} คน</span></div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
