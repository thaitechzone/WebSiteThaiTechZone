import { useNavigate } from 'react-router-dom'
import { ChevronRight, Zap, BookOpen, Users } from 'lucide-react'

export default function Home({ isDark }) {
  const navigate = useNavigate()
  const border = isDark ? 'border-slate-800' : 'border-slate-200'
  const muted = isDark ? 'text-gray-400' : 'text-gray-600'
  const card = isDark ? 'bg-slate-900/50 hover:bg-slate-800/50' : 'bg-slate-50/50 hover:bg-slate-100/50'

  return (
    <div>
      {/* Hero */}
      <section className={`relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-white via-slate-50 to-white'}`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                  ยินดีต้อนรับสู่ ThaiTechZone
                </span>
                <h1 className={`text-5xl md:text-6xl font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Master{' '}
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    LabVIEW
                  </span>{' '}
                  & AI Automation
                </h1>
                <p className={`text-xl ${muted}`}>
                  ศูนย์สอนโปรแกรม LabVIEW, N8N AI Automation, Python, Robotics สำหรับนักวิชาการ นักเรียน นักศึกษา และผู้สนใจด้าน IoT
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/courses')}
                  className="px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all transform hover:scale-105"
                >
                  เริ่มเรียนรู้ <ChevronRight size={20} />
                </button>
                <button
                  onClick={() => navigate('/courses')}
                  className={`px-8 py-4 rounded-lg font-semibold border-2 ${border} ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} transition-colors`}
                >
                  ดูคอร์สทั้งหมด
                </button>
              </div>

              <div className="flex gap-8 pt-4">
                {[['500+', 'นักเรียน'], ['100+', 'โครงการ'], ['24/7', 'Support']].map(([num, label]) => (
                  <div key={label}>
                    <p className="text-2xl font-bold text-cyan-400">{num}</p>
                    <p className={`text-sm ${muted}`}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-80 md:h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-3xl opacity-10 blur-3xl" />
              <div className={`relative h-full rounded-3xl border-2 ${border} ${isDark ? 'bg-slate-800/50' : 'bg-slate-100/50'} backdrop-blur-sm flex items-center justify-center`}>
                <div className="text-center">
                  <div className="text-7xl mb-4">⚙️</div>
                  <p className={muted}>LabVIEW & AI Automation Platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">ทำไมเลือก ThaiTechZone?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { Icon: Zap, title: 'เนื้อหาเชิงลึก', desc: 'คอร์สออกแบบมาเพื่อให้ความรู้จริงจากผู้เชี่ยวชาญในสายงาน' },
            { Icon: BookOpen, title: 'การสอนระดับมืออาชีพ', desc: 'เรียนรู้จากผู้เชี่ยวชาญที่มีประสบการณ์ในอุตสาหกรรม' },
            { Icon: Users, title: 'ชุมชนที่สนับสนุน', desc: 'เข้าร่วมชุมชนนักเรียนและผู้สอนที่พร้อมช่วยเหลือกัน' },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className={`p-8 rounded-2xl border-2 ${border} ${card} transition-all duration-300 transform hover:-translate-y-2 group cursor-default`}>
              <div className="mb-4 inline-block p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 group-hover:from-cyan-500/40 group-hover:to-blue-500/40 transition-colors">
                <Icon className="text-cyan-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">{title}</h3>
              <p className={muted}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={`relative overflow-hidden border-t border-b ${border} bg-gradient-to-r from-cyan-500/5 to-blue-500/5`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl font-bold mb-6">พร้อมจะเริ่มต้นแล้วหรือ?</h2>
          <p className={`text-xl mb-8 ${muted}`}>เลือกคอร์สของคุณและเริ่มต้นการศึกษาวันนี้</p>
          <button
            onClick={() => navigate('/register')}
            className="px-12 py-4 rounded-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all transform hover:scale-105"
          >
            ลงทะเบียนเลย ✨
          </button>
        </div>
      </section>
    </div>
  )
}
