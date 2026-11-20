import { useState } from 'react'
import PageHeading from '../components/PageHeading'
import { useAuth } from '../context/useAuth'
import { PAYMENT_OPTIONS, getPaymentSettings, savePaymentSettings } from '../lib/paymentMethods'

export default function PaymentManagement() {
  const { user } = useAuth()
  const [settings, setSettings] = useState(() => getPaymentSettings(user.id))
  const [number, setNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [message, setMessage] = useState('')
  const update = (next) => { setSettings(next); savePaymentSettings(user.id, next); setMessage('Payment settings saved.') }
  const toggle = (method) => {
    const enabled = settings.enabled.includes(method) ? settings.enabled.filter((item) => item !== method) : [...settings.enabled, method]
    update({ ...settings, enabled, preferred: enabled.includes(settings.preferred) ? settings.preferred : enabled[0] || '' })
  }
  const addCard = (event) => {
    event.preventDefault()
    const digits = number.replace(/\D/g, '')
    if (digits.length < 12 || digits.length > 19 || !expiry) { setMessage('Enter a valid card number and expiry date.'); return }
    const card = { id: `${Date.now()}`, brand: /^4/.test(digits) ? 'Visa' : /^5/.test(digits) ? 'Mastercard' : 'Card', last4: digits.slice(-4), expiry }
    update({ ...settings, cards: [...settings.cards, card], enabled: settings.enabled.includes(card.brand) || !['Visa', 'Mastercard'].includes(card.brand) ? settings.enabled : [...settings.enabled, card.brand] })
    setNumber(''); setExpiry('')
  }
  const removeCard = (id) => update({ ...settings, cards: settings.cards.filter((card) => card.id !== id) })
  return <div className="container wide">
    <PageHeading title="Payment Management" subtitle="Configure the payment methods available to your account." description="Use your Dashboard to add money to your PINTU wallet." />
    <section className="content-card">
      <div className="section-heading"><div><h2>Payment methods</h2><p>Select methods to show in Dashboard payment settings.</p></div></div>
      <div className="tier-grid">{PAYMENT_OPTIONS.map((method) => <label className="content-card" key={method} style={{ margin: 0, display: 'flex', gap: 12, alignItems: 'center' }}><input type="checkbox" checked={settings.enabled.includes(method)} onChange={() => toggle(method)} />{method}</label>)}</div>
    </section>
    <section className="content-card" style={{ marginTop: 20 }}>
      <h2>Saved cards</h2><p className="muted">Only a card label and last four digits are stored here. Real card tokenization needs a payment provider.</p>
      {settings.cards.length ? settings.cards.map((card) => <div className="transaction-item" key={card.id}><strong>{card.brand} ending in {card.last4} · expires {card.expiry}</strong><button className="secondary-btn" type="button" onClick={() => removeCard(card.id)}>Remove</button></div>) : <p className="muted">No cards saved.</p>}
      <form className="topup-form" onSubmit={addCard} style={{ marginTop: 16 }}><input inputMode="numeric" autoComplete="cc-number" aria-label="Card number" placeholder="Card number" value={number} onChange={(e) => setNumber(e.target.value)} /><input aria-label="Expiry date" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} /><button className="secondary-btn">Save card</button></form>
      {message && <p className="form-message success">{message}</p>}
      <p className="muted">Wallet top-ups and payments are initiated from the Dashboard.</p>
    </section>
  </div>
}
