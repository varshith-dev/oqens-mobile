import client from './client'

export const messagesApi = {
  getThreads: () =>
    client.get('/messages'),

  getMessages: (threadId: string) =>
    client.get(`/messages/${threadId}`),

  sendMessage: (threadId: string, content: string) =>
    client.post(`/messages/${threadId}`, { content }),

  deleteMessage: (threadId: string, messageId: string) =>
    client.delete(`/messages/${threadId}/${messageId}`),

  startThread: (userId: string) =>
    client.post('/messages/threads', { user_id: userId }),
}
