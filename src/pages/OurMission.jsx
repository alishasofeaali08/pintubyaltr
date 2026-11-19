import PageHeading from '../components/PageHeading'

export default function OurMission() {
  return (
    <div className="container wide">
      <PageHeading title="Our Mission 🎯" subtitle="What Are the Goals of PINTU's Development?" />
      <section className="content-card mission-content">
        <div className="mission-image"><img src="/images/ourmission.png" alt="PINTU Mission" /></div>
        <div className="mission-text">
          <p>PINTU aims to simplify and improve the way rental properties are managed by creating a unified digital platform that connects landlords, tenants, and property managers in one convenient space. Our goal is to reduce the challenges of traditional property management by making essential tasks such as rental payment tracking, maintenance requests, tenant communication, and property information management more organised, accessible, and efficient.</p>
          <p>Through a centralised system, users can manage their responsibilities, monitor important updates, and access relevant information without relying on multiple platforms or complicated manual processes. PINTU also strives to promote transparency, improve communication between all parties, and minimise misunderstandings throughout the rental process.</p>
          <p>By combining practical features with a user-friendly experience, we hope to make property management more convenient for everyone involved while building a more reliable and connected rental management environment. Ultimately, PINTU seeks to transform everyday rental management into a smarter, simpler, and more seamless experience through technology and innovation.</p>
        </div>
      </section>
    </div>
  )
}
