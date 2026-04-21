import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, ShoppingCart, Package, Plus, Minus } from 'lucide-react'
import { getProduct } from '../api/products'
import { useCart } from '../context/CartContext'

export default function ProductDetail({ isDark }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [selectedImg, setSelectedImg] = useState(0)
  const [added, setAdded] = useState(false)

  const border = isDark ? 'border-slate-800' : 'border-slate-200'
  const muted = isDark ? 'text-gray-400' : 'text-gray-600'
  const cardBg = isDark ? 'bg-slate-900' : 'bg-slate-50'

  useEffect(() => {
    getProduct(id)
      .then(({ data }) => setProduct(data.data))
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAdd = () => {
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <div className={`h-96 rounded-2xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
    </div>
  )
  if (!product) return null

  const images = product.images || []
  const specs = product.specs || {}

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <button
        onClick={() => navigate('/shop')}
        className={`flex items-center gap-2 mb-8 ${muted} hover:text-cyan-400 transition-colors`}
      >
        <ChevronLeft size={20} /> กลับไปร้านค้า
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className={`aspect-square rounded-2xl border-2 ${border} overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'} mb-3`}>
            {images[selectedImg]
              ? <img src={images[selectedImg]} alt={product.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><Package size={64} className="text-slate-500" /></div>
            }
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImg(i)}
                  className={`w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${selectedImg === i ? 'border-cyan-400' : border}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <p className={`text-sm mb-1 ${muted}`}>{product.sku} · {product.category}</p>
            <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
            <p className={`${muted} leading-relaxed`}>{product.description}</p>
          </div>

          <div className="text-3xl font-bold text-cyan-400">
            ฿{Number(product.price).toLocaleString()}
          </div>

          <p className={`text-sm ${product.stock_quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {product.stock_quantity > 0 ? `✓ มีสินค้า ${product.stock_quantity} ชิ้น` : '✗ สินค้าหมด'}
          </p>

          {product.stock_quantity > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${muted}`}>จำนวน:</span>
                <div className={`flex items-center gap-2 border ${border} rounded-lg p-1`}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className={`p-1 rounded hover:bg-slate-700/30 transition-colors`}>
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-semibold">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock_quantity, q + 1))}
                    className={`p-1 rounded hover:bg-slate-700/30 transition-colors`}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <button
                onClick={handleAdd}
                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  added
                    ? 'bg-green-500 text-white'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/30'
                }`}
              >
                <ShoppingCart size={18} />
                {added ? 'เพิ่มในตะกร้าแล้ว!' : 'เพิ่มในตะกร้า'}
              </button>
              <Link to="/cart"
                className={`block w-full py-3 rounded-xl font-semibold text-center border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 transition-colors`}>
                ดูตะกร้า
              </Link>
            </div>
          )}

          {/* Specs */}
          {Object.keys(specs).length > 0 && (
            <div className={`p-4 rounded-xl border ${border} ${cardBg}`}>
              <h3 className="font-semibold mb-3">ข้อมูลจำเพาะ</h3>
              <dl className="space-y-2">
                {Object.entries(specs).map(([k, v]) => (
                  <div key={k} className="flex gap-3 text-sm">
                    <dt className={`${muted} min-w-24`}>{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
