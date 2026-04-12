import { useState } from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'
import { submitContact } from '../api/contact'

export default function Contact({ isDark }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const border = isDark ? 'border-slate-800' : 'border-slate-200'
  const inputBg = isDark ? 'bg-slate-800 text-white placeholder-gray-500' : 'bg-white text-slate-900 placeholder-gray-400'
  const cardBg = isDark ? 'bg-slate-900' : 'bg-slate-50'
  const muted = isDark ? 'text-gray-400' : 'text-gray-600'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      await submitContact(form)
      setStatus({ type: 'success', text: 'ส่งข้อความสำเร็จ! เราจะติดต่อกลับโดยเร็ว' })
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err) {
      setStatus({ type: 'error', text: err.response?.data?.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่' })
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `w-full px-4 py-2.5 rounded-lg border-2 ${border} ${inputBg} focus:outline-none focus:border-cyan-500 transition-colors`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">ติดต่อเรา</h1>
        <p className={`text-xl ${muted}`}>มีคำถามหรือต้องการข้อมูลเพิ่มเติม? เราอยู่ที่นี่เพื่อช่วยเหลือ</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Form */}
        <div className={`p-8 rounded-2xl border-2 ${border} ${cardBg}`}>
          <h2 className="text-2xl font-bold mb-6">ส่งข้อความถึงเรา</h2>

          {status && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {status.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">ชื่อ *</label>
                <input type="text" required placeholder="ชื่อของคุณ" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">เบอร์โทร</label>
                <input type="tel" placeholder="0812345678" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">อีเมล *</label>
              <input type="email" required placeholder="your@email.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">หัวข้อ *</label>
              <input type="text" required placeholder="สอบถามเรื่องคอร์ส..." value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ข้อความ *</label>
              <textarea rows={5} required placeholder="รายละเอียดข้อความ..." value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputClass} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg transition-all disabled:opacity-60">
              {loading ? 'กำลังส่ง...' : 'ส่งข้อความ'}
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="space-y-6">
          {[
            { Icon: Mail, title: 'อีเมล', value: 'info@thaitechzone.com' },
            { Icon: Phone, title: 'โทรศัพท์', value: '+66-XXX-XXXX-XX' },
            { Icon: MapPin, title: 'ที่อยู่', value: 'Bangkok, Thailand' },
          ].map(({ Icon, title, value }) => (
            <div key={title} className={`p-8 rounded-2xl border-2 ${border} ${cardBg}`}>
              <Icon size={32} className="text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">{title}</h3>
              <p className={muted}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
