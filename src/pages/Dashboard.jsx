import { useEffect, useState } from 'react'
import Modal from '../components/Modal'
import PageHeading from '../components/PageHeading'
import UserRating from '../components/UserRating'
import { useAuth } from '../context/useAuth'
import { TIERS, TIER_ORDER, addFunds, getWallet, upgradeTier } from '../lib/tiers'

export default function Dashboard() {
  const { user, updateProfile, refresh } = useAuth()
  const currentTier = user.tier || 'Bronze'

  const [editing, setEditing] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'Tenant',
  })
  const [balance, setBalance] = useState(0)
  const [topUp, setTopUp] = useState('')
  const [transactions, setTransactions] = useState([])
  const [tierFeedback, setTierFeedback] = useState('')

  useEffect(() => {
    let active = true
    getWallet(5)
      .then((wallet) => {
        if (!active) return
        setBalance(wallet.balance)
        setTransactions(wallet.transactions)
      })
      .catch((err) => { if (active) setTierFeedback(err.message) })
    return () => { active = false }
  }, [user.id])

  const refreshWallet = async () => {
    const wallet = await getWallet(5)
    setBalance(wallet.balance)
    setTransactions(wallet.transactions)
  }

  const openEditor = () => {
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'Tenant',
    })
    setFeedback('')
    setEditing(true)
  }

  const saveProfile = async (event) => {
    event.preventDefault()
    const { name, email, phone, role } = form
    if (name.trim().length < 3) return setFeedback('Name must contain at least 3 characters.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setFeedback('Please enter a valid email address.')
    if (phone && !/^(\+?6?01)[0-46-9]-?[0-9]{7,8}$/.test(phone)) {
      return setFeedback('Please enter a valid Malaysian phone number.')
    }

    try {
      await updateProfile({ name: name.trim(), email: email.trim(), phone: phone.trim(), role })
      setEditing(false)
      setFeedback('')
    } catch (err) {
      setFeedback(err.message || 'Unable to save your profile.')
    }
    return undefined
  }

  const handleTopUp = async (event) => {
    event.preventDefault()
    const amount = Number(topUp)
    try {
      const result = await addFunds(amount)
      setTopUp('')
      setTierFeedback(`RM${amount.toFixed(2)} added to your wallet.`)
      setBalance(result.balance)
      await refreshWallet()
    } catch (err) {
      setTierFeedback(err.message || 'Unable to add funds.')
    }
  }

  const selectTier = async (target) => {
    if (target === currentTier) return
    const amount = Math.max(0, TIERS[target].price - TIERS[currentTier].price)
    const action = amount > 0 ? 'Upgrade to' : 'Switch to'
    if (!window.confirm(`${action} ${target}${amount > 0 ? ` for RM${amount.toFixed(2)}` : ' (free)'}?`)) return

    try {
      await upgradeTier(target)
      await refresh()
      await refreshWallet()
      setTierFeedback(`${action} ${target} successful.`)
    } catch (err) {
      setTierFeedback(err.message || 'Unable to change your membership.')
    }
  }

  return (
    <div className="container wide">
      <PageHeading
        title="Dashboard 🏆"
        subtitle={`Welcome, ${user.name || user.username}!`}
        description="Manage your profile, membership and wallet."
      />

      <div className="dashboard-grid">
        <section className="content-card profile-card">
          <div className="section-heading">
            <div>
              <h2>My Profile</h2>
              <p>Manage your personal information.</p>
            </div>
            <button type="button" className="secondary-btn" onClick={openEditor}>Edit Profile</button>
          </div>
          <div className="profile-info">
            <div className="profile-avatar">{(user.name || 'U').charAt(0).toUpperCase()}</div>
            <div className="profile-details">
              <h3>{user.name || 'User Name'}</h3>
              <p>{user.email}</p>
              <span className="role-badge">{user.role || 'Tenant'}</span>
              <UserRating userId={user.id} name={user.name} allowRating={false} compact />
            </div>
          </div>
          <div className="detail-list">
            <div><span>Full Name</span><strong>{user.name || 'Not provided'}</strong></div>
            <div><span>Email Address</span><strong>{user.email || 'Not provided'}</strong></div>
            <div><span>Phone Number</span><strong>{user.phone || 'Not provided'}</strong></div>
          </div>
        </section>

        <section className="content-card wallet-card">
          <div className="section-heading">
            <div><h2>My Wallet</h2><p>Demo balance for membership payments.</p></div>
          </div>
          <div className="wallet-balance">RM{balance.toFixed(2)}</div>
          <form className="topup-form" onSubmit={handleTopUp}>
            <input type="number" min="1" max="1000" step="0.01" value={topUp} onChange={(event) => setTopUp(event.target.value)} placeholder="Amount (RM)" aria-label="Top-up amount" />
            <button type="submit" className="secondary-btn">Add Funds</button>
          </form>
          {tierFeedback && <p className="form-message success">{tierFeedback}</p>}
          <h3 className="block-title">Recent payments</h3>
          {transactions.length === 0 ? (
            <p className="muted">No payments yet.</p>
          ) : (
            <div className="transaction-list">
              {transactions.map((item) => (
                <div className="transaction-item" key={item._id || item.id}>
                  <div>
                    <strong>{item.type === 'top-up' ? 'Wallet top-up' : `${item.tier} membership`}</strong>
                    <small>{new Date(item.date).toLocaleString()}</small>
                  </div>
                  <span className={item.type === 'top-up' ? 'amount-plus' : 'amount-minus'}>
                    {item.type === 'top-up' ? '+' : '-'}RM{Number(item.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="content-card tier-section">
        <div className="section-heading">
          <div>
            <h2>My Membership</h2>
            <p>{TIERS[currentTier].description}</p>
          </div>
          <span className="role-badge">Current: {currentTier}</span>
        </div>
        <div className="current-tier">
          <div>
            <span>YOUR CURRENT TIER</span>
            <h2>{currentTier}</h2>
            <p>{TIER_ORDER.indexOf(currentTier) + 1} of {TIER_ORDER.length} tiers</p>
          </div>
          <div className="tier-points">
            <span>WALLET BALANCE</span>
            <h2>RM{balance.toFixed(2)}</h2>
          </div>
        </div>
        <div className="tier-grid">
          {TIER_ORDER.map((name) => {
            const price = TIERS[name].price
            const difference = Math.max(0, price - TIERS[currentTier].price)
            const isCurrent = name === currentTier
            return (
              <article className={`tier-card ${name.toLowerCase()}${isCurrent ? ' selected' : ''}`} key={name}>
                <h3>{name}</h3>
                <h2>{price === 0 ? 'FREE' : `RM${price.toFixed(2)}`}</h2>
                <ul>{TIERS[name].benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
                <button
                  type="button"
                  className="primary-btn"
                  disabled={isCurrent}
                  onClick={() => selectTier(name)}
                >
                  {isCurrent ? 'Current Tier' : difference > 0 ? `Upgrade · RM${difference.toFixed(2)}` : 'Switch Free'}
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <Modal open={editing} title="Edit Profile" subtitle="Update your personal information." onClose={() => setEditing(false)}>
        <form onSubmit={saveProfile} className="stacked-form">
          <label htmlFor="editName">Full Name</label>
          <input id="editName" type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label htmlFor="editEmail">Email Address</label>
          <input id="editEmail" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <label htmlFor="editPhone">Phone Number</label>
          <input id="editPhone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <label htmlFor="editRole">Account Role</label>
          <select id="editRole" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option>Tenant</option>
            <option>Landlord</option>
            <option>Property Manager</option>
            {user.role === 'Admin' && <option>Admin</option>}
          </select>
          {feedback && <p className="form-message error">{feedback}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={() => setEditing(false)}>Cancel</button>
            <button type="submit" className="primary-btn">Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
