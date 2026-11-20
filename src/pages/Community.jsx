import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ChatInbox from '../components/ChatInbox'
import ChatModal from '../components/ChatModal'
import Modal from '../components/Modal'
import UserRating from '../components/UserRating'
import {
  BookmarkIcon,
  CameraIcon,
  CloseIcon,
  CommentIcon,
  HeartIcon,
  MessageIcon,
  MoreIcon,
  PlusIcon,
  SendIcon,
  ShareIcon,
} from '../components/Icons'
import { useAuth } from '../context/useAuth'
import { OPEN_COMPOSER_EVENT } from '../lib/events'
import { addPostComment, createPost, deletePost, getPosts, toggleLikePost } from '../lib/posts'
import { createStory, getStories } from '../lib/stories'

function readMediaFile(file) {
  return new Promise((resolve, reject) => {
    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')
    if (!isVideo && !isImage) {
      reject(new Error('Please choose an image or a video.'))
      return
    }
    const limit = isVideo ? 8 * 1024 * 1024 : 3 * 1024 * 1024
    if (file.size > limit) {
      reject(new Error(isVideo ? 'Videos must be smaller than 8 MB.' : 'Images must be smaller than 3 MB.'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => resolve({ type: isVideo ? 'video' : 'image', url: reader.result })
    reader.onerror = () => reject(new Error('Unable to read the selected file.'))
    reader.readAsDataURL(file)
  })
}

function initials(name) {
  return (name || 'U').charAt(0).toUpperCase()
}

function timeLabel(date) {
  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return ''
  const minutes = Math.floor((Date.now() - value.getTime()) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return value.toLocaleDateString()
}

export default function Community() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [stories, setStories] = useState([])
  const [activeStory, setActiveStory] = useState(null)
  const [contentType, setContentType] = useState('Post')
  const [loadError, setLoadError] = useState('')
  const [filterUser, setFilterUser] = useState(null)
  const [comments, setComments] = useState({})
  const [chat, setChat] = useState(null)
  const [composeOpen, setComposeOpen] = useState(() => Boolean(location.state?.compose))
  const [caption, setCaption] = useState('')
  const [media, setMedia] = useState([])
  const [composeError, setComposeError] = useState('')
  const [posting, setPosting] = useState(false)
  const fileRef = useRef(null)
  const commentRefs = useRef({})

  useEffect(() => {
    let active = true
    Promise.all([getPosts(), getStories()])
      .then(([items, storyItems]) => { if (active) { setPosts(items); setStories(storyItems) } })
      .catch((err) => { if (active) setLoadError(err.message) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const open = () => setComposeOpen(true)
    window.addEventListener(OPEN_COMPOSER_EVENT, open)
    return () => window.removeEventListener(OPEN_COMPOSER_EVENT, open)
  }, [])

  const storyAuthors = useMemo(() => {
    const grouped = new Map()
    stories.forEach((story) => {
      const id = String(story.userId || '')
      if (!id) return
      if (!grouped.has(id)) grouped.set(id, { id, name: story.author || 'Member', role: story.role, stories: [] })
      grouped.get(id).stories.push(story)
    })
    return [...grouped.values()]
  }, [stories])

  const visible = useMemo(
    () => (filterUser ? posts.filter((post) => String(post.userId) === filterUser) : posts),
    [posts, filterUser],
  )

  const closeComposer = () => {
    setComposeOpen(false)
    setCaption('')
    setMedia([])
    setComposeError('')
    if (location.state?.compose) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }

  const pickFiles = async (event) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return
    try {
      const items = await Promise.all(files.map(readMediaFile))
      if (items.some((item) => item.type === 'video') && items.length > 1) {
        throw new Error('Post one video at a time — videos cannot be mixed with photos.')
      }
      setMedia((current) => contentType === 'Story' ? items.slice(0, 1) : (items[0]?.type === 'video' ? items : [...current, ...items].slice(0, 4)))
      setComposeError('')
    } catch (err) {
      setComposeError(err.message)
    }
  }

  const submitPost = async (event) => {
    event.preventDefault()
    const content = caption.trim()
    if (!content && media.length === 0) {
      setComposeError('Add a caption, a photo or a video to your post.')
      return
    }
    setPosting(true)
    try {
      if (contentType === 'Story') {
        const story = await createStory({ content, media: media.slice(0, 1) })
        setStories((current) => [story, ...current])
      } else {
        const post = await createPost({ content, media })
        setPosts((current) => [post, ...current])
        setFilterUser(null)
      }
      closeComposer()
    } catch (err) {
      setComposeError(err.message || 'Unable to share your post.')
    } finally {
      setPosting(false)
    }
  }

  const toggleLike = async (postId) => {
    try {
      const updated = await toggleLikePost(postId)
      setPosts((current) => current.map((post) => (post.id === postId ? updated : post)))
    } catch (err) {
      setLoadError(err.message)
    }
  }

  const removePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return
    try {
      await deletePost(postId)
      setPosts((current) => current.filter((post) => post.id !== postId))
    } catch (err) {
      setLoadError(err.message)
    }
  }

  const addComment = async (event, postId) => {
    event.preventDefault()
    const text = (comments[postId] || '').trim()
    if (!text) return
    try {
      const updated = await addPostComment(postId, text)
      setPosts((current) => current.map((post) => (post.id === postId ? updated : post)))
      setComments((previous) => ({ ...previous, [postId]: '' }))
    } catch (err) {
      setLoadError(err.message)
    }
  }

  const filteredAuthor = storyAuthors.find((author) => author.id === filterUser)

  return (
    <div className="social-feed">
      <header className="feed-brand">
        <img src="/images/logo.png" alt="PINTU" />
        <div>
          <h1>PINTU</h1>
          <p>The Gateway to Better Property Living</p>
        </div>
      </header>

      {loadError && <p className="form-message error" role="alert">{loadError}</p>}

      <section className="stories" aria-label="Community members">
        <button type="button" className="story" onClick={() => { setContentType("Story"); setComposeOpen(true) }}>
          <span className="story-ring story-self"><span className="story-avatar">{initials(user.name)}</span><PlusIcon className="story-plus" /></span>
          <small>Your story</small>
        </button>
        {storyAuthors.filter((author) => author.id !== String(user.id)).map((author) => (
          <button type="button" className="story" key={author.id} onClick={() => setActiveStory(author.stories[0])}>
            <span className="story-ring"><span className="story-avatar">{initials(author.name)}</span></span>
            <small>{author.id === String(user.id) ? 'Your story' : author.name.split(' ')[0]}</small>
          </button>
        ))}
      </section>

      <section className="content-card feed-composer-prompt">
        <span className="story-avatar">{initials(user.name)}</span>
        <button type="button" onClick={() => { setContentType("Post"); setComposeOpen(true) }}>Share something with the community, {user.name.split(' ')[0]}…</button>
        <button type="button" className="prompt-camera" aria-label="Add a photo or video" title="Add a photo or video" onClick={() => { setContentType("Post"); setComposeOpen(true) }}>
          <CameraIcon />
        </button>
      </section>

      {filteredAuthor && (
        <div className="feed-filter">
          <span>Showing posts from <strong>{filteredAuthor.name}</strong></span>
          <button type="button" onClick={() => setFilterUser(null)}><CloseIcon /></button>
        </div>
      )}

      <section className="community-feed" aria-label="Community posts">
        {visible.length === 0 ? (
          <p className="empty-message">No posts yet. Share the first photo or update!</p>
        ) : visible.map((post) => {
          const liked = Array.isArray(post.likes) && post.likes.includes(String(user.id))
          const isOwnPost = String(post.userId) === String(user.id)
          const isSeller = ['Landlord', 'Property Manager'].includes(post.role)
          return (
            <article className="feed-post" key={post.id}>
              <header className="feed-post-header">
                <button type="button" className="story-avatar" onClick={() => setFilterUser(String(post.userId))} aria-label={`View posts from ${post.author}`}>
                  {initials(post.author)}
                </button>
                <div className="feed-post-meta">
                  <strong>{post.author}</strong>
                  <small>{post.role || 'Tenant'} · {timeLabel(post.date)}</small>
                </div>
                {isOwnPost ? (
                  <button type="button" className="icon-btn" title="Delete post" aria-label="Delete post" onClick={() => removePost(post.id)}>
                    <MoreIcon />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="icon-btn"
                    title={isSeller ? 'Chat with Seller' : `Message ${post.author}`}
                    aria-label="Message author"
                    onClick={() => setChat({ id: post.userId, postId: post.id, name: post.author, role: post.role, title: post.title || 'Community post' })}
                  >
                    <MessageIcon />
                  </button>
                )}
              </header>

              {Array.isArray(post.media) && post.media.length > 0 && (
                <div className={`feed-media count-${Math.min(post.media.length, 4)}`}>
                  {post.media.map((item, index) => (
                    item.type === 'video' ? (
                      <video key={`${post.id}-${index}`} src={item.url} controls muted playsInline loop preload="metadata" aria-label="Post video" />
                    ) : (
                      <img key={`${post.id}-${index}`} src={item.url} alt={`${post.author}'s post`} />
                    )
                  ))}
                </div>
              )}

              <div className="feed-actions">
                <button
                  type="button"
                  className={`icon-btn${liked ? ' liked' : ''}`}
                  onClick={() => toggleLike(post.id)}
                  aria-label={liked ? 'Unlike' : 'Like'}
                >
                  <HeartIcon fill={liked ? 'currentColor' : 'none'} />
                </button>
                <button type="button" className="icon-btn" aria-label="Comment" onClick={() => commentRefs.current[post.id]?.focus()}>
                  <CommentIcon />
                </button>
                <button type="button" className="icon-btn" aria-label="Share (coming soon)" title="Coming soon" disabled>
                  <ShareIcon />
                </button>
                <button type="button" className="icon-btn feed-bookmark" aria-label="Save (coming soon)" title="Coming soon" disabled>
                  <BookmarkIcon />
                </button>
              </div>

              <div className="feed-likes">{(post.likes || []).length} likes</div>
              {post.title && <p className="feed-title">{post.title}</p>}
              {post.content && <p className="feed-caption"><strong>{post.author}</strong> {post.content}</p>}
              {post.userId && <UserRating userId={post.userId} name={post.author} compact allowRating={!isOwnPost} />}

              <div className="feed-comments">
                {(post.comments || []).map((comment) => (
                  <p key={comment.id}><strong>{comment.author}</strong> {comment.text}</p>
                ))}
              </div>
              <form className="feed-comment-form" onSubmit={(event) => addComment(event, post.id)}>
                <input
                  ref={(element) => { commentRefs.current[post.id] = element }}
                  type="text"
                  maxLength="250"
                  required
                  placeholder="Add a comment…"
                  aria-label="Add a comment"
                  value={comments[post.id] || ''}
                  onChange={(event) => setComments((previous) => ({ ...previous, [post.id]: event.target.value }))}
                />
                <button type="submit" aria-label="Post comment"><SendIcon /></button>
              </form>
            </article>
          )
        })}
      </section>

      <ChatInbox onSelect={(recipient) => setChat(recipient)} />

      <ChatModal
        key={chat?.threadId || chat?.id || 'community-chat'}
        open={Boolean(chat)}
        recipient={chat}
        context={chat}
        threadId={chat?.threadId}
        onClose={() => setChat(null)}
      />

      <Modal open={Boolean(activeStory)} title={activeStory?.author ? `${activeStory.author}'s Story` : 'Story'} subtitle={activeStory?.expiresAt ? `Expires ${new Date(activeStory.expiresAt).toLocaleString()}` : ''} onClose={() => setActiveStory(null)}>
        {activeStory?.media?.map((item, index) => item.type === 'video'
          ? <video key={index} src={item.url} controls autoPlay style={{ width: '100%', maxHeight: 480 }} />
          : <img key={index} src={item.url} alt="Story" style={{ width: '100%', maxHeight: 480, objectFit: 'contain' }} />)}
        {activeStory?.content && <p>{activeStory.content}</p>}
      </Modal>

      <Modal open={composeOpen} title={`Create a ${contentType}`} subtitle={contentType === "Story" ? "Stories disappear automatically after 24 hours." : "Posts stay on your profile until you delete them."} onClose={closeComposer} className="compose-modal">
        <form onSubmit={submitPost} className="stacked-form">
          <label htmlFor="community-content-type">Share as</label><select id="community-content-type" value={contentType} onChange={(e) => { setContentType(e.target.value); setMedia([]) }}><option>Post</option><option>Story</option></select>
          <div className="compose-author">
            <span className="story-avatar">{initials(user.name)}</span>
            <div><strong>{user.name}</strong><small>{user.role || 'Tenant'}</small></div>
          </div>
          <textarea
            rows="5"
            maxLength="500"
            placeholder="Write a caption…"
            aria-label="Post caption"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
          />
          <input ref={fileRef} className="visually-hidden" type="file" accept="image/*,video/*" multiple onChange={pickFiles} />
          <button type="button" className="secondary-btn compose-picker" onClick={() => fileRef.current?.click()}>
            <CameraIcon /> Add photos or a video
          </button>
          {media.length > 0 && (
            <div className="compose-preview">
              {media.map((item, index) => (
                <div className="compose-preview-item" key={`${item.url.slice(-12)}-${index}`}>
                  {item.type === 'video' ? <video src={item.url} muted playsInline /> : <img src={item.url} alt="Selected" />}
                  <button
                    type="button"
                    aria-label="Remove media"
                    onClick={() => setMedia((current) => current.filter((_, position) => position !== index))}
                  >
                    <CloseIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
          <small className="image-note">{contentType === 'Story' ? 'One image (3 MB) or one video (8 MB). Stories disappear after 24 hours.' : 'Up to 4 images (3 MB each) or 1 video (8 MB). Posts remain until deleted.'}</small>
          {composeError && <p className="form-message error" role="alert">{composeError}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={closeComposer}>Cancel</button>
            <button type="submit" className="primary-btn" disabled={posting}>{posting ? 'Sharing…' : `Share ${contentType}`}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
