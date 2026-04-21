import { useState, useEffect } from 'react'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'
import { getMyOrders } from '../api/orders'

const STATUS_LABEL = { pending: 'รอยืนยัน', confirmed: 'ยืนยันแล้ว', shipped: 'จัดส่งแล้ว', delivered: 'ได้รับแล้ว', cancelled: 'ยกเลิก' }
const STATUS_COLOR = { pending: 'text-yellow-400 bg-yellow-500/10', confirmed: 'text-blue-400 bg-blue-500/10', shipped: 'text-cyan-400 bg-cyan-500/10', delivered: 'text-green-400 bg-green-500/10', cancelled: 'text-red-400 bg-red-500/10' }
const PAY_COLOR = { pending: 'text-yellow-400', paid: 'text-green-400' }

export default function MyOrders({ isDark }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const border = isDark ? 'border-slate-800' : 'border-slate-200'
  const cardBg = isDark ? 'bg-slate-900' : 'bg-slate-50'
  const muted = isDark ? 'text-gray-400' : 'text-gray-600'

  useEffect(() => {
    getMyOrders()
      .then(({ data }) => setOrders(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-20 space-y-3">
      {[...Array(3)].map((_, i) => <div key={i} className={`h-24 rounded-2xl border-2 ${border} animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />)}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
      <h1 className="text-3xl font-bold mb-8">คำสั่งซื้อของฉัน</h1>

      {orders.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed ${border}`}>
          <Package size={48} className={`${muted} mb-3`} />
          <p className={muted}>ยังไม่มีคำสั่งซื้อ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className={`rounded-2xl border-2 ${border} ${cardBg} overflow-hidden`}>
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="space-y-1">
                  <p className="font-mono text-sm text-cyan-400">#{order.order_id.slice(0, 8).toUpperCase()}</p>
                  <p className={`text-xs ${muted}`}>{new Date(order.created_at).toLocaleDateString('th-TH')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[order.status] || ''}`}>
                    {STATUS_LABEL[order.status] || order.status}
                  </span>
                  <span className={`text-sm font-bold ${PAY_COLOR[order.payment_status] || ''}`}>
                    {order.payment_status === 'paid' ? 'ชำระแล้ว' : 'รอชำระ'}
                  </span>
                  <span className="font-bold text-cyan-400">฿{Number(order.total_amount).toLocaleString()}</span>
                  {expanded === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {expanded === order.id && (
                <div className={`border-t ${border} p-4 space-y-4`}>
                  <div>
                    <p className={`text-xs font-semibold ${muted} mb-2`}>รายการสินค้า</p>
                    <div className="space-y-1.5">
                      {(order.items || []).map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{item.name} x{item.quantity}</span>
                          <span className="font-medium">฿{Number(item.subtotal).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={`text-sm ${muted} space-y-1`}>
                    <p>จัดส่งไปยัง: <span className="text-current font-medium">{order.shipping_name} — {order.shipping_address} {order.shipping_city} {order.shipping_postal}</span></p>
                    <p>โทร: <span className="text-current font-medium">{order.shipping_phone}</span></p>
                    <p>ชำระผ่าน: <span className="text-current font-medium">{order.payment_method === 'bank_transfer' ? 'โอนเงิน' : 'เก็บปลายทาง'}</span></p>
                    {order.notes && <p>หมายเหตุ: <span className="text-current">{order.notes}</span></p>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
