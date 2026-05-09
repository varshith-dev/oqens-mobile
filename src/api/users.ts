import client from './client'

export const usersApi = {
  getProfile: (username: string) =>
    client.get(`/users/${username}`),

  updateProfile: (data: FormData | object) =>
    client.patch('/users/me', data),

  checkUsername: (username: string) =>
    client.get('/users/check-username', { params: { username } }),

  follow: (userId: string) =>
    client.post(`/users/${userId}/follow`),

  unfollow: (userId: string) =>
    client.delete(`/users/${userId}/follow`),

  getFollowers: (username: string) =>
    client.get(`/users/${username}/followers`),

  getFollowing: (username: string) =>
    client.get(`/users/${username}/following`),

  getBlocked: () =>
    client.get('/users/blocked'),

  blockUser: (userId: string) =>
    client.post(`/users/${userId}/block`),

  unblockUser: (userId: string) =>
    client.delete(`/users/blocked/${userId}`),

  reportUser: (userId: string, reason: string) =>
    client.post(`/users/${userId}/report`, { reason }),

  savePushToken: (token: string) =>
    client.post('/users/me/push-token', { token }),

  getSettings: () =>
    client.get('/users/me/settings'),

  updateSettings: (data: object) =>
    client.patch('/users/me/settings', data),

  submitVerificationRequest: (data: object) =>
    client.post('/verification-requests', data),
}
