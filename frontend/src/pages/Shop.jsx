import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Search, Package, Star } from 'lucide-react'
import { getProducts } from '../api/products'
import { useCart } from '../context/CartContext'

const CATEGORIES = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'development_board', label: 'Development Board' },
  { value: 'sensor', label: 'Sensor' },
  { value: 'module', label: 'Module' },
  { value: 'kit', label: 'Starter Kit' },
  { value: 'accessory', label: 'อุปกรณ์เสริม' },
]

function ProductCard({ product, isDark, onAdd }) {
  const image = (product.images || [])[0]
  const border = isDark ? 'border-slate-800' : 'border-slate-200'
  const cardBg = isDark ? 'bg-slate-900' : 'bg-white'

  return (
    <div className={`group rounded-2xl border-2 ${border} ${cardBg} overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10`}>
      <Link to={`/shop/${product.product_id}`}>
        <div className={`relative aspect-square overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          {image
            ? <img src={image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            : <div className="w-full h-full flex items-center justify-center"><Package size={48} className="text-slate-500" /></div>
          }
          {product.is_featured && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500 text-white">แนะนำ</span>
          )}
          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">หมด</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <p className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{product.sku}</p>
        <Link to={`/shop/${product.product_id}`}>
          <h3 className="font-semibold leading-snug mb-2 hover:text-cyan-400 transition-colors line-clamp-2">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-cyan-400">฿{Number(product.price).toLocaleString()}</span>
          <button
            onClick={() => onAdd(product)}
            disabled={product.stock_quantity === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={14} /> ใส่ตะกร้า
          </button>
        </div>
        <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {product.stock_quantity > 0 ? `เหลือ ${product.stock_quantity} ชิ้น` : 'สินค้าหมด'}
        </p>
      </div>
    </div>
  )
}

export default function Shop({ isDark }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [added, setAdded] = useState(null)
  const { addItem } = useCart()
  const border = isDark ? 'border-slate-800' : 'border-slate-200'
  const muted = isDark ? 'text-gray-400' : 'text-gray-600'

  useEffect(() => {
    setLoading(true)
    getProducts({ category: category || undefined, search: search || undefined, limit: 50 })
      .then(({ data }) => setProducts(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [category, search])

  const handleAdd = (product) => {
    addItem(product)
    setAdded(product.product_id)
    setTimeout(() => setAdded(null), 1500)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">ร้านค้า</h1>
        <p className={muted}>บอร์ดทดลองและอุปกรณ์อิเล็กทรอนิกส์</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className={`relative flex-1 max-w-xs`}>
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาสินค้า..."
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border ${border} ${isDark ? 'bg-slate-900 text-white' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm`}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                category === c.value
                  ? 'bg-cyan-500 text-white border-cyan-500'
                  : `${border} ${muted} hover:border-cyan-500/50`
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {added && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-green-500 text-white text-sm font-semibold shadow-lg animate-bounce">
          เพิ่มในตะกร้าแล้ว!
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`rounded-2xl border-2 ${border} animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'} aspect-[3/4]`} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed ${border}`}>
          <Package size={48} className={`${muted} mb-3`} />
          <p className={muted}>ไม่พบสินค้า</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => (
            <ProductCard key={p.id} product={p} isDark={isDark} onAdd={handleAdd} />
          ))}
        </div>
      )}
    </div>
  )
}
