import client from './client'

export const getDashboard = () =>
  client.get('/admin/dashboard')

export const getUsers = (params) =>
  client.get('/admin/users', { params })

export const getEnrollments = (params) =>
  client.get('/admin/enrollments', { params })

export const getPayments = (params) =>
  client.get('/admin/payments', { params })

export const getAdminCourses = (params) =>
  client.get('/admin/courses', { params })
