import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login({ isDark }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const border = isDark ? 'border-slate-800' : 'border-slate-200'
  const inputBg = isDark ? 'bg-slate-800 text-white placeholder-gray-500' : 'bg-white text-slate-900 placeholder-gray-400'
  const cardBg = isDark ? 'bg-slate-900' : 'bg-slate-50'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const data = await login(form.email, form.password)
      navigate(data.user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      setError(err.response?.data?.error || 'เข้าสู่ระบบไม่สำเร็จ')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className={`w-full max-w-md p-8 rounded-2xl border-2 ${border} ${cardBg}`}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">เข้าสู่ระบบ</h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>ยินดีต้อนรับกลับมา!</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-sm text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">อีเมล</label>
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-lg border-2 ${border} ${inputBg} focus:outline-none focus:border-cyan-500 transition-colors`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">รหัสผ่าน</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-lg border-2 ${border} ${inputBg} focus:outline-none focus:border-cyan-500 transition-colors`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-60"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p className={`mt-6 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          ยังไม่มีบัญชี?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline font-medium">สมัครสมาชิก</Link>
        </p>

        {/* Dev hint */}
        <div className={`mt-4 p-3 rounded-lg text-xs text-center ${isDark ? 'bg-slate-800 text-gray-500' : 'bg-slate-100 text-gray-500'}`}>
          Admin: admin@thaitechzone.com / admin1234
        </div>
      </div>
    </div>
  )
}
