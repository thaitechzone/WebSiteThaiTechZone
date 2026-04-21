import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'

import Home from './pages/Home'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import MyCourses from './pages/MyCourses'
import Admin from './pages/Admin'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import MyOrders from './pages/MyOrders'

export default function App() {
  const [isDark, setIsDark] = useState(true)
  const bg = isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className={`${bg} min-h-screen transition-colors duration-300`}>
            <Navbar isDark={isDark} toggleDark={() => setIsDark(!isDark)} />
            <main className="pt-20">
              <Routes>
                <Route path="/" element={<Home isDark={isDark} />} />
                <Route path="/courses" element={<Courses isDark={isDark} />} />
                <Route path="/courses/:id" element={<CourseDetail isDark={isDark} />} />
                <Route path="/shop" element={<Shop isDark={isDark} />} />
                <Route path="/shop/:id" element={<ProductDetail isDark={isDark} />} />
                <Route path="/cart" element={<Cart isDark={isDark} />} />
                <Route path="/about" element={<About isDark={isDark} />} />
                <Route path="/contact" element={<Contact isDark={isDark} />} />
                <Route path="/login" element={<Login isDark={isDark} />} />
                <Route path="/register" element={<Register isDark={isDark} />} />
                <Route path="/my-courses" element={
                  <ProtectedRoute><MyCourses isDark={isDark} /></ProtectedRoute>
                } />
                <Route path="/my-orders" element={
                  <ProtectedRoute><MyOrders isDark={isDark} /></ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <AdminRoute><Admin isDark={isDark} /></AdminRoute>
                } />
              </Routes>
            </main>
            <Footer isDark={isDark} />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
