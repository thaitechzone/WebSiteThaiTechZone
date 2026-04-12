import { useState, useEffect } from 'react'
import { Search, Filter } from 'lucide-react'
import { getCourses } from '../api/courses'
import CourseCard from '../components/CourseCard'

const CATEGORIES = ['ทั้งหมด', 'labview', 'automation', 'python', 'robotics']
const LEVELS = ['ทั้งหมด', 'beginner', 'intermediate', 'advanced']
const LEVEL_LABEL = { beginner: 'เริ่มต้น', intermediate: 'ปานกลาง', advanced: 'ขั้นสูง' }

export default function Courses({ isDark }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ทั้งหมด')
  const [level, setLevel] = useState('ทั้งหมด')
  const border = isDark ? 'border-slate-800' : 'border-slate-200'
  const inputBg = isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'

  useEffect(() => {
    const params = {}
    if (search) params.search = search
    if (category !== 'ทั้งหมด') params.category = category
    if (level !== 'ทั้งหมด') params.level = level

    setLoading(true)
    getCourses(params)
      .then(({ data }) => setCourses(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [search, category, level])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">คอร์สเรียนของเรา</h1>
        <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          เลือกคอร์สที่เหมาะกับระดับของคุณ
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="ค้นหาคอร์ส..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border-2 ${border} ${inputBg} focus:outline-none focus:border-cyan-500 transition-colors`}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                category === cat
                  ? 'bg-cyan-500 text-white'
                  : isDark ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
              }`}
            >
              {cat === 'ทั้งหมด' ? 'ทั้งหมด' : cat.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {LEVELS.map((lv) => (
            <button
              key={lv}
              onClick={() => setLevel(lv)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                level === lv
                  ? 'bg-blue-500 text-white'
                  : isDark ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
              }`}
            >
              {lv === 'ทั้งหมด' ? 'ทุกระดับ' : LEVEL_LABEL[lv]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`h-72 rounded-2xl border-2 ${border} animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🔍</p>
          <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>ไม่พบคอร์สที่ค้นหา</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} isDark={isDark} />
          ))}
        </div>
      )}
    </div>
  )
}
