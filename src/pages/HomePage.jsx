import { useState } from 'react'
import ProductGrid from '../components/ProductGrid'
import SiteFooter from '../components/SiteFooter'
import { apiFetch } from '../lib/api'
import { parseJson } from '../lib/http'
import { aboutPoints, serviceCards, serviceHighlights, topbarDetails } from '../data/siteContent'

function ContactIcon({ type }) {
  if (type === 'message-circle') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.9-.9L3 21l1.9-5.2a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 1 1 21 11.5Z" />
      </svg>
    )
  }

  if (type === 'mail') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16v12H4z" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    )
  }

  if (type === 'phone') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a16 16 0 0 0 6.4 6.4l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5A2 2 0 0 1 22 16.9Z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-6-4.4-6-10a6 6 0 1 1 12 0c0 5.6-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  )
}

function getContactHref(item) {
  if (item.label === 'Email') {
    return `mailto:${item.value}`
  }

  if (item.label === 'WhatsApp') {
    const normalized = item.value.replace(/[^\d]/g, '')
    return `https://wa.me/${normalized}`
  }

  if (item.label === 'Telephone') {
    return `tel:${item.value}`
  }

  return ''
}

export default function HomePage({
  cartMessage,
  catalogNotice,
  filteredProducts,
  isLoadingProducts,
  onAddToCart,
  onOpenPage,
  onRetryPayment,
  onSelectProduct,
  paymentStatus,
  formatCurrency,
}) {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [contactStatus, setContactStatus] = useState({ type: '', message: '' })
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)

  async function handleContactSubmit(event) {
    event.preventDefault()
    setContactStatus({ type: '', message: '' })
    setIsSubmittingContact(true)

    try {
      const response = await apiFetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      })

      const data = await parseJson(response)

      setContactStatus({ type: 'success', message: data.message || 'Message sent successfully.' })
      setContactForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      })
    } catch (error) {
      setContactStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to send message.',
      })
    } finally {
      setIsSubmittingContact(false)
    }
  }

  return (
    <>
      <main>
        <section className="bg-[linear-gradient(120deg,#171717_0%,#2b2417_45%,#8a6824_100%)] text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-20">
            <div className="max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-amber-300">Build With Confidence</p>
              <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
                Building materials supply with a stronger, cleaner online storefront.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-stone-200 sm:text-lg">
                Inspired by the industrial rhythm of your reference site, this homepage now leads with a stronger
                corporate hero, product emphasis, and a clearer path into the catalog.
              </p>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_30px_90px_rgba(0,0,0,0.2)]">
              <img
                src="https://images.pexels.com/photos/5511075/pexels-photo-5511075.jpeg?cs=srgb&dl=pexels-mike-van-schoonderwalt-1884800-5511075.jpg&fm=jpg"
                alt="Construction site with crane and foundation work"
                className="h-[20rem] w-full object-cover sm:h-[24rem] lg:h-[29rem]"
              />
            </div>
          </div>
        </section>

        {paymentStatus.message ? (
          <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
            <div
              className={`rounded-[1.6rem] border px-6 py-5 ${
                paymentStatus.state === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : paymentStatus.state === 'error'
                    ? 'border-rose-200 bg-rose-50 text-rose-800'
                    : 'border-amber-200 bg-amber-50 text-amber-900'
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm font-medium">{paymentStatus.message}</p>
                {paymentStatus.retryable ? (
                  <button
                    onClick={() => onRetryPayment(paymentStatus.reference)}
                    className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
                  >
                    Retry Payment
                  </button>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        <section id="products" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:py-18">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-700">Product Center</p>
              <h2 className="mt-4 font-serif text-4xl leading-tight text-stone-950 sm:text-5xl">
                Core materials for foundations, walling, reinforcement, and site work.
              </h2>
            </div>

            <button
              onClick={() => onOpenPage('/products')}
              className="rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Open Full Catalog
            </button>
          </div>

          {catalogNotice ? (
            <div className="mt-6 rounded-[1.3rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
              {catalogNotice}
            </div>
          ) : null}

          {cartMessage ? (
            <div className="mt-6 rounded-[1.3rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
              {cartMessage}
            </div>
          ) : null}

          {isLoadingProducts ? (
            <div className="mt-8 rounded-[1.6rem] border border-stone-200 bg-white px-6 py-16 text-center text-sm text-stone-500">
              Loading products...
            </div>
          ) : (
            <div className="mt-8">
              <ProductGrid
                products={filteredProducts.slice(0, 3)}
                onAddToCart={onAddToCart}
                onSelectProduct={onSelectProduct}
                formatCurrency={formatCurrency}
              />
            </div>
          )}
        </section>

        <section id="service" className="bg-white py-12 sm:py-14 lg:py-18">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-700">Our Services</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight text-stone-950 sm:text-5xl">
                  What the company can supply for building projects.
                </h2>
              </div>

              <div className="rounded-[1.5rem] border border-stone-200 bg-[#f8f5ee] px-6 py-5">
                <p className="text-base leading-8 text-stone-700">{serviceHighlights.join(' ')}</p>
              </div>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {serviceCards.map((item, index) => (
                <article key={item.title} className="rounded-[1.8rem] border border-stone-200 bg-white p-6 shadow-[0_20px_55px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-800">
                      0{index + 1}
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">Service</p>
                  </div>
                  <h3 className="mt-5 font-serif text-2xl text-stone-950">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-stone-600">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:py-18">
          <div className="grid gap-8 rounded-[2rem] bg-stone-950 px-5 py-8 text-white sm:px-8 sm:py-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-14">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-300">About Us</p>
              <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">
                Built for practical supply, not cluttered browsing.
              </h2>
            </div>

            <div className="grid gap-4">
              {aboutPoints.map((point) => (
                <div key={point} className="rounded-[1.3rem] border border-white/10 bg-white/5 px-5 py-4">
                  <p className="text-sm leading-7 text-stone-200">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_20px_55px_rgba(0,0,0,0.05)] sm:p-8 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-700">Contact Us</p>
                <h2 className="mt-4 font-serif text-3xl leading-tight text-stone-950 sm:text-4xl lg:text-5xl">
                  Speak with us about prices, products, and project orders.
                </h2>
                <p className="mt-5 max-w-xl text-base leading-8 text-stone-600">
                  Send us a message directly from the site and the team can respond through the configured Resend email flow.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {topbarDetails.map((item) => (
                    <div key={item.label} className="rounded-[1.3rem] border border-stone-200 bg-[#f8f5ee] px-5 py-5">
                      <div className="flex items-center gap-3 text-amber-700">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                          <ContactIcon type={item.icon} />
                        </span>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em]">{item.label}</p>
                      </div>
                      {getContactHref(item) ? (
                        <a
                          href={getContactHref(item)}
                          target={item.label === 'WhatsApp' ? '_blank' : undefined}
                          rel={item.label === 'WhatsApp' ? 'noreferrer' : undefined}
                          className="mt-3 block text-sm leading-7 text-stone-700 transition hover:text-stone-950 hover:underline"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="mt-3 text-sm leading-7 text-stone-700">{item.value}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <form className="grid gap-4 rounded-[1.6rem] border border-stone-200 bg-[#f8f5ee] p-6" onSubmit={handleContactSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    value={contactForm.name}
                    onChange={(event) => setContactForm((current) => ({ ...current, name: event.target.value }))}
                    type="text"
                    placeholder="Full name"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  />
                  <input
                    value={contactForm.email}
                    onChange={(event) => setContactForm((current) => ({ ...current, email: event.target.value }))}
                    type="email"
                    placeholder="Email address"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    value={contactForm.phone}
                    onChange={(event) => setContactForm((current) => ({ ...current, phone: event.target.value }))}
                    type="tel"
                    placeholder="Phone number"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  />
                  <input
                    value={contactForm.subject}
                    onChange={(event) => setContactForm((current) => ({ ...current, subject: event.target.value }))}
                    type="text"
                    placeholder="Subject"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  />
                </div>

                <textarea
                  value={contactForm.message}
                  onChange={(event) => setContactForm((current) => ({ ...current, message: event.target.value }))}
                  rows="6"
                  placeholder="Tell us what you need"
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                />

                {contactStatus.message ? (
                  <p className={`text-sm ${contactStatus.type === 'success' ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {contactStatus.message}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="rounded-full bg-stone-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                >
                  {isSubmittingContact ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter onOpenPage={onOpenPage} />
    </>
  )
}
