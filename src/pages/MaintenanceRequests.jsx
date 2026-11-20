import { useEffect, useState } from 'react'
import PageHeading from '../components/PageHeading'
import { useAuth } from '../context/useAuth'
import { getMaintenanceRequests, submitMaintenanceRequest, updateMaintenanceRequest } from '../lib/maintenance'

const emptyForm = { property: '', unit: '', category: 'Plumbing', priority: 'Normal', description: '' }
const dateText = (value) => value ? new Date(value).toLocaleString() : '—'
export default function MaintenanceRequests() {
  const { user } = useAuth()
  const isTenant = user.role === 'Tenant'
  const [requests, setRequests] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const load = async () => {
    try { setRequests(await getMaintenanceRequests()) }
    catch (err) { setError(err.message || 'Unable to load maintenance requests.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const submit = async (event) => {
    event.preventDefault(); setError(''); setMessage(''); setSaving(true)
    try {
      const request = await submitMaintenanceRequest(form)
      setRequests((items) => [request, ...items]); setForm(emptyForm)
      setMessage('Your maintenance request has been submitted.')
    } catch (err) { setError(err.message || 'Unable to submit request.') }
    finally { setSaving(false) }
  }
  const changeStatus = async (request, status) => {
    try {
      const updated = await updateMaintenanceRequest(request._id, { status })
      setRequests((items) => items.map((item) => item._id === request._id ? updated : item))
    } catch (err) { setError(err.message || 'Unable to update request.') }
  }
  return <div className="container wide">
    <PageHeading title="Maintenance Requests" subtitle={isTenant ? 'Report an issue with your rental property.' : 'Review and manage maintenance requests.'} description={isTenant ? 'Submit a request and track its progress here.' : 'View submitted requests and update their status.'} />
    {isTenant ? <section className="content-card">
      <h2>Submit a Request</h2>
      <form className="stacked-form" onSubmit={submit}>
        <label htmlFor="maintenance-property">Property / Building</label><input id="maintenance-property" required value={form.property} onChange={(e) => setForm({ ...form, property: e.target.value })} placeholder="Property name or address" />
        <label htmlFor="maintenance-unit">Unit number (optional)</label><input id="maintenance-unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="e.g. A-12-03" />
        <label htmlFor="maintenance-category">Issue category</label><select id="maintenance-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{['Plumbing', 'Electrical', 'Air Conditioning', 'Appliance', 'Structural', 'Pest Control', 'Other'].map((v) => <option key={v}>{v}</option>)}</select>
        <label htmlFor="maintenance-priority">Priority</label><select id="maintenance-priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{['Low', 'Normal', 'High', 'Urgent'].map((v) => <option key={v}>{v}</option>)}</select>
        <label htmlFor="maintenance-description">Describe the issue</label><textarea id="maintenance-description" required maxLength="1500" rows="5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Explain what happened and where..." />
        {error && <p className="form-message error">{error}</p>}{message && <p className="form-message success">{message}</p>}
        <button className="primary-btn" disabled={saving}>{saving ? 'Submitting…' : 'Submit Request'}</button>
      </form>
    </section> : null}
    <section className="content-card" style={{ marginTop: 20 }}>
      <div className="section-heading"><div><h2>{isTenant ? 'My Requests' : 'All Maintenance Requests'}</h2><p>{isTenant ? 'Requests submitted from your account.' : 'Requests submitted by tenants on PINTU.'}</p></div></div>
      {loading ? <p>Loading requests…</p> : requests.length === 0 ? <p className="muted">No maintenance requests found.</p> : <div className="table-container"><table className="user-table">
        <thead><tr>{!isTenant && <th>TENANT</th>}<th>PROPERTY / UNIT</th><th>ISSUE</th><th>PRIORITY</th><th>DATE</th><th>STATUS</th>{!isTenant && <th>UPDATE</th>}</tr></thead>
        <tbody>{requests.map((item) => <tr key={item._id}>
          {!isTenant && <td>{item.tenantName}</td>}<td>{item.property}{item.unit ? ` · ${item.unit}` : ''}</td><td><strong>{item.category}</strong><br />{item.description}</td><td>{item.priority}</td><td>{dateText(item.createdAt)}</td><td><span className="role-badge">{item.status}</span></td>
          {!isTenant && <td><select aria-label="Update request status" value={item.status} onChange={(e) => changeStatus(item, e.target.value)}>{['Submitted', 'In Progress', 'Completed', 'Rejected'].map((v) => <option key={v}>{v}</option>)}</select></td>}
        </tr>)}</tbody></table></div>}
    </section>
    {error && !isTenant && <p className="form-message error">{error}</p>}
  </div>
}
