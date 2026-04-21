import { useState, useEffect, useCallback } from 'react'
import { Users, BookOpen, TrendingUp, DollarSign, Plus, Pencil, Trash2, X, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react'
import { getDashboard, getAdminCourses } from '../api/admin'
import { createCourse, updateCourse, deleteCourse } from '../api/courses'

const CATEGORIES = ['labview', 'automation', 'python', 'robotics', 'electronics', 'plc', 'scada']
const LEVELS = ['beginner', 'intermediate', 'advanced']
const LEVEL_LABEL = { beginner: 'เริ่มต้น', intermediate: 'ปานกลาง', advanced: 'ขั้นสูง' }

const EMPTY_FORM = {
  title: '', description: '', courseCode: '', category: 'labview', level: 'beginner',
  price: '', durationHours: '', totalLessons: '', maxStudents: '',
  thumbnailUrl: '', videoPreviewUrl: '',
  learningOutcomes: '', requirements: '',
  isPublished: false, isFeatured: false,
}

function CourseModal({ isDark, course, onClose, onSaved }) {
  const [form, setForm] = useState(() => course ? {
    title: course.title || '',
    description: course.description || '',
    courseCode: course.course_code || '',
    category: course.category || 'labview',
    level: course.level || 'beginner',
    price: course.price || '',
    durationHours: course.duration_hours || '',
    totalLessons: course.total_lessons || '',
    maxStudents: course.max_students || '',
    thumbnailUrl: course.thumbnail_url || '',
    videoPreviewUrl: course.video_preview_url || '',
    learningOutcomes: (course.learning_outcomes || []).join('\n'),
    requirements: (course.requirements || []).join('\n'),
    isPublished: course.is_published || false,
    isFeatured: course.is_featured || false,
  } : EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        title: form.title,
        description: form.description,
        courseCode: form.courseCode,
        category: form.category,
        level: form.level,
        price: parseFloat(form.price) || 0,
        durationHours: parseInt(form.durationHours) || 0,
        totalLessons: parseInt(form.totalLessons) || 0,
        maxStudents: parseInt(form.maxStudents) || null,
        thumbnailUrl: form.thumbnailUrl || null,
        videoPreviewUrl: form.videoPreviewUrl || null,
        learningOutcomes: form.learningOutcomes.split('\n').map(s => s.trim()).filter(Boolean),
        requirements: form.requirements.split('\n').map(s => s.trim()).filter(Boolean),
        isPublished: form.isPublished,
        isFeatured: form.isFeatured,
      }
      if (course) {
        await updateCourse(course.course_id, payload)
      } else {
        await createCourse(payload)
      }
      onSaved()
    } catch (err) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  const border = isDark ? 'border-slate-700' : 'border-slate-200'
  const inputCls = `w-full px-3 py-2 rounded-lg border ${border} ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm`
  const labelCls = `block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 ${border} ${isDark ? 'bg-slate-900' : 'bg-white'} shadow-2xl`}>
        <div className={`sticky top-0 flex items-center justify-between p-5 border-b ${border} ${isDark ? 'bg-slate-900' : 'bg-white'} z-10`}>
          <h2 className="text-lg font-bold">{course ? 'แก้ไขคอร์ส' : 'เพิ่มคอร์สใหม่'}</h2>
          <button onClick={onClose} className={`p-1.5 rounded-lg hover:bg-slate-700/30 transition-colors`}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>ชื่อคอร์ส *</label>
              <input required value={form.title} onChange={e => set('title', e.target.value)} className={inputCls} placeholder="ชื่อคอร์ส" />
            </div>
            <div>
              <label className={labelCls}>รหัสคอร์ส *</label>
              <input required value={form.courseCode} onChange={e => set('courseCode', e.target.value)} className={inputCls} placeholder="LV-001" />
            </div>
            <div>
              <label className={labelCls}>ราคา (บาท)</label>
              <input type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} className={inputCls} placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>หมวดหมู่</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>ระดับ</label>
              <select value={form.level} onChange={e => set('level', e.target.value)} className={inputCls}>
                {LEVELS.map(l => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>ชั่วโมงเรียน</label>
              <input type="number" min="0" value={form.durationHours} onChange={e => set('durationHours', e.target.value)} className={inputCls} placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>จำนวนบทเรียน</label>
              <input type="number" min="0" value={form.totalLessons} onChange={e => set('totalLessons', e.target.value)} className={inputCls} placeholder="0" />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>รับนักเรียนสูงสุด (ว่างไว้ = ไม่จำกัด)</label>
              <input type="number" min="0" value={form.maxStudents} onChange={e => set('maxStudents', e.target.value)} className={inputCls} placeholder="ไม่จำกัด" />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>คำอธิบายคอร์ส *</label>
              <textarea required rows={3} value={form.description} onChange={e => set('description', e.target.value)} className={inputCls} placeholder="รายละเอียดของคอร์ส..." />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>URL รูปภาพปก</label>
              <input value={form.thumbnailUrl} onChange={e => set('thumbnailUrl', e.target.value)} className={inputCls} placeholder="https://..." />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>URL วิดีโอตัวอย่าง</label>
              <input value={form.videoPreviewUrl} onChange={e => set('videoPreviewUrl', e.target.value)} className={inputCls} placeholder="https://..." />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>สิ่งที่จะได้เรียนรู้ (ใส่ทีละบรรทัด)</label>
              <textarea rows={4} value={form.learningOutcomes} onChange={e => set('learningOutcomes', e.target.value)} className={inputCls} placeholder="ทำความเข้าใจ LabVIEW เบื้องต้น&#10;สร้าง VI ได้ด้วยตัวเอง&#10;..." />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>ความต้องการเบื้องต้น (ใส่ทีละบรรทัด)</label>
              <textarea rows={3} value={form.requirements} onChange={e => set('requirements', e.target.value)} className={inputCls} placeholder="ไม่มีพื้นฐานก็เรียนได้&#10;..." />
            </div>
            <div className="flex items-center gap-6 col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isPublished} onChange={e => set('isPublished', e.target.checked)} className="w-4 h-4 rounded accent-cyan-500" />
                <span className="text-sm font-medium">เผยแพร่</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} className="w-4 h-4 rounded accent-cyan-500" />
                <span className="text-sm font-medium">คอร์สแนะนำ</span>
              </label>
            </div>
          </div>

          {error && <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className={`flex-1 py-2.5 rounded-lg border ${border} text-sm font-semibold hover:opacity-80 transition-opacity`}>ยกเลิก</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold disabled:opacity-60 hover:shadow-lg hover:shadow-cyan-500/30 transition-all">
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirm({ isDark, course, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const border = isDark ? 'border-slate-700' : 'border-slate-200'

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteCourse(course.course_id)
      onDeleted()
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-sm rounded-2xl border-2 ${border} ${isDark ? 'bg-slate-900' : 'bg-white'} shadow-2xl p-6`}>
        <h2 className="text-lg font-bold mb-2">ยืนยันการลบ</h2>
        <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>ต้องการลบคอร์ส <span className="font-semibold text-white">{course.title}</span> ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
        <div className="flex gap-3">
          <button onClick={onClose} className={`flex-1 py-2.5 rounded-lg border ${border} text-sm font-semibold hover:opacity-80`}>ยกเลิก</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold disabled:opacity-60 hover:bg-red-600 transition-colors">
            {deleting ? 'กำลังลบ...' : 'ลบคอร์ส'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Admin({ isDark }) {
  const [tab, setTab] = useState('dashboard')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [modal, setModal] = useState(null) // null | { type: 'add' | 'edit' | 'delete', course? }

  const border = isDark ? 'border-slate-800' : 'border-slate-200'
  const cardBg = isDark ? 'bg-slate-900' : 'bg-slate-50'
  const muted = isDark ? 'text-gray-400' : 'text-gray-600'

  useEffect(() => {
    getDashboard()
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const loadCourses = useCallback(() => {
    setCoursesLoading(true)
    getAdminCourses({ limit: 100 })
      .then(({ data }) => setCourses(data.data || []))
      .catch(console.error)
      .finally(() => setCoursesLoading(false))
  }, [])

  useEffect(() => {
    if (tab === 'courses') loadCourses()
  }, [tab, loadCourses])

  const handleSaved = () => {
    setModal(null)
    loadCourses()
  }

  const handleDeleted = () => {
    setModal(null)
    loadCourses()
  }

  const stats = [
    { label: 'ผู้ใช้ทั้งหมด', value: data?.stats?.totalUsers ?? 0, Icon: Users, color: 'text-cyan-400' },
    { label: 'คอร์สทั้งหมด', value: data?.stats?.totalCourses ?? 0, Icon: BookOpen, color: 'text-blue-400' },
    { label: 'การลงทะเบียน', value: data?.stats?.totalEnrollments ?? 0, Icon: TrendingUp, color: 'text-purple-400' },
    { label: 'รายได้รวม (฿)', value: Number(data?.stats?.totalRevenue ?? 0).toLocaleString(), Icon: DollarSign, color: 'text-green-400' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className={`flex gap-1 p-1 rounded-xl border ${border} ${cardBg}`}>
          {[{ id: 'dashboard', label: 'ภาพรวม' }, { id: 'courses', label: 'จัดการคอร์ส' }].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow' : muted + ' hover:text-white'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── DASHBOARD TAB ── */}
      {tab === 'dashboard' && (
        <>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`h-28 rounded-2xl border-2 ${border} animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {stats.map(({ label, value, Icon, color }) => (
                  <div key={label} className={`p-6 rounded-2xl border-2 ${border} ${cardBg}`}>
                    <Icon size={24} className={`${color} mb-3`} />
                    <p className="text-2xl font-bold">{value}</p>
                    <p className={`text-sm ${muted}`}>{label}</p>
                  </div>
                ))}
              </div>

              {data?.courseStats?.length > 0 && (
                <div className={`p-6 rounded-2xl border-2 ${border} ${cardBg} mb-6`}>
                  <h2 className="text-xl font-bold mb-4">สถิติคอร์ส</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`border-b ${border}`}>
                          <th className={`text-left py-2 pr-4 font-semibold ${muted}`}>คอร์ส</th>
                          <th className={`text-left py-2 pr-4 font-semibold ${muted}`}>รหัส</th>
                          <th className={`text-right py-2 font-semibold ${muted}`}>นักเรียน</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.courseStats.map((c, i) => (
                          <tr key={i} className={`border-b ${border} last:border-0`}>
                            <td className="py-3 pr-4 font-medium">{c.title}</td>
                            <td className={`py-3 pr-4 ${muted}`}>{c.course_code}</td>
                            <td className="py-3 text-right text-cyan-400 font-semibold">{c.total_students}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {data?.recentPayments?.length > 0 && (
                <div className={`p-6 rounded-2xl border-2 ${border} ${cardBg}`}>
                  <h2 className="text-xl font-bold mb-4">การชำระเงินล่าสุด</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`border-b ${border}`}>
                          {['อีเมล', 'คอร์ส', 'จำนวน', 'สถานะ'].map(h => (
                            <th key={h} className={`text-left py-2 pr-4 font-semibold ${muted}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.recentPayments.map((p, i) => (
                          <tr key={i} className={`border-b ${border} last:border-0`}>
                            <td className={`py-3 pr-4 ${muted}`}>{p.email}</td>
                            <td className="py-3 pr-4 font-medium">{p.title}</td>
                            <td className="py-3 pr-4 text-green-400 font-semibold">฿{Number(p.amount).toLocaleString()}</td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">{p.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── COURSES TAB ── */}
      {tab === 'courses' && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className={`text-sm ${muted}`}>{courses.length} คอร์สทั้งหมด</p>
            <button
              onClick={() => setModal({ type: 'add' })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
            >
              <Plus size={16} /> เพิ่มคอร์ส
            </button>
          </div>

          {coursesLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`h-20 rounded-xl border-2 ${border} animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed ${border}`}>
              <BookOpen size={40} className={`${muted} mb-3`} />
              <p className={`${muted} text-sm`}>ยังไม่มีคอร์ส</p>
              <button onClick={() => setModal({ type: 'add' })} className="mt-4 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/30 transition-colors">
                เพิ่มคอร์สแรก
              </button>
            </div>
          ) : (
            <div className={`rounded-2xl border-2 ${border} overflow-hidden`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${border} ${cardBg}`}>
                    <th className={`text-left px-4 py-3 font-semibold ${muted}`}>คอร์ส</th>
                    <th className={`text-left px-4 py-3 font-semibold ${muted} hidden md:table-cell`}>หมวดหมู่</th>
                    <th className={`text-left px-4 py-3 font-semibold ${muted} hidden md:table-cell`}>ราคา</th>
                    <th className={`text-center px-4 py-3 font-semibold ${muted} hidden lg:table-cell`}>นักเรียน</th>
                    <th className={`text-center px-4 py-3 font-semibold ${muted}`}>สถานะ</th>
                    <th className={`text-right px-4 py-3 font-semibold ${muted}`}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c.id} className={`border-b ${border} last:border-0 hover:${isDark ? 'bg-slate-800/50' : 'bg-slate-50/80'} transition-colors`}>
                      <td className="px-4 py-3">
                        <div className="font-medium leading-snug">{c.title}</div>
                        <div className={`text-xs ${muted}`}>{c.course_code} · {LEVEL_LABEL[c.level]}</div>
                      </td>
                      <td className={`px-4 py-3 hidden md:table-cell ${muted}`}>{c.category?.toUpperCase()}</td>
                      <td className="px-4 py-3 hidden md:table-cell font-semibold text-cyan-400">
                        {Number(c.price) === 0 ? 'ฟรี' : `฿${Number(c.price).toLocaleString()}`}
                      </td>
                      <td className="px-4 py-3 text-center hidden lg:table-cell">{c.enrollment_count || 0}</td>
                      <td className="px-4 py-3 text-center">
                        {c.is_published
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400"><Eye size={10} /> เผยแพร่</span>
                          : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-slate-500/20 text-slate-400"><EyeOff size={10} /> ซ่อน</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setModal({ type: 'edit', course: c })}
                            className={`p-1.5 rounded-lg hover:bg-blue-500/20 hover:text-blue-400 ${muted} transition-colors`}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setModal({ type: 'delete', course: c })}
                            className={`p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 ${muted} transition-colors`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {modal?.type === 'add' && (
        <CourseModal isDark={isDark} course={null} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
      {modal?.type === 'edit' && (
        <CourseModal isDark={isDark} course={modal.course} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
      {modal?.type === 'delete' && (
        <DeleteConfirm isDark={isDark} course={modal.course} onClose={() => setModal(null)} onDeleted={handleDeleted} />
      )}
    </div>
  )
}
