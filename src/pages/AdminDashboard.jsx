import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../components/Modal'
import { useAuth } from '../context/useAuth'
import { adminUpdateUser, deleteUser, getUsers } from '../lib/auth'
import { getAllTransactions } from '../lib/tiers'

const ROLES = ['Admin', 'Tenant', 'Landlord', 'Property Manager']
const emptyForm = { id: '', name: '', email: '', phone: '', role: 'Tenant' }

export default function AdminDashboard() {
  const { user, refresh, signOut } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [payments, setPayments] = useState([])
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    let active = true
    Promise.all([getUsers(), getAllTransactions()])
      .then(([nextUsers, nextPayments]) => {
        if (!active) return
        setUsers(nextUsers)
        setPayments(nextPayments)
      })
      .catch((err) => { if (active) setLoadError(err.message) })
    return () => { active = false }
  }, [])

  const rows = useMemo(() => users.map((item) => ({
    id: String(item.id),
    name: item.name || item.username,
    email: item.email,
    phone: item.phone || '',
    role: item.role || 'Tenant',
  })), [users])

  const visible = rows.filter((row) => {
    const term = search.trim().toLowerCase()
    const matchesSearch = !term || [row.name, row.email, row.phone].join(' ').toLowerCase().includes(term)
    return matchesSearch && (roleFilter === 'All' || row.role === roleFilter)
  })

  const counts = Object.fromEntries(ROLES.map((role) => [role, rows.filter((row) => row.role === role).length]))

  const openEdit = (row) => {
    setForm(row)
    setEditing(row.id)
  }

  const saveEdit = async (event) => {
    event.preventDefault()
    try {
      const updated = await adminUpdateUser(editing, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
      })
      setUsers((current) => current.map((item) => (String(item.id) === editing ? updated : item)))
      if (String(user.id) === editing) await refresh()
      setEditing(null)
      setLoadError('')
    } catch (err) {
      setLoadError(err.message || 'Unable to save user details.')
    }
  }

  const removeUser = async (row) => {
    if (String(row.id) === String(user.id)) return alert('You cannot delete your own admin account.')
    if (!window.confirm(`Delete ${row.name}?`)) return
    try {
      await deleteUser(row.id)
      setUsers((current) => current.filter((item) => String(item.id) !== String(row.id)))
    } catch (err) {
      setLoadError(err.message || 'Unable to delete user.')
    }
    return undefined
  }

  const logout = async () => {
    if (!window.confirm('Are you sure you want to logout?')) return
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="sidebar-logo"><img src="/images/logo.png" alt="PINTU" /><h2>PINTU</h2></div>
        <div className="sidebar-menu">
          <p className="menu-label">MAIN MENU</p>
          <a href="#overview" className="menu-item active"><span>📊</span> Overview</a>
          <a href="#users" className="menu-item"><span>👥</span> User Management</a>
          <a href="#membership" className="menu-item"><span>🏠</span> Membership Payments</a>
        </div>
        <div className="sidebar-bottom">
          <button type="button" className="menu-item nav-action" onClick={logout}><span>🚪</span> Logout</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div><h1>Admin Dashboard</h1><p>Manage your PINTU platform and users.</p></div>
          <div className="admin-profile">
            <div className="admin-avatar">{(user.name || 'A').charAt(0).toUpperCase()}</div>
            <div><span>Administrator</span><strong>{user.name}</strong></div>
          </div>
        </header>

        <div className="admin-content">
          {loadError && <p className="form-message error" role="alert">{loadError}</p>}

          <section className="admin-section" id="overview">
            <div className="section-heading"><div><h2>Dashboard Overview</h2><p>Here's an overview of your registered users.</p></div></div>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-icon">👥</div><h3>Total Users</h3><div className="stat-number">{rows.length}</div></div>
              {ROLES.map((role, index) => (
                <div className="stat-card" key={role}>
                  <div className="stat-icon">{['🔐', '🔑', '🏡', '🏢'][index]}</div>
                  <h3>{role === 'Property Manager' ? 'Property Managers' : `${role}s`}</h3>
                  <div className="stat-number">{counts[role]}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-section" id="users">
            <div className="section-heading"><div><h2>User Management</h2><p>View, search, edit and manage registered accounts.</p></div></div>
            <div className="user-toolbar">
              <div className="search-box"><span>🔍</span><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email or phone..." /></div>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Filter by role">
                <option value="All">All Roles</option>
                {ROLES.map((role) => <option key={role}>{role}</option>)}
              </select>
            </div>
            <div className="table-container">
              <table className="user-table">
                <thead><tr><th>USER</th><th>EMAIL ADDRESS</th><th>PHONE NUMBER</th><th>ROLE</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {visible.map((row) => (
                    <tr key={row.id}>
                      <td><strong>{row.name}</strong></td>
                      <td>{row.email}</td>
                      <td>{row.phone || '—'}</td>
                      <td><span className="role-badge">{row.role}</span></td>
                      <td>
                        <button type="button" className="secondary-btn" onClick={() => openEdit(row)}>Edit</button>
                        <button type="button" className="delete-btn" onClick={() => removeUser(row)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer"><p>{visible.length} registered {visible.length === 1 ? 'user' : 'users'}</p></div>
          </section>

          <section className="admin-section" id="membership">
            <div className="section-heading"><div><h2>Membership Payments</h2><p>Wallet top-ups and tier upgrades across PINTU.</p></div></div>
            {payments.length === 0 ? <p>No payments recorded yet.</p> : (
              <div className="table-container">
                <table className="user-table">
                  <thead><tr><th>USER</th><th>TYPE</th><th>TIER</th><th>AMOUNT</th><th>DATE</th></tr></thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment._id}>
                        <td><strong>{payment.userName}</strong></td>
                        <td>{payment.type === 'top-up' ? 'Wallet top-up' : 'Tier upgrade'}</td>
                        <td>{payment.tier || '—'}</td>
                        <td>RM{Number(payment.amount).toFixed(2)}</td>
                        <td>{new Date(payment.date).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      <Modal open={Boolean(editing)} title="Edit User Details" subtitle="Update the selected user's account information." onClose={() => setEditing(null)}>
        <form onSubmit={saveEdit} className="stacked-form">
          <label htmlFor="adminEditName">Full Name</label>
          <input id="adminEditName" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label htmlFor="adminEditEmail">Email Address</label>
          <input id="adminEditEmail" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <label htmlFor="adminEditPhone">Phone Number</label>
          <input id="adminEditPhone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <label htmlFor="adminEditRole">Account Role</label>
          <select id="adminEditRole" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {ROLES.map((role) => <option key={role}>{role}</option>)}
          </select>
          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={() => setEditing(null)}>Cancel</button>
            <button type="submit" className="primary-btn">Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
