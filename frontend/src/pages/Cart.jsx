import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart, ChevronLeft, Package } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrder } from '../api/orders'

const EMPTY_SHIPPING = { name: '', phone: '', address: '', city: '', postal: '' }

export default function Cart({ isDark }) {
  const { items, updateQty, removeItem, clearCart, total } = useCart()
  const { isLoggedIn, user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState('cart') // cart | checkout | success
  const [shipping, setShipping] = useState({ ...EMPTY_SHIPPING, name: user ? `${user.firstName} ${user.lastName}` : '', phone: user?.phone || '' })
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [orderId, setOrderId] = useState(null)

  const border = isDark ? 'border-slate-800' : 'border-slate-200'
  const cardBg = isDark ? 'bg-slate-900' : 'bg-slate-50'
  const muted = isDark ? 'text-gray-400' : 'text-gray-600'
  const inputCls = `w-full px-3 py-2.5 rounded-xl border ${border} ${isDark ? 'bg-slate-800 text-white' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm`

  const setS = (k, v) => setShipping(s => ({ ...s, [k]: v }))

  const handleCheckout = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) return navigate('/login')
    setLoading(true)
    setError(null)
    try {
      const { data } = await createOrder({
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        shippingName: shipping.name,
        shippingPhone: shipping.phone,
        shippingAddress: shipping.address,
        shippingCity: shipping.city,
        shippingPostal: shipping.postal,
        paymentMethod,
        notes,
      })
      setOrderId(data.data.order_id)
      clearCart()
      setStep('success')
    } catch (err) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
        <ShoppingCart size={36} className="text-green-400" />
      </div>
      <h1 className="text-3xl font-bold mb-3">สั่งซื้อสำเร็จ!</h1>
      <p className={`${muted} mb-2`}>หมายเลขคำสั่งซื้อ: <span className="font-mono text-cyan-400">{orderId?.slice(0, 8).toUpperCase()}</span></p>
      <p className={`${muted} text-sm mb-8`}>กรุณาชำระเงินและแจ้งสลิปผ่านช่องทาง Line หรือ Email</p>
      <div className="flex gap-3 justify-center">
        <Link to="/my-orders" className="px-6 py-3 rounded-xl bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition-colors">ดูคำสั่งซื้อ</Link>
        <Link to="/shop" className={`px-6 py-3 rounded-xl border ${border} font-semibold hover:border-cyan-500/50 transition-colors`}>ซื้อต่อ</Link>
      </div>
    </div>
  )

  if (items.length === 0) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <Package size={64} className={`${muted} mx-auto mb-4`} />
      <h2 className="text-2xl font-bold mb-2">ตะกร้าว่าง</h2>
      <p className={`${muted} mb-6`}>ยังไม่มีสินค้าในตะกร้า</p>
      <Link to="/shop" className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold">เลือกซื้อสินค้า</Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <button onClick={() => step === 'checkout' ? setStep('cart') : navigate('/shop')}
        className={`flex items-center gap-2 mb-8 ${muted} hover:text-cyan-400 transition-colors`}>
        <ChevronLeft size={20} /> {step === 'checkout' ? 'กลับไปตะกร้า' : 'ซื้อต่อ'}
      </button>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <h1 className="text-2xl font-bold mb-4">{step === 'cart' ? 'ตะกร้าสินค้า' : 'ที่อยู่จัดส่ง'}</h1>

          {step === 'cart' && items.map(item => (
            <div key={item.productId} className={`flex gap-4 p-4 rounded-2xl border-2 ${border} ${cardBg}`}>
              <div className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                {item.image
                  ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Package size={24} className="text-slate-500" /></div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold leading-snug truncate">{item.name}</p>
                <p className="text-cyan-400 font-bold mt-1">฿{Number(item.price).toLocaleString()}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className={`flex items-center gap-1 border ${border} rounded-lg p-0.5`}>
                    <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="p-1 hover:bg-slate-700/30 rounded transition-colors"><Minus size={14} /></button>
                    <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, Math.min(item.stock, item.quantity + 1))} className="p-1 hover:bg-slate-700/30 rounded transition-colors"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="font-bold text-right shrink-0">฿{(item.price * item.quantity).toLocaleString()}</div>
            </div>
          ))}

          {step === 'checkout' && (
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-3">
              {[
                { key: 'name', label: 'ชื่อ-นามสกุล', placeholder: 'ชื่อผู้รับ' },
                { key: 'phone', label: 'เบอร์โทร', placeholder: '08x-xxx-xxxx' },
                { key: 'address', label: 'ที่อยู่', placeholder: 'บ้านเลขที่ ซอย ถนน' },
                { key: 'city', label: 'เมือง/อำเภอ', placeholder: 'กรุงเทพฯ' },
                { key: 'postal', label: 'รหัสไปรษณีย์', placeholder: '10100' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className={`block text-xs font-semibold mb-1 ${muted}`}>{label} *</label>
                  <input required value={shipping[key]} onChange={e => setS(key, e.target.value)} placeholder={placeholder} className={inputCls} />
                </div>
              ))}
              <div>
                <label className={`block text-xs font-semibold mb-1 ${muted}`}>วิธีชำระเงิน</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className={inputCls}>
                  <option value="bank_transfer">โอนเงิน (PromptPay/บัญชีธนาคาร)</option>
                  <option value="cod">เก็บเงินปลายทาง (COD)</option>
                </select>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${muted}`}>หมายเหตุ</label>
                <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="ข้อความเพิ่มเติม..." className={inputCls} />
              </div>
              {error && <div className="p-3 rounded-xl bg-red-500/20 text-red-400 text-sm">{error}</div>}
            </form>
          )}
        </div>

        {/* Order Summary */}
        <div className={`p-5 rounded-2xl border-2 ${border} ${cardBg} h-fit sticky top-24 space-y-4`}>
          <h3 className="font-bold text-lg">สรุปคำสั่งซื้อ</h3>
          <div className={`space-y-2 text-sm border-b pb-4 ${border}`}>
            {items.map(i => (
              <div key={i.productId} className="flex justify-between">
                <span className={`${muted} truncate mr-2`}>{i.name} x{i.quantity}</span>
                <span className="shrink-0">฿{(i.price * i.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>รวม</span>
            <span className="text-cyan-400">฿{total.toLocaleString()}</span>
          </div>
          {step === 'cart' ? (
            <button
              onClick={() => isLoggedIn ? setStep('checkout') : navigate('/login')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
            >
              {isLoggedIn ? 'ดำเนินการสั่งซื้อ' : 'เข้าสู่ระบบเพื่อสั่งซื้อ'}
            </button>
          ) : (
            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-60"
            >
              {loading ? 'กำลังสั่งซื้อ...' : 'ยืนยันคำสั่งซื้อ'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
