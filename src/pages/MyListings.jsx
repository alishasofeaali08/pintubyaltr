import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeading from '../components/PageHeading'
import { useAuth } from '../context/useAuth'
import { getListings } from '../lib/listings'

const FALLBACK_IMAGE = '/images/logo.png'

export default function MyListings() {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getListings()
      .then((items) => {
        if (active) setListings(items.filter((item) => String(item.ownerId) === String(user.id)))
      })
      .catch((err) => { if (active) setError(err.message || 'Unable to load your listings.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user.id])

  const totalRental = useMemo(
    () => listings.reduce((total, listing) => total + Number(listing.price || 0), 0),
    [listings],
  )

  return (
    <div className="container wide marketplace-container">
      <PageHeading
        title="My Listings"
        subtitle="Manage the properties you have published."
        description="Review your property listings in one place. The public Property Listings marketplace remains separate."
      />

      <section className="listing-section">
        <div className="listing-heading">
          <div>
            <h2>Your Properties</h2>
            <p>{listings.length} {listings.length === 1 ? 'listing' : 'listings'} published</p>
          </div>
          <Link to="/marketplace" className="primary-btn">Go to Property Listings</Link>
        </div>

        {error && <p className="form-message error" role="alert">{error}</p>}
        {loading ? (
          <div className="empty-state"><p>Loading your listings...</p></div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <h3>You have no property listings yet</h3>
            <p>Publish a property from the Property Listings marketplace to see it here.</p>
            <Link to="/marketplace" className="primary-btn">Browse Property Listings</Link>
          </div>
        ) : (
          <>
            <div className="dashboard-grid" style={{ marginBottom: 20 }}>
              <section className="content-card">
                <p className="muted">Published properties</p>
                <h2>{listings.length}</h2>
              </section>
              <section className="content-card">
                <p className="muted">Combined monthly rental</p>
                <h2>RM{totalRental.toLocaleString('en-MY')}</h2>
              </section>
            </div>
            <div className="property-grid">
              {listings.map((listing) => (
                <article className="property-card" key={listing.id}>
                  <img
                    className="property-image"
                    src={listing.image || FALLBACK_IMAGE}
                    alt={listing.title}
                    onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE }}
                  />
                  <div className="property-card-content">
                    <div className="property-card-top">
                      <span className="property-tag">{listing.type}</span>
                      <span className="property-price">RM{Number(listing.price).toLocaleString('en-MY')}<small> / month</small></span>
                    </div>
                    <h3>{listing.title}</h3>
                    <p className="property-location">{listing.location}</p>
                    <div className="property-features">
                      <span>{listing.bedrooms} Bedrooms</span>
                      <span>{listing.bathrooms} Bathrooms</span>
                      <span>{listing.furnishing}</span>
                    </div>
                    <p>{listing.description}</p>
                    <div className="card-actions">
                      <Link to="/marketplace" className="secondary-btn">View Marketplace</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
