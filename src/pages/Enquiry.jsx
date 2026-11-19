import { useState } from 'react'
import PageHeading from '../components/PageHeading'
import { useAuth } from '../context/useAuth'
import { submitEnquiry } from '../lib/enquiries'

const subjects = [
  'Account Registration',
  'Property Management',
  'Rental Payments',
  'Maintenance Requests',
  'Technical Support',
  'Feedback',
  'Other',
]

export default function Enquiry() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: '',
    subject: '',
    message: '',
  })
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setFeedback('')
    setSending(true)
    try {
      await submitEnquiry({ ...form, userId: user?.id || null })
      setFeedback('Thank you! Your enquiry has been submitted. We will get back to you soon.')
      setForm((previous) => ({ ...previous, subject: '', message: '' }))
    } catch (err) {
      setError(err.message || 'Unable to submit your enquiry.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="container wide">
      <PageHeading
        title="Have an Enquiry? 💬"
        subtitle="We're Here to Help You!"
        description="Have questions about PINTU or need assistance with property management? Send us your enquiry and our team will be happy to assist you."
      />

      <div className="enquiry-layout">
        <section className="content-card contact-info">
          <h2>Get in Touch</h2>
          <p>Whether you are a landlord, tenant, or property manager, we welcome your questions, feedback, and suggestions.</p>
          <div className="contact-item"><span>📩</span><div><h3>Email</h3><p>alishasofeaali@gmail.com</p></div></div>
          <div className="contact-item"><span>⏰</span><div><h3>Response Time</h3><p>We aim to respond as soon as possible.</p></div></div>
          <div className="contact-item"><span>🤝</span><div><h3>Our Commitment</h3><p>We value your feedback and strive to improve your property management experience.</p></div></div>
        </section>

        <section className="content-card enquiry-form">
          <h2>Send Us an Enquiry</h2>
          <form id="enquiryForm" onSubmit={submit} className="stacked-form">
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter your full name" />
            <label htmlFor="email">Email Address</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter your email address" />
            <label htmlFor="role">I am a</label>
            <select id="role" name="role" required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="">Select your role</option>
              {['Landlord', 'Tenant', 'Property Manager', 'Other'].map((role) => <option key={role}>{role}</option>)}
            </select>
            <label htmlFor="subject">Enquiry Subject</label>
            <select id="subject" name="subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
              <option value="">Select an enquiry subject</option>
              {subjects.map((subject) => <option key={subject}>{subject}</option>)}
            </select>
            <label htmlFor="message">Your Message</label>
            <textarea id="message" name="message" rows="5" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us how we can help..." />
            <button type="submit" className="primary-btn" disabled={sending}>{sending ? 'Sending...' : 'Submit Enquiry'}</button>
            {feedback && <p id="form-message" className="form-message success" aria-live="polite">{feedback}</p>}
            {error && <p className="form-message error" role="alert">{error}</p>}
          </form>
        </section>
      </div>
    </div>
  )
}
