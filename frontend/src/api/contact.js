import client from './client'

export const submitContact = (data) =>
  client.post('/contact/submit', data)

export const getMessages = (params) =>
  client.get('/contact', { params })

export const getMessage = (id) =>
  client.get(`/contact/${id}`)

export const replyMessage = (id, replyMessage) =>
  client.put(`/contact/${id}/reply`, { replyMessage })
