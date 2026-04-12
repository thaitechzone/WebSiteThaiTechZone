import { Users } from 'lucide-react'

export default function About({ isDark }) {
  const border = isDark ? 'border-slate-800' : 'border-slate-200'
  const muted = isDark ? 'text-gray-300' : 'text-gray-600'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <h1 className="text-4xl font-bold mb-6">เกี่ยวกับเรา</h1>
          <p className={`text-lg mb-4 ${muted}`}>
            Thai Tech Zone ก่อตั้งขึ้นเพื่อนำเสนอการศึกษาด้านเทคโนโลยีขั้นสูงแก่นักเรียนชาวไทย
          </p>
          <p className={`text-lg mb-4 ${muted}`}>
            เรามุ่งเน้นที่การสอน LabVIEW, N8N AI Automation, Python, Robotics และเทคโนโลยีที่เป็นแนวหน้า
          </p>
          <p className={`text-lg ${muted}`}>
            ด้วยอาจารย์ผู้มีประสบการณ์และหลักสูตรที่ทันสมัย เรากำลังสร้างความฝันของนักศึกษาให้เป็นจริง
          </p>
        </div>
        <div className={`h-96 rounded-3xl border-2 ${border} ${isDark ? 'bg-slate-800/50' : 'bg-slate-100/50'} backdrop-blur-sm flex items-center justify-center`}>
          <Users size={80} className="text-cyan-400 opacity-50" />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          { number: '5+', label: 'ปีประสบการณ์' },
          { number: '500+', label: 'นักเรียนที่ประสบความสำเร็จ' },
          { number: '20+', label: 'คอร์สที่มีคุณภาพ' },
        ].map(({ number, label }) => (
          <div key={label} className={`text-center p-8 rounded-2xl border-2 ${border}`}>
            <p className="text-4xl font-bold text-cyan-400 mb-2">{number}</p>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
