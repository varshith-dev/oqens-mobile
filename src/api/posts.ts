import client from './client'

export const postsApi = {
  getFeed: (type: 'for_you' | 'following' | 'popular', page: number) =>
    client.get('/posts/feed', { params: { type, page, limit: 20 } }),

  getPost: (postId: string) =>
    client.get(`/posts/${postId}`),

  createPost: (data: FormData | object) =>
    client.post('/posts', data),

  deletePost: (postId: string) =>
    client.delete(`/posts/${postId}`),

  likePost: (postId: string) =>
    client.post(`/posts/${postId}/like`),

  unlikePost: (postId: string) =>
    client.delete(`/posts/${postId}/like`),

  bookmarkPost: (postId: string) =>
    client.post(`/posts/${postId}/bookmark`),

  unbookmarkPost: (postId: string) =>
    client.delete(`/posts/${postId}/bookmark`),

  getComments: (postId: string) =>
    client.get(`/posts/${postId}/comments`),

  addComment: (postId: string, content: string, parentId?: string) =>
    client.post(`/posts/${postId}/comments`, { content, parent_id: parentId }),

  deleteComment: (postId: string, commentId: string) =>
    client.delete(`/posts/${postId}/comments/${commentId}`),

  getTagFeed: (tag: string, page: number) =>
    client.get(`/posts/tag/${tag}`, { params: { page, limit: 20 } }),
}
