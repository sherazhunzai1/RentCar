import { FAQS } from '../data/faqs'

// Homepage FAQ accordion (native <details> so it works without JS / in the
// prerendered HTML) plus FAQPage structured data for Google rich results.
export default function Faq() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <section className="section section-muted">
      <div className="container narrow">
        <div className="section-head">
          <h2>Frequently asked questions</h2>
          <p>Everything you need to know about booking with gaadi.pk.</p>
        </div>

        <div className="faq-list">
          {FAQS.map((f) => (
            <details className="faq-item" key={f.q}>
              <summary>
                <span>{f.q}</span>
                <span className="faq-icon" aria-hidden="true">+</span>
              </summary>
              <div className="faq-answer">
                <p>{f.a}</p>
              </div>
            </details>
          ))}
        </div>

        {/* Structured data — rendered into the (prerendered) HTML for crawlers */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </div>
    </section>
  )
}
