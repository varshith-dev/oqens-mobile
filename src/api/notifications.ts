import client from './client'

export const notificationsApi = {
  getAll: () =>
    client.get('/notifications'),

  markAllRead: () =>
    client.post('/notifications/read-all'),
}
