import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Sun, Moon, Code2, LogOut, User, LayoutDashboard, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ isDark, toggleDark }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isLoggedIn, isAdmin, user, logout } = useAuth()
  const { count: cartCount } = useCart()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinks = [
    { to: '/', label: 'หน้าหลัก' },
    { to: '/courses', label: 'คอร์ส' },
    { to: '/shop', label: 'ร้านค้า' },
    { to: '/about', label: 'เกี่ยวกับ' },
    { to: '/contact', label: 'ติดต่อ' },
  ]

  const navBg = scrolled
    ? isDark
      ? 'bg-slate-950/95 backdrop-blur-md border-b border-slate-800'
      : 'bg-white/95 backdrop-blur-md border-b border-slate-200'
    : 'bg-transparent'

  const linkBase = 'font-medium transition-colors duration-200'
  const linkActive = 'text-cyan-400'
  const linkInactive = isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-500 p-2 rounded-lg">
            <Code2 size={22} className="text-white" />
          </div>
          <span className="font-bold text-xl hidden sm:inline bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            ThaiTechZone
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`${linkBase} ${location.pathname === to ? linkActive : linkInactive}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <Link to="/cart" className={`relative p-2 rounded-lg transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}>
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-white text-[10px] font-bold flex items-center justify-center">{cartCount}</span>
            )}
          </Link>
          <button
            onClick={toggleDark}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-2">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                >
                  <LayoutDashboard size={16} /> Admin
                </Link>
              )}
              <Link
                to="/my-courses"
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'text-gray-300 hover:bg-slate-800' : 'text-gray-700 hover:bg-slate-100'}`}
              >
                <User size={16} /> {user?.firstName}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={16} /> ออกจากระบบ
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/login"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'text-gray-300 hover:bg-slate-800' : 'text-gray-700 hover:bg-slate-100'}`}
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
              >
                สมัครสมาชิก
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={`md:hidden border-t ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <div className="px-4 py-4 space-y-2">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname === to
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : isDark ? 'text-gray-300 hover:bg-slate-800' : 'text-gray-700 hover:bg-slate-100'
                }`}
              >
                {label}
              </Link>
            ))}
            <div className={`border-t pt-2 mt-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="block px-4 py-2 rounded-lg text-cyan-400 font-medium">
                      Admin Dashboard
                    </Link>
                  )}
                  <Link to="/my-courses" className={`block px-4 py-2 rounded-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    คอร์สของฉัน
                  </Link>
                  <Link to="/my-orders" className={`block px-4 py-2 rounded-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    คำสั่งซื้อของฉัน
                  </Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 rounded-lg font-medium text-red-400">
                    ออกจากระบบ
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className={`block px-4 py-2 rounded-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    เข้าสู่ระบบ
                  </Link>
                  <Link to="/register" className="block px-4 py-2 rounded-lg font-medium text-cyan-400">
                    สมัครสมาชิก
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
