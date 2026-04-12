import { useState, useEffect } from 'react'
import { Users, BookOpen, TrendingUp, DollarSign } from 'lucide-react'
import { getDashboard } from '../api/admin'

export default function Admin({ isDark }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const border = isDark ? 'border-slate-800' : 'border-slate-200'
  const cardBg = isDark ? 'bg-slate-900' : 'bg-slate-50'
  const muted = isDark ? 'text-gray-400' : 'text-gray-600'

  useEffect(() => {
    getDashboard()
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`h-28 rounded-2xl border-2 ${border} animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
        ))}
      </div>
    </div>
  )

  const stats = [
    { label: 'ผู้ใช้ทั้งหมด', value: data?.stats?.totalUsers ?? 0, Icon: Users, color: 'text-cyan-400' },
    { label: 'คอร์สทั้งหมด', value: data?.stats?.totalCourses ?? 0, Icon: BookOpen, color: 'text-blue-400' },
    { label: 'การลงทะเบียน', value: data?.stats?.totalEnrollments ?? 0, Icon: TrendingUp, color: 'text-purple-400' },
    { label: 'รายได้รวม (฿)', value: Number(data?.stats?.totalRevenue ?? 0).toLocaleString(), Icon: DollarSign, color: 'text-green-400' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, Icon, color }) => (
          <div key={label} className={`p-6 rounded-2xl border-2 ${border} ${cardBg}`}>
            <Icon size={24} className={`${color} mb-3`} />
            <p className="text-2xl font-bold">{value}</p>
            <p className={`text-sm ${muted}`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Course Stats */}
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

      {/* Recent Payments */}
      {data?.recentPayments?.length > 0 && (
        <div className={`p-6 rounded-2xl border-2 ${border} ${cardBg}`}>
          <h2 className="text-xl font-bold mb-4">การชำระเงินล่าสุด</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${border}`}>
                  {['อีเมล', 'คอร์ส', 'จำนวน', 'สถานะ'].map((h) => (
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
                      <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
