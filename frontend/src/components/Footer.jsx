import { Link } from 'react-router-dom'
import { Code2, Facebook, Github, Linkedin } from 'lucide-react'

export default function Footer({ isDark }) {
  const border = isDark ? 'border-slate-800' : 'border-slate-200'
  const muted = isDark ? 'text-gray-400' : 'text-gray-600'
  const bg = isDark ? 'bg-slate-900/50' : 'bg-slate-50'

  return (
    <footer className={`border-t ${border} ${bg} mt-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-500 p-1.5 rounded-lg">
                <Code2 size={18} className="text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                ThaiTechZone
              </span>
            </div>
            <p className={muted}>ศูนย์สอนโปรแกรม LabVIEW และ AI Automation ระดับมืออาชีพ</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">เมนูหลัก</h4>
            <ul className={`space-y-2 ${muted}`}>
              {[
                { to: '/courses', label: 'คอร์สเรียน' },
                { to: '/about', label: 'เกี่ยวกับเรา' },
                { to: '/contact', label: 'ติดต่อ' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-cyan-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">ติดต่อ</h4>
            <ul className={`space-y-2 ${muted}`}>
              <li>info@thaitechzone.com</li>
              <li>+66-XXX-XXXX-XX</li>
              <li>Bangkok, Thailand</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">ติดตามเรา</h4>
            <div className="flex gap-4">
              {[Facebook, Github, Linkedin].map((Icon, i) => (
                <Icon key={i} size={20} className={`${muted} hover:text-cyan-400 cursor-pointer transition-colors`} />
              ))}
            </div>
          </div>
        </div>

        <div className={`border-t ${border} pt-8 text-center ${muted}`}>
          <p>&copy; 2026 Thai Tech Zone. All rights reserved. | Crafted with passion in Thailand 🇹🇭</p>
        </div>
      </div>
    </footer>
  )
}
