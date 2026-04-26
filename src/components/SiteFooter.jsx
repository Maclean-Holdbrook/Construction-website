import { useState } from 'react'
import { topbarDetails } from '../data/siteContent'
import { apiFetch } from '../lib/api'

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

export default function SiteFooter({ onAlert, onOpenPage }) {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)

  async function handleContactSubmit(event) {
    event.preventDefault()
    setIsSubmittingContact(true)

    try {
      const response = await apiFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to send message.')
      }

      onAlert({
        autoCloseMs: 2400,
        message: data.message || 'Message sent successfully.',
        title: 'Message sent',
        variant: 'success',
      })
      setContactForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      })
    } catch (error) {
      onAlert({
        message: error instanceof Error ? error.message : 'Unable to send message.',
        title: 'Message could not be sent',
        variant: 'error',
      })
    } finally {
      setIsSubmittingContact(false)
    }
  }

  return (
    <footer className="relative overflow-hidden bg-[linear-gradient(135deg,#111111_0%,#1c1c1c_45%,#2d2d2d_100%)] text-white">
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full bg-[radial-gradient(circle_at_top_right,#ffffff_0%,transparent_45%)]" />
      </div>

      <div className="relative border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-2 xl:grid-cols-4">
          {topbarDetails.map((item) => (
            <div key={item.label} className="flex items-start gap-4">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-amber-300">
                <ContactIcon type={item.icon} />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{item.label} :</p>
                {getContactHref(item) ? (
                  <a
                    href={getContactHref(item)}
                    target={item.label === 'WhatsApp' ? '_blank' : undefined}
                    rel={item.label === 'WhatsApp' ? 'noreferrer' : undefined}
                    className="mt-2 block text-sm leading-7 text-stone-300 transition hover:text-white"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-2 text-sm leading-7 text-stone-300">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-serif text-4xl text-white">COMPANY</p>
          <div className="mt-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f59e0b_0%,#b91c1c_100%)] font-serif text-4xl font-semibold text-white shadow-[0_20px_55px_rgba(0,0,0,0.25)]">
            B
          </div>
          <p className="mt-6 text-base leading-9 text-stone-300">
            BuildMart Supply provides essential building materials for homes, compounds, commercial projects, and contractor
            site work across core stages of construction.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.7fr_0.9fr_1.1fr]">
          <div className="text-center lg:text-left">
            <p className="font-serif text-4xl text-white">QUICK LINK</p>
            <div className="mt-6 space-y-4 text-lg text-stone-300">
              <button onClick={() => onOpenPage('/')} className="block w-full text-center transition hover:text-white lg:text-left">Home</button>
              <button onClick={() => onOpenPage('/products')} className="block w-full text-center transition hover:text-white lg:text-left">Products</button>
              <button onClick={() => onOpenPage('/', 'service')} className="block w-full text-center transition hover:text-white lg:text-left">Service</button>
              <button onClick={() => onOpenPage('/', 'about')} className="block w-full text-center transition hover:text-white lg:text-left">About Us</button>
              <button onClick={() => onOpenPage('/', 'contact')} className="block w-full text-center transition hover:text-white lg:text-left">Contact Us</button>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <p className="font-serif text-4xl text-white">PRODUCT CENTER</p>
            <div className="mt-6 space-y-4 text-lg text-stone-300">
              <button onClick={() => onOpenPage('/products')} className="block w-full text-center transition hover:text-white lg:text-left">Cement</button>
              <button onClick={() => onOpenPage('/products')} className="block w-full text-center transition hover:text-white lg:text-left">Concrete Blocks</button>
              <button onClick={() => onOpenPage('/products')} className="block w-full text-center transition hover:text-white lg:text-left">Sand</button>
              <button onClick={() => onOpenPage('/products')} className="block w-full text-center transition hover:text-white lg:text-left">Crushed Stones</button>
              <button onClick={() => onOpenPage('/products')} className="block w-full text-center transition hover:text-white lg:text-left">Iron Rods</button>
            </div>
          </div>

          <div>
            <p className="text-center font-serif text-4xl text-white lg:text-left">CONTACT US</p>
            <form className="mt-6 space-y-4" onSubmit={handleContactSubmit}>
              <input
                value={contactForm.name}
                onChange={(event) => setContactForm((current) => ({ ...current, name: event.target.value }))}
                type="text"
                placeholder="Name"
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-stone-300 outline-none transition focus:border-amber-400"
              />
              <input
                value={contactForm.phone}
                onChange={(event) => setContactForm((current) => ({ ...current, phone: event.target.value }))}
                type="tel"
                placeholder="Phone"
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-stone-300 outline-none transition focus:border-amber-400"
              />
              <input
                value={contactForm.email}
                onChange={(event) => setContactForm((current) => ({ ...current, email: event.target.value }))}
                type="email"
                placeholder="Email"
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-stone-300 outline-none transition focus:border-amber-400"
              />
              <textarea
                value={contactForm.message}
                onChange={(event) => setContactForm((current) => ({ ...current, message: event.target.value }))}
                rows="5"
                placeholder="Message"
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-stone-300 outline-none transition focus:border-amber-400"
              />

              <button
                type="submit"
                disabled={isSubmittingContact}
                className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-amber-300"
              >
                {isSubmittingContact ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-white/5">
        <div className="mx-auto flex max-w-7xl justify-center px-6 py-6 text-center text-sm text-stone-300">
          <p>Copyright (c) 2026 BuildMart Supply. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
