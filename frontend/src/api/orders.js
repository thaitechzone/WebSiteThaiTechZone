import client from './client'

export const createOrder = (data) => client.post('/orders', data)
export const getMyOrders = (params) => client.get('/orders/my', { params })
export const getAdminOrders = (params) => client.get('/orders', { params })
export const updateOrderStatus = (id, data) => client.put(`/orders/${id}/status`, data)
