import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register({ isDark }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const border = isDark ? 'border-slate-800' : 'border-slate-200'
  const inputBg = isDark ? 'bg-slate-800 text-white placeholder-gray-500' : 'bg-white text-slate-900 placeholder-gray-400'
  const cardBg = isDark ? 'bg-slate-900' : 'bg-slate-50'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) return setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'สมัครสมาชิกไม่สำเร็จ')
    }
  }

  const field = (name, label, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        required={name !== 'phone'}
        placeholder={placeholder}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className={`w-full px-4 py-2.5 rounded-lg border-2 ${border} ${inputBg} focus:outline-none focus:border-cyan-500 transition-colors`}
      />
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className={`w-full max-w-md p-8 rounded-2xl border-2 ${border} ${cardBg}`}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">สมัครสมาชิก</h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>เริ่มต้นการเรียนรู้วันนี้</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-sm text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {field('firstName', 'ชื่อ', 'text', 'ชื่อ')}
            {field('lastName', 'นามสกุล', 'text', 'นามสกุล')}
          </div>
          {field('email', 'อีเมล', 'email', 'your@email.com')}
          {field('phone', 'เบอร์โทร (ไม่บังคับ)', 'tel', '0812345678')}
          {field('password', 'รหัสผ่าน', 'password', '••••••••')}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-60"
          >
            {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
          </button>
        </form>

        <p className={`mt-6 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          มีบัญชีแล้ว?{' '}
          <Link to="/login" className="text-cyan-400 hover:underline font-medium">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  )
}
