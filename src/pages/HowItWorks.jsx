import PageHeading from '../components/PageHeading'

const audiences = [
  { icon: '🏡', name: 'Landlords', text: 'Manage rental properties, monitor payments, keep track of tenants, and stay updated on property maintenance.' },
  { icon: '🔑', name: 'Tenants', text: 'Access rental information, keep track of payment details, and submit maintenance requests conveniently.' },
  { icon: '📋', name: 'Property Managers', text: 'Oversee property activities, coordinate maintenance, and manage communication between landlords and tenants.' },
]

const steps = [
  ['Create an Account', 'Users begin by registering for a PINTU account and selecting their role as a landlord, tenant, or property manager. Each user can access features according to their responsibilities.'],
  ['Manage Property Information', 'Landlords and property managers can organise their rental property details in one place. Important information such as property details, rental information, and tenant records can be managed through the platform.'],
  ['Connect Landlords and Tenants', 'PINTU provides a centralised environment where landlords, tenants, and property managers can access relevant rental information and stay informed about property-related matters.'],
  ['Track Rental Payments', 'Users can keep track of rental payment information and payment records more systematically. This helps landlords monitor rental transactions while allowing tenants to stay aware of their payment responsibilities.'],
  ['Submit Maintenance Requests', 'When a property requires repairs or maintenance, tenants can submit requests through PINTU. Landlords and property managers can review these requests and coordinate the necessary follow-up actions.'],
  ['Monitor and Stay Updated', 'With property information, payment records, and maintenance requests organised in one platform, users can monitor important activities and manage their rental responsibilities more efficiently.'],
]

export default function HowItWorks() {
  return (
    <div className="container wide">
      <PageHeading
        title="How PINTU Works 🏠"
        subtitle="A Simpler Way to Manage Rental Properties"
        description="PINTU brings landlords, tenants, and property managers together through one centralised platform. From managing rental payments to handling maintenance requests, everything is designed to make property management easier and more organised."
      />

      <section className="content-card">
        <h2>Who Can Use PINTU?</h2>
        <div className="user-cards">
          {audiences.map((audience) => (
            <article className="user-card" key={audience.name}>
              <div className="user-icon">{audience.icon}</div>
              <h3>{audience.name}</h3>
              <p>{audience.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-card">
        <h2>How Does It Work?</h2>
        <p className="section-description">Follow these simple steps to experience smarter rental management.</p>
        <div className="steps-container">
          {steps.map(([title, text], index) => (
            <article className="step-card" key={title}>
              <div className="step-number">{String(index + 1).padStart(2, '0')}</div>
              <div className="step-content"><h3>{title}</h3><p>{text}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-card closing-section">
        <h2>Everything You Need, All in One Place.</h2>
        <p>PINTU makes rental property management more convenient by bringing essential information and tasks together in one accessible platform. Less hassle, better organisation, and smoother property management.</p>
      </section>
    </div>
  )
}
