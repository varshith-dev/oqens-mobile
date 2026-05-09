import client from './client'

export const flicksApi = {
  getFeed: (page: number) =>
    client.get('/flicks', { params: { page, limit: 10 } }),

  createFlick: (data: FormData) =>
    client.post('/flicks', data),
}
