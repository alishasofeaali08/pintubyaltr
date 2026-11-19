import { Link } from 'react-router-dom'
import PageHeading from '../components/PageHeading'

const categories = [
  {
    title: 'General Questions',
    items: [
      ['What is PINTU?', 'PINTU is a digital property management platform designed to connect landlords, tenants, and property managers. It helps organise rental property information, payment records, and maintenance requests in one centralised platform.'],
      ['Who can use PINTU?', 'PINTU is designed for landlords, tenants, and property managers who want a more organised and convenient way to manage rental properties.'],
      ['What is the main purpose of PINTU?', 'The main purpose of PINTU is to simplify rental property management by improving organisation, communication, and accessibility of important property-related information.'],
    ],
  },
  {
    title: 'Account and Registration',
    items: [
      ['How do I create a PINTU account?', 'Visit the registration page, enter the required information, and select your account role. Follow the registration instructions to create your account.'],
      ['Can I choose my user role?', 'Yes. During registration, users can select the appropriate role, such as landlord, tenant, or property manager, depending on their responsibilities.'],
      ['What should I do if I forget my password?', 'If you cannot access your account, use the password recovery option if available. Otherwise, contact the PINTU support team for assistance.'],
    ],
  },
  {
    title: 'Property Management',
    items: [
      ['How can landlords manage their properties?', 'Landlords can use PINTU to organise property information, keep track of rental details, monitor payment records, and review maintenance requests.'],
      ['Can tenants submit maintenance requests?', 'Yes. Tenants can submit maintenance requests to report property issues. Landlords or property managers can review the requests and coordinate the necessary follow-up actions.'],
      ['Can property managers oversee multiple properties?', 'PINTU is designed to help property managers organise property-related information and activities. The availability of multiple-property management depends on the platform’s implemented features.'],
    ],
  },
  {
    title: 'Payments and Support',
    items: [
      ['Can I make rental payments through PINTU?', 'PINTU aims to help users manage rental payment information and records. Whether payments can be completed directly through the platform depends on the payment features currently available.'],
      ['How can I contact the PINTU team?', 'You can visit our Enquiry page and submit the contact form with your details and message. Our team will be able to review your enquiry.'],
      ['What if I encounter a technical issue?', 'If you experience difficulties while using PINTU, submit an enquiry through our Enquiry page and describe the issue so our team can assist you.'],
    ],
  },
]

export default function FAQ() {
  return (
    <div className="container wide">
      <PageHeading
        title="Frequently Asked Questions ❓"
        subtitle="Everything You Need to Know About PINTU"
        description="Looking for answers? Explore our frequently asked questions to learn more about PINTU and how it simplifies rental property management."
      />
      <section className="faq-section">
        {categories.map((category) => (
          <div className="faq-category" key={category.title}>
            <h2>{category.title}</h2>
            {category.items.map(([question, answer]) => (
              <details className="faq-item" key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        ))}
      </section>
      <section className="content-card faq-contact">
        <h2>Still Have Questions?</h2>
        <p>Couldn&apos;t find the answer you were looking for? We&apos;re happy to hear from you.</p>
        <Link to="/enquiry" className="primary-btn">Contact Us</Link>
      </section>
    </div>
  )
}
