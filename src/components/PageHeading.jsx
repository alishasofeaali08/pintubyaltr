export default function PageHeading({ title, subtitle, description }) {
  return (
    <section className="page-heading">
      <h1>{title}</h1>
      {subtitle && <h3>{subtitle}</h3>}
      {description && <p>{description}</p>}
    </section>
  )
}
