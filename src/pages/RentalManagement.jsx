import { useEffect, useState } from 'react'
import PageHeading from '../components/PageHeading'
import { useAuth } from '../context/useAuth'
import { createRentalRecord, getRentalRecords, getRentalTenants, updateRentalRecord } from '../lib/rentals'

const emptyForm = { tenantId: '', property: '', unit: '', month: new Date().toISOString().slice(0, 7), amount: '', dueDate: '' }
const dateText = (value) => value ? new Date(value).toLocaleDateString() : '—'
export default function RentalManagement() {
  const { user } = useAuth()
  const isTenant = user.role === 'Tenant'
  const isAdmin = user.role === 'Admin'
  const [view, setView] = useState(isTenant ? 'tenant' : 'manager')
  const [records, setRecords] = useState([])
  const [tenants, setTenants] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const reload = async () => {
    try { setRecords(await getRentalRecords()) } catch (err) { setError(err.message || 'Unable to load rental records.') }
    finally { setLoading(false) }
  }
  useEffect(() => {
    reload()
    if (!isTenant) getRentalTenants().then(setTenants).catch((err) => setError(err.message))
  }, [isTenant])
  const submit = async (event) => {
    event.preventDefault(); setError(''); setMessage('')
    try {
      const record = await createRentalRecord({ ...form, amount: Number(form.amount) })
      setRecords((items) => [record, ...items]); setForm(emptyForm); setMessage('Monthly rental record added.')
    } catch (err) { setError(err.message || 'Unable to add rental record.') }
  }
  const setStatus = async (record, status) => {
    try {
      const updated = await updateRentalRecord(record._id, { status })
      setRecords((items) => items.map((item) => item._id === record._id ? updated : item))
    } catch (err) { setError(err.message || 'Unable to update record.') }
  }
  const shownRecords = isAdmin && view === 'tenant'
    ? records.filter((record) => tenants.some((tenant) => tenant.id === record.tenantId))
    : records
  return <div className="container wide">
    <PageHeading title="Rental Management" subtitle={isTenant ? 'Your monthly rental payment records.' : 'Monthly rental records for tenants and property managers.'} description={isAdmin ? 'Admin access includes the tenant ledger and property manager ledger across the platform.' : isTenant ? 'Review rent amounts, due dates and payment status for your tenancy.' : 'Add rent schedules for your tenants and keep monthly payment status up to date.'} />
    {isAdmin && <div className="section-heading"><div><h2>Admin views</h2><p>Choose which ledger to inspect.</p></div><div><button className={view === 'tenant' ? 'primary-btn' : 'secondary-btn'} onClick={() => setView('tenant')}>Tenant records</button> <button className={view === 'manager' ? 'primary-btn' : 'secondary-btn'} onClick={() => setView('manager')}>Manager records</button></div></div>}
    {!isTenant && view === 'manager' && <section className="content-card"><h2>Add monthly rent record</h2><form className="stacked-form" onSubmit={submit}>
      <label htmlFor="rental-tenant">Tenant</label><select id="rental-tenant" required value={form.tenantId} onChange={(e) => setForm({ ...form, tenantId: e.target.value })}><option value="">Select tenant</option>{tenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name} · {tenant.email}</option>)}</select>
      <label htmlFor="rental-property">Property</label><input id="rental-property" required value={form.property} onChange={(e) => setForm({ ...form, property: e.target.value })} />
      <label htmlFor="rental-unit">Unit</label><input id="rental-unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
      <label htmlFor="rental-month">Rental month</label><input id="rental-month" type="month" required value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} />
      <label htmlFor="rental-amount">Rent amount (RM)</label><input id="rental-amount" type="number" min="0.01" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
      <label htmlFor="rental-due">Due date</label><input id="rental-due" type="date" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
      {error && <p className="form-message error">{error}</p>}{message && <p className="form-message success">{message}</p>}<button className="primary-btn">Add rental record</button>
    </form></section>}
    <section className="content-card" style={{ marginTop: 20 }}><div className="section-heading"><div><h2>{isTenant ? 'My monthly rent' : view === 'tenant' ? 'Tenant payment records' : 'Managed properties'}</h2><p>{isTenant ? 'Records associated with your tenant account.' : 'Monthly rent and payment status.'}</p></div></div>
      {loading ? <p>Loading rental records…</p> : shownRecords.length === 0 ? <p className="muted">No rental records found.</p> : <div className="table-container"><table className="user-table"><thead><tr>{(!isTenant || isAdmin) && <th>TENANT</th>}{isAdmin && <th>MANAGER</th>}<th>PROPERTY / UNIT</th><th>MONTH</th><th>AMOUNT</th><th>DUE DATE</th><th>STATUS</th>{!isTenant && view === 'manager' && <th>UPDATE</th>}</tr></thead><tbody>{shownRecords.map((record) => <tr key={record._id}>{(!isTenant || isAdmin) && <td>{record.tenantName}</td>}{isAdmin && <td>{record.managerName}</td>}<td>{record.property}{record.unit ? ` · ${record.unit}` : ''}</td><td>{record.month}</td><td>RM{Number(record.amount).toFixed(2)}</td><td>{dateText(record.dueDate)}</td><td><span className="role-badge">{record.status}</span></td>{!isTenant && view === 'manager' && <td><select aria-label="Update rental payment status" value={record.status} onChange={(e) => setStatus(record, e.target.value)}>{['Pending', 'Paid', 'Overdue'].map((status) => <option key={status}>{status}</option>)}</select></td>}</tr>)}</tbody></table></div>}
    </section>
  </div>
}
