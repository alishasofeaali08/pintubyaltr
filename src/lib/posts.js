import { api } from './api'

export async function getPosts() {
  const { posts } = await api.get('/posts')
  return Array.isArray(posts) ? posts : []
}

export async function createPost(details) {
  const { post } = await api.post('/posts', details)
  return post
}

export async function deletePost(id) {
  await api.delete(`/posts/${id}`)
}

export async function toggleLikePost(id) {
  const { post } = await api.post(`/posts/${id}/like`)
  return post
}

export async function addPostComment(id, text) {
  const { post } = await api.post(`/posts/${id}/comments`, { text })
  return post
}
