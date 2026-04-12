import React, { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun, ChevronRight, Code2, Zap, BookOpen, Users, Mail, Github, Linkedin, Facebook } from 'lucide-react';

export default function ThaiTechZone() {
  const [isDark, setIsDark] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const bgClass = isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900';
  const cardBgClass = isDark ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-50 hover:bg-slate-100';
  const accentColor = isDark ? 'from-cyan-500 to-blue-500' : 'from-orange-500 to-red-500';
  const borderClass = isDark ? 'border-slate-800' : 'border-slate-200';

  return (
    <div className={`${bgClass} min-h-screen transition-colors duration-300`}>
      {/* Navigation */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled
          ? isDark
            ? 'bg-slate-950/95 backdrop-blur-md border-b border-slate-800'
            : 'bg-white/95 backdrop-blur-md border-b border-slate-200'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className={`bg-gradient-to-br ${accentColor} p-2 rounded-lg`}>
              <Code2 size={24} className="text-white" />
            </div>
            <span className="font-bold text-xl hidden sm:inline bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              ThaiTechZone
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8 items-center">
            {['home', 'courses', 'about', 'contact'].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`capitalize font-medium transition-colors ${
                  currentPage === page
                    ? 'text-cyan-400'
                    : isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Dark Mode Toggle + Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className={`md:hidden border-t ${borderClass} ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
            <div className="px-4 py-4 space-y-3">
              {['home', 'courses', 'about', 'contact'].map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    setCurrentPage(page);
                    setMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 rounded-lg capitalize font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="pt-20">
        {currentPage === 'home' && <HomePage isDark={isDark} accentColor={accentColor} borderClass={borderClass} cardBgClass={cardBgClass} />}
        {currentPage === 'courses' && <CoursesPage isDark={isDark} accentColor={accentColor} cardBgClass={cardBgClass} borderClass={borderClass} />}
        {currentPage === 'about' && <AboutPage isDark={isDark} accentColor={accentColor} borderClass={borderClass} />}
        {currentPage === 'contact' && <ContactPage isDark={isDark} accentColor={accentColor} borderClass={borderClass} />}
      </div>

      {/* Footer */}
      <footer className={`border-t ${borderClass} ${isDark ? 'bg-slate-900/50' : 'bg-gray-50'} mt-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4 text-lg">ThaiTechZone</h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                ศูนย์สอนโปรแกรม LabVIEW และ AI Automation ระดับมืออาชีพ
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className={`space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <li className="hover:text-cyan-400 cursor-pointer transition-colors">Courses</li>
                <li className="hover:text-cyan-400 cursor-pointer transition-colors">Blog</li>
                <li className="hover:text-cyan-400 cursor-pointer transition-colors">Documentation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className={`space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>Email: info@thaitechzone.com</li>
                <li>Phone: +66-XXX-XXXX-XX</li>
                <li>Bangkok, Thailand</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <Facebook size={20} className="hover:text-cyan-400 cursor-pointer transition-colors" />
                <Github size={20} className="hover:text-cyan-400 cursor-pointer transition-colors" />
                <Linkedin size={20} className="hover:text-cyan-400 cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
          <div className={`border-t ${borderClass} pt-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>&copy; 2026 Thai Tech Zone. All rights reserved. | Crafted with passion in Thailand 🇹🇭</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HomePage({ isDark, accentColor, borderClass, cardBgClass }) {
  return (
    <div>
      {/* Hero Section */}
      <section className={`relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-white via-slate-50 to-white'}`}>
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/20 to-transparent rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-3xl opacity-50"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-block">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${accentColor} text-white`}>
                    Welcome to ThaiTechZone
                  </span>
                </div>
                <h1 className={`text-5xl md:text-6xl font-bold leading-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Master <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">LabVIEW</span> & AI Automation
                </h1>
                <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  ศูนย์สอนโปรแกรม LabVIEW, N8N AI Automation, Python, Robotics สำหรับนักวิชาการ นักเรียน นักศึกษา และผู้สนใจด้าน IoT, Automation
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className={`px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 bg-gradient-to-r ${accentColor} text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all transform hover:scale-105`}>
                  เริ่มเรียนรู้ <ChevronRight size={20} />
                </button>
                <button className={`px-8 py-4 rounded-lg font-semibold border-2 ${borderClass} ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} transition-colors`}>
                  ดูคอร์สทั้งหมด
                </button>
              </div>

              <div className="flex gap-6 pt-8">
                <div>
                  <p className="text-2xl font-bold text-cyan-400">500+</p>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>นักเรียนที่ประสบความสำเร็จ</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-cyan-400">100+</p>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>โครงการการเรียนรู้</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-cyan-400">24/7</p>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>การสนับสนุน</p>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative h-96 md:h-full">
              <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} rounded-3xl opacity-10 blur-3xl`}></div>
              <div className={`relative h-full rounded-3xl border-2 ${borderClass} ${isDark ? 'bg-slate-800/50' : 'bg-slate-100/50'} backdrop-blur-sm flex items-center justify-center`}>
                <div className="text-center">
                  <Code2 size={80} className="mx-auto mb-4 text-cyan-400 opacity-50" />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>LabVIEW & AI Automation Platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">ทำไมเลือก ThaiTechZone?</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: 'เนื้อหาเชิงลึก', desc: 'คอร์สที่ออกแบบมาเพื่อให้ความรู้จริงจากผู้เชี่ยวชาญ' },
            { icon: BookOpen, title: 'การสอนระดับมืออาชีพ', desc: 'เรียนรู้จากผู้เชี่ยวชาญที่มีประสบการณ์การทำงาน' },
            { icon: Users, title: 'ชุมชนที่สนับสนุน', desc: 'เข้าร่วมชุมชมนักเรียนและผู้สอนที่ใช้งาน' },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className={`p-8 rounded-2xl border-2 ${borderClass} ${isDark ? 'bg-slate-900/50 hover:bg-slate-800/50' : 'bg-slate-50/50 hover:bg-slate-100/50'} transition-all transform hover:-translate-y-2 group cursor-pointer`}
              >
                <div className="mb-4 inline-block p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 group-hover:from-cyan-500/40 group-hover:to-blue-500/40 transition-colors">
                  <Icon className="text-cyan-400" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className={`relative overflow-hidden border-t border-b ${borderClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl font-bold mb-6">พร้อมจะเริ่มต้นแล้วหรือ?</h2>
          <p className={`text-xl mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            เลือกคอร์สของคุณและเริ่มต้นการศึกษาของคุณวันนี้
          </p>
          <button className={`px-12 py-4 rounded-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all transform hover:scale-105`}>
            ลงทะเบียนเลย
          </button>
        </div>
      </section>
    </div>
  );
}

function CoursesPage({ isDark, accentColor, cardBgClass, borderClass }) {
  const courses = [
    {
      title: 'LabVIEW Fundamentals',
      desc: 'เรียนรู้พื้นฐาน LabVIEW จากเบื้องต้น',
      level: 'Beginner',
      students: '250+',
      icon: '🎓'
    },
    {
      title: 'Advanced LabVIEW',
      desc: 'โปรแกรมขั้นสูง LabVIEW สำหรับการประยุกต์จริง',
      level: 'Advanced',
      students: '120+',
      icon: '⚙️'
    },
    {
      title: 'N8N AI Automation',
      desc: 'สร้างระบบอัตโนมัติด้วย N8N และ AI',
      level: 'Intermediate',
      students: '180+',
      icon: '🤖'
    },
    {
      title: 'Python for IoT',
      desc: 'พัฒนาระบบ IoT ด้วย Python',
      level: 'Intermediate',
      students: '95+',
      icon: '🐍'
    },
    {
      title: 'Robotics Control',
      desc: 'ควบคุมหุ่นยนต์ด้วย LabVIEW',
      level: 'Advanced',
      students: '65+',
      icon: '🤖'
    },
    {
      title: 'Data Visualization',
      desc: 'สร้างแดชบอร์ด และ visualizations',
      level: 'Intermediate',
      students: '140+',
      icon: '📊'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">คอร์สเรียนของเรา</h1>
        <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          เลือกคอร์สที่เหมาะกับระดับของคุณและเริ่มเรียนรู้วันนี้
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, i) => (
          <div
            key={i}
            className={`p-6 rounded-2xl border-2 ${borderClass} ${cardBgClass} transition-all transform hover:-translate-y-2 cursor-pointer group`}
          >
            <div className="text-4xl mb-4">{course.icon}</div>
            <h3 className="text-xl font-bold mb-2">{course.title}</h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{course.desc}</p>

            <div className="flex justify-between items-center mb-4 pb-4 border-t border-b" style={{borderColor: isDark ? '#1e293b' : '#e2e8f0'}}>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-orange-500/20 text-orange-600'}`}>
                {course.level}
              </span>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {course.students} นักเรียน
              </span>
            </div>

            <button className={`w-full py-2 rounded-lg font-semibold bg-gradient-to-r ${accentColor} text-white group-hover:shadow-lg transition-all`}>
              ดูรายละเอียด
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutPage({ isDark, accentColor, borderClass }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <h1 className="text-4xl font-bold mb-6">เกี่ยวกับเรา</h1>
          <p className={`text-lg mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Thai Tech Zone ก่อตั้งขึ้นเพื่อนำเสนอการศึกษาด้านเทคโนโลยีขั้นสูงแก่นักเรียนชาวไทย
          </p>
          <p className={`text-lg mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            เรามุ่งเน้นที่การสอน LabVIEW, N8N AI Automation, Python, Robotics และเทคโนโลยีอื่น ๆ ที่เป็นแนวหน้า
          </p>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            ด้วยอาจารย์ผู้มีประสบการณ์ และหลักสูตรที่ทันสมัย เรากำลังสร้างความฝันของนักศึกษาเป็นจริง
          </p>
        </div>
        <div className={`h-96 rounded-3xl border-2 ${borderClass} ${isDark ? 'bg-slate-800/50' : 'bg-slate-100/50'} backdrop-blur-sm flex items-center justify-center`}>
          <Users size={80} className="text-cyan-400/50" />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          { number: '5+', label: 'ปีประสบการณ์' },
          { number: '500+', label: 'นักเรียนที่ประสบความสำเร็จ' },
          { number: '20+', label: 'คอร์สที่มีคุณภาพ' },
        ].map((stat, i) => (
          <div key={i} className={`text-center p-8 rounded-2xl border-2 ${borderClass}`}>
            <p className="text-4xl font-bold text-cyan-400 mb-2">{stat.number}</p>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactPage({ isDark, accentColor, borderClass }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">ติดต่อเรา</h1>
        <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          มีคำถามหรือต้องการข้อมูลเพิ่มเติม? เราอยู่ที่นี่เพื่อช่วยเหลือ
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className={`p-8 rounded-2xl border-2 ${borderClass}`}>
          <h2 className="text-2xl font-bold mb-6">ส่งข้อความถึงเรา</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">ชื่อ</label>
              <input
                type="text"
                className={`w-full px-4 py-2 rounded-lg border-2 ${borderClass} ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} focus:outline-none focus:border-cyan-500 transition-colors`}
                placeholder="ชื่อของคุณ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">อีเมล</label>
              <input
                type="email"
                className={`w-full px-4 py-2 rounded-lg border-2 ${borderClass} ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} focus:outline-none focus:border-cyan-500 transition-colors`}
                placeholder="อีเมลของคุณ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ข้อความ</label>
              <textarea
                rows="5"
                className={`w-full px-4 py-2 rounded-lg border-2 ${borderClass} ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} focus:outline-none focus:border-cyan-500 transition-colors`}
                placeholder="ข้อความของคุณ"
              ></textarea>
            </div>
            <button className={`w-full py-3 rounded-lg font-semibold bg-gradient-to-r ${accentColor} text-white hover:shadow-lg transition-all`}>
              ส่งข้อความ
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-8">
          <div className={`p-8 rounded-2xl border-2 ${borderClass}`}>
            <Mail className="text-cyan-400 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">อีเมล</h3>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>info@thaitechzone.com</p>
          </div>
          <div className={`p-8 rounded-2xl border-2 ${borderClass}`}>
            <Users className="text-cyan-400 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">โทรศัพท์</h3>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>+66-XXX-XXXX-XX</p>
          </div>
          <div className={`p-8 rounded-2xl border-2 ${borderClass}`}>
            <Users className="text-cyan-400 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">ที่อยู่</h3>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Bangkok, Thailand</p>
          </div>
        </div>
      </div>
    </div>
  );
}
