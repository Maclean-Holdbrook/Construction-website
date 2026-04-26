import { useEffect, useState } from 'react'
import { topbarDetails } from '../data/siteContent'

const mobileLinks = [
  { label: 'Home', action: (openPage) => openPage('/') },
  { label: 'Products', action: (openPage) => openPage('/products') },
  { label: 'Service', action: (openPage) => openPage('/', 'service') },
  { label: 'About Us', action: (openPage) => openPage('/', 'about') },
  { label: 'Contact Us', action: (openPage) => openPage('/', 'contact') },
]

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="20" r="1.6" />
      <circle cx="18" cy="20" r="1.6" />
      <path d="M3 4h2.4l2.3 10.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20.3 7H6.2" />
    </svg>
  )
}

function HamburgerIcon({ isOpen }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      {isOpen ? (
        <>
          <path d="M6 6 18 18" />
          <path d="M18 6 6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  )
}

export default function SiteHeader({ cartItemCount, customerAccount, onLogout, onOpenAuth, onOpenCart, onOpenOrders, openPage }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow

    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMobileMenuOpen])

  function handleNavigate(action) {
    action(openPage)
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <div className="border-b border-stone-800 bg-stone-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-stone-300 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
            {topbarDetails.map((item) => (
              <span key={item.label}>
                <span className="text-white">{item.label}</span> {item.value}
              </span>
            ))}
          </div>
          <span className="text-amber-300">Open for retail and contractor orders</span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <button onClick={() => openPage('/')} className="min-w-0 text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-amber-700 sm:text-xs sm:tracking-[0.4em]">
              BuildMart Supply
            </p>
            <p className="mt-1 font-serif text-lg text-stone-950 sm:mt-2 sm:text-2xl">Construction Materials</p>
          </button>

          <nav className="hidden items-center gap-8 text-sm font-semibold uppercase tracking-[0.18em] text-stone-700 lg:flex">
            {mobileLinks.map((link) => (
              <button key={link.label} onClick={() => link.action(openPage)} className="transition hover:text-stone-950">
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {customerAccount ? (
              <>
                <button
                  onClick={onOpenOrders}
                  className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-950"
                >
                  My Orders
                </button>
                <button
                  onClick={onLogout}
                  className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-950"
                >
                  Log Out
                </button>
              </>
            ) : (
              <button
                onClick={() => onOpenAuth('login')}
                className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-950"
              >
                Sign Up / Login
              </button>
            )}

            <button
              onClick={onOpenCart}
              className="relative rounded-full border border-stone-300 p-3 text-stone-900 transition hover:border-stone-950"
              aria-label={`Open cart with ${cartItemCount} item${cartItemCount === 1 ? '' : 's'}`}
            >
              <CartIcon />
              {cartItemCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-stone-950">
                  {cartItemCount}
                </span>
              ) : null}
            </button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onOpenCart}
              className="relative rounded-full border border-stone-300 p-3 text-stone-900 transition hover:border-stone-950"
              aria-label={`Open cart with ${cartItemCount} item${cartItemCount === 1 ? '' : 's'}`}
            >
              <CartIcon />
              {cartItemCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-stone-950">
                  {cartItemCount}
                </span>
              ) : null}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className="rounded-full border border-stone-300 p-3 text-stone-900 transition hover:border-stone-950"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <HamburgerIcon isOpen={isMobileMenuOpen} />
            </button>
          </div>
        </div>

        {isMobileMenuOpen ? (
          <div className="lg:hidden">
            <div className="fixed inset-0 z-40 bg-stone-950/45 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed right-0 top-0 z-50 flex h-full w-[86vw] max-w-sm flex-col border-l border-stone-200 bg-[linear-gradient(180deg,#ffffff_0%,#f6f0e5_100%)] px-5 pb-6 pt-24 shadow-[-24px_0_60px_rgba(15,23,42,0.18)]">
              <div className="rounded-[1.5rem] border border-stone-200 bg-white px-4 py-4 shadow-[0_16px_40px_rgba(0,0,0,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Quick Access</p>
                <p className="mt-2 text-sm leading-7 text-stone-600">
                  Browse the storefront, jump to sections, and manage your account from one place.
                </p>
              </div>

              <div className="mt-5 grid gap-3">
                {mobileLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => handleNavigate(link.action)}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-4 text-left text-sm font-semibold uppercase tracking-[0.18em] text-stone-900 transition hover:border-stone-950"
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              <div className="mt-5 border-t border-stone-200 pt-5">
                {customerAccount ? (
                  <div className="grid gap-3">
                    <button
                      onClick={() => {
                        onOpenOrders()
                        setIsMobileMenuOpen(false)
                      }}
                      className="rounded-2xl border border-stone-200 bg-white px-4 py-4 text-left text-sm font-semibold uppercase tracking-[0.18em] text-stone-900 transition hover:border-stone-950"
                    >
                      My Orders
                    </button>
                    <button
                      onClick={() => {
                        onLogout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="rounded-2xl border border-stone-950 bg-stone-950 px-4 py-4 text-left text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-stone-800"
                    >
                      Log Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onOpenAuth('login')
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full rounded-2xl border border-stone-950 bg-stone-950 px-4 py-4 text-left text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-stone-800"
                  >
                    Sign Up / Login
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </header>
    </>
  )
}
