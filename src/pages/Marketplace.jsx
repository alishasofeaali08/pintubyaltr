import { useEffect, useMemo, useRef, useState } from 'react'
import Modal from '../components/Modal'
import PageHeading from '../components/PageHeading'
import UserRating from '../components/UserRating'
import { useAuth } from '../context/useAuth'
import { createListing, deleteListing, getListings, updateListing } from '../lib/listings'
import { getMessages, sendMessage } from '../lib/messages'

const FALLBACK_IMAGE = '/images/logo.png'

const emptyListing = {
  title: '',
  type: 'Apartment',
  price: '',
  location: '',
  bedrooms: 2,
  bathrooms: 1,
  furnishing: 'Fully Furnished',
  description: '',
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null)
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      reject(new Error('Please select a JPG, PNG or WEBP image.'))
      return
    }
    if (file.size > 1024 * 1024) {
      reject(new Error('Image must be smaller than 1 MB.'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Unable to read the selected image.'))
    reader.readAsDataURL(file)
  })
}

function conversationId(propertyId, ownerId, currentUserId) {
  const participants = [String(ownerId), String(currentUserId)].sort()
  return `${propertyId}_${participants[0]}_${participants[1]}`
}

export default function Marketplace() {
  const { user } = useAuth()
  const fileRef = useRef(null)
  const [listings, setListings] = useState([])
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [priceFilter, setPriceFilter] = useState('All')
  const [sort, setSort] = useState('newest')
  const [form, setForm] = useState(emptyListing)
  const [editingId, setEditingId] = useState(null)
  const [formError, setFormError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [chat, setChat] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [message, setMessage] = useState('')

  const canPublish = ['Admin', 'Landlord', 'Property Manager'].includes(user.role)

  useEffect(() => {
    let active = true
    getListings()
      .then((items) => { if (active) setListings(items) })
      .catch((err) => { if (active) setLoadError(err.message) })
    return () => { active = false }
  }, [])

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    const result = listings.filter((listing) => {
      const matchesSearch = !term || [listing.title, listing.location, listing.description, listing.type]
        .join(' ')
        .toLowerCase()
        .includes(term)
      const matchesType = typeFilter === 'All' || listing.type === typeFilter
      const matchesPrice = priceFilter === 'All' || Number(listing.price) < Number(priceFilter)
      return matchesSearch && matchesType && matchesPrice
    })
    result.sort((a, b) => {
      if (sort === 'low') return a.price - b.price
      if (sort === 'high') return b.price - a.price
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })
    return result
  }, [listings, search, typeFilter, priceFilter, sort])

  const openAdd = () => {
    if (!canPublish) return alert('Only landlords and property managers can publish property listings.')
    setForm(emptyListing)
    setEditingId(null)
    setFormError('')
    if (fileRef.current) fileRef.current.value = ''
    setShowForm(true)
    return undefined
  }

  const openEdit = (listing) => {
    if (String(listing.ownerId) !== String(user.id)) return alert('You can only edit your own property listings.')
    setForm({
      title: listing.title,
      type: listing.type,
      price: listing.price,
      location: listing.location,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      furnishing: listing.furnishing,
      description: listing.description,
    })
    setEditingId(listing.id)
    setFormError('')
    if (fileRef.current) fileRef.current.value = ''
    setSelected(null)
    setShowForm(true)
    return undefined
  }

  const saveListing = async (event) => {
    event.preventDefault()
    if (!canPublish) return
    if (!form.title || !form.type || !form.price || !form.location || !form.description) {
      setFormError('Please complete all required property details.')
      return
    }

    let image = editingId ? listings.find((item) => item.id === editingId)?.image || '' : ''
    try {
      const uploaded = await readImage(fileRef.current?.files?.[0])
      if (uploaded) image = uploaded
    } catch (err) {
      setFormError(err.message)
      return
    }

    const details = {
      title: form.title.trim(),
      type: form.type,
      price: Number(form.price),
      location: form.location.trim(),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      furnishing: form.furnishing,
      description: form.description.trim(),
      image,
    }

    try {
      if (editingId) {
        const updated = await updateListing(editingId, details)
        setListings((current) => current.map((item) => (item.id === editingId ? updated : item)))
      } else {
        const created = await createListing(details)
        setListings((current) => [created, ...current])
      }
      setShowForm(false)
      setLoadError('')
    } catch (err) {
      setFormError(err.message || 'Unable to save the property.')
    }
  }

  const removeListing = async (listing) => {
    if (String(listing.ownerId) !== String(user.id) && user.role !== 'Admin') return
    if (!window.confirm(`Are you sure you want to delete "${listing.title}"?`)) return
    try {
      await deleteListing(listing.id)
      setListings((current) => current.filter((item) => item.id !== listing.id))
      setSelected(null)
    } catch (err) {
      setLoadError(err.message)
    }
  }

  const openChat = async (listing) => {
    if (String(listing.ownerId) === String(user.id)) return alert('You are the owner of this property.')
    const id = conversationId(listing.id, listing.ownerId, user.id)
    setSelected(null)
    setChat({ id, listing })
    setMessage('')
    setChatMessages([])
    try {
      setChatMessages(await getMessages(id))
    } catch (err) {
      setLoadError(err.message)
    }
    return undefined
  }

  const sendChatMessage = async (event) => {
    event.preventDefault()
    const text = message.trim()
    if (!text || !chat) return
    try {
      const created = await sendMessage({
        threadId: chat.id,
        propertyId: chat.listing.id,
        contextId: chat.listing.id,
        contextTitle: chat.listing.title,
        receiverId: String(chat.listing.ownerId),
        receiverName: chat.listing.ownerName,
        text,
      })
      setChatMessages((current) => [...current, created])
      setMessage('')
    } catch (err) {
      setLoadError(err.message)
    }
  }

  return (
    <div className="container wide marketplace-container">
      <PageHeading
        title="PINTU Property Marketplace"
        subtitle="Find a place to call home."
        description="Discover rental properties and connect directly with property owners."
      />
      <div className="marketplace-heading">
        <p className="eyebrow">PINTU PROPERTY MARKETPLACE</p>
        {canPublish && (
          <button type="button" className="primary-btn" onClick={openAdd}>+ Add Property</button>
        )}
      </div>

      {loadError && <p className="form-message error" role="alert">{loadError}</p>}

      <section className="search-section">
        <div className="search-box"><span>⌕</span><input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by property name or location..." /></div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Property type">
          <option value="All">All Property Types</option>
          {['Apartment', 'Condominium', 'House', 'Room', 'Studio'].map((type) => <option key={type}>{type}</option>)}
        </select>
        <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} aria-label="Rental price">
          <option value="All">All Rental Prices</option>
          <option value="1000">Below RM1,000</option>
          <option value="2000">Below RM2,000</option>
          <option value="3000">Below RM3,000</option>
          <option value="5000">Below RM5,000</option>
        </select>
      </section>

      <section className="listing-section">
        <div className="listing-heading">
          <div>
            <h2>Available Properties</h2>
            <p>{visible.length} properties found</p>
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort listings">
            <option value="newest">Newest First</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </div>

        {visible.length === 0 ? (
          <div className="empty-state"><h3>No properties found</h3><p>Try changing your search or filters.</p></div>
        ) : (
          <div className="property-grid">
            {visible.map((listing) => (
              <article className="property-card" key={listing.id}>
                <img className="property-image" src={listing.image || FALLBACK_IMAGE} alt={listing.title} onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }} />
                <div className="property-card-content">
                  <div className="property-card-top">
                    <span className="property-tag">{listing.type}</span>
                    <div className="property-price">RM{Number(listing.price).toLocaleString('en-MY')}<small> / month</small></div>
                  </div>
                  <h3>{listing.title}</h3>
                  <p className="property-location">📍 {listing.location}</p>
                  <div className="property-features">
                    <span>🛏 {listing.bedrooms} Bedrooms</span>
                    <span>🚿 {listing.bathrooms} Bathrooms</span>
                    <span>{listing.furnishing}</span>
                  </div>
                  <div className="property-owner">
                    <span>Listed by {listing.ownerName}</span>
                    {listing.ownerId && <UserRating userId={listing.ownerId} name={listing.ownerName} compact />}
                  </div>
                  <div className="card-actions">
                    <button type="button" className="secondary-btn" onClick={() => setSelected(listing)}>View Details</button>
                    <button type="button" className="primary-btn" onClick={() => openChat(listing)}>Chat with Owner</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Modal open={showForm} title={editingId ? 'Edit Property' : 'Add Property'} subtitle="Provide details about your property." onClose={() => setShowForm(false)} className="listing-modal">
        <form onSubmit={saveListing} className="stacked-form" encType="multipart/form-data">
          <label htmlFor="propertyTitle">Property Title</label>
          <input id="propertyTitle" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="form-row">
            <div>
              <label htmlFor="propertyType">Property Type</label>
              <select id="propertyType" required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {['Apartment', 'Condominium', 'House', 'Room', 'Studio'].map((type) => <option key={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="propertyPrice">Monthly Rental (RM)</label>
              <input id="propertyPrice" type="number" min="1" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
          </div>
          <label htmlFor="propertyLocation">Location</label>
          <input id="propertyLocation" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <div className="form-row">
            <div>
              <label htmlFor="propertyBedrooms">Bedrooms</label>
              <input id="propertyBedrooms" type="number" min="0" max="50" required value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
            </div>
            <div>
              <label htmlFor="propertyBathrooms">Bathrooms</label>
              <input id="propertyBathrooms" type="number" min="0" max="50" required value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
            </div>
          </div>
          <label htmlFor="propertyFurnishing">Furnishing</label>
          <select id="propertyFurnishing" value={form.furnishing} onChange={(e) => setForm({ ...form, furnishing: e.target.value })}>
            <option>Fully Furnished</option><option>Partially Furnished</option><option>Unfurnished</option>
          </select>
          <label htmlFor="propertyDescription">Description</label>
          <textarea id="propertyDescription" rows="4" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label htmlFor="propertyImage">Property Image</label>
          <input id="propertyImage" type="file" accept="image/png,image/jpeg,image/webp" ref={fileRef} />
          <small className="image-note">Maximum image size: 1 MB. Leave empty when editing to keep the current image.</small>
          {formError && <p className="form-message error">{formError}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="primary-btn">Save Property</button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(selected)} title="Property Details" onClose={() => setSelected(null)} className="details-modal">
        {selected && (
          <div className="details-content">
            <img className="details-image" src={selected.image || FALLBACK_IMAGE} alt={selected.title} onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }} />
            <span className="property-tag">{selected.type}</span>
            <h2>{selected.title}</h2>
            <h3 className="details-price">RM{Number(selected.price).toLocaleString('en-MY')} / month</h3>
            <p>📍 {selected.location}</p>
            <div className="details-features">
              <span>🛏 {selected.bedrooms} Bedrooms</span>
              <span>🚿 {selected.bathrooms} Bathrooms</span>
              <span>{selected.furnishing}</span>
            </div>
            <h3>Property Description</h3>
            <p>{selected.description}</p>
            <div className="owner-section">
              <div className="owner-avatar">{(selected.ownerName || 'U').charAt(0).toUpperCase()}</div>
              <div>
                <strong>{selected.ownerName}</strong>
                <p>{selected.ownerRole || 'Property Owner'}</p>
                {selected.ownerId && <UserRating userId={selected.ownerId} name={selected.ownerName} compact />}
              </div>
            </div>
            <div className="details-actions">
              {String(selected.ownerId) !== String(user.id) ? (
                <button type="button" className="primary-btn" onClick={() => openChat(selected)}>Chat with Owner</button>
              ) : (
                <>
                  <button type="button" className="secondary-btn" onClick={() => openEdit(selected)}>Edit Listing</button>
                  <button type="button" className="delete-btn" onClick={() => removeListing(selected)}>Delete Listing</button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={Boolean(chat)} title={chat?.listing.ownerName || 'Property Owner'} subtitle={chat?.listing.title} onClose={() => setChat(null)} className="chat-modal">
        {chat && (
          <>
            <div className="chat-messages">
              {chatMessages.length === 0 ? (
                <p className="chat-empty">Start the conversation by sending a message.</p>
              ) : (
                chatMessages.map((item) => (
                  <div className={`message ${String(item.senderId) === String(user.id) ? 'mine' : 'theirs'}`} key={item._id || item.id}>
                    <div>{item.text}</div>
                    <small>{new Date(item.date).toLocaleString()}</small>
                  </div>
                ))
              )}
            </div>
            <form className="chat-form" onSubmit={sendChatMessage}>
              <input type="text" maxLength="1000" required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a message..." />
              <button type="submit" className="primary-btn">Send</button>
            </form>
          </>
        )}
      </Modal>
    </div>
  )
}
