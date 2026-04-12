import client from './client'

export const enroll = (courseId) =>
  client.post('/enrollment/enroll', { courseId })

export const getMyCourses = (params) =>
  client.get('/enrollment/my-courses', { params })

export const getEnrollment = (id) =>
  client.get(`/enrollment/${id}`)

export const updateProgress = (id, progressPercentage) =>
  client.put(`/enrollment/${id}/progress`, { progressPercentage })

export const cancelEnrollment = (id) =>
  client.delete(`/enrollment/${id}`)
