import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart') || '[]') } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = (product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.product_id)
      if (existing) {
        return prev.map(i => i.productId === product.product_id
          ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock_quantity) }
          : i)
      }
      return [...prev, { productId: product.product_id, name: product.name, price: parseFloat(product.price), image: (product.images || [])[0] || null, stock: product.stock_quantity, quantity }]
    })
  }

  const updateQty = (productId, quantity) => {
    if (quantity <= 0) return removeItem(productId)
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i))
  }

  const removeItem = (productId) => setItems(prev => prev.filter(i => i.productId !== productId))

  const clearCart = () => setItems([])

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
