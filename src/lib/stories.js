import { api } from './api'
export async function getStories() {
  const { stories } = await api.get('/stories')
  return stories || []
}
export async function createStory(details) {
  const { story } = await api.post('/stories', details)
  return story
}
