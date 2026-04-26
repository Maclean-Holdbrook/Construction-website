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
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchOffset, setTouchOffset] = useState(0)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow

    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMobileMenuOpen])

  function closeMobileMenu() {
    setIsMobileMenuOpen(false)
    setTouchOffset(0)
    setTouchStartX(0)
  }

  function handleNavigate(action) {
    action(openPage)
    closeMobileMenu()
  }

  function handleTouchStart(event) {
    setTouchStartX(event.touches[0]?.clientX || 0)
  }

  function handleTouchMove(event) {
    const currentX = event.touches[0]?.clientX || 0
    const delta = currentX - touchStartX

    if (delta > 0) {
      setTouchOffset(Math.min(delta, 120))
    }
  }

  function handleTouchEnd() {
    if (touchOffset > 72) {
      closeMobileMenu()
      return
    }

    setTouchOffset(0)
    setTouchStartX(0)
  }

  const accountLabel = customerAccount?.name?.trim() || customerAccount?.email || 'Guest'

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
            <div
              className="fixed inset-0 z-40 bg-stone-950/45 backdrop-blur-sm transition-opacity duration-300"
              onClick={closeMobileMenu}
            />
            <div
              className="absolute right-4 top-[calc(100%+0.35rem)] z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] transition-transform duration-300 ease-out sm:right-6"
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchMove}
              onTouchStart={handleTouchStart}
              style={{ transform: `translateX(${touchOffset}px)` }}
            >
              <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
                <p className="text-sm font-semibold text-stone-950">{accountLabel}</p>
                <button
                  onClick={closeMobileMenu}
                  className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-950"
                  aria-label="Close menu"
                >
                  <HamburgerIcon isOpen />
                </button>
              </div>

              <div className="grid">
                {mobileLinks.map((link, index) => (
                  <button
                    key={link.label}
                    onClick={() => handleNavigate(link.action)}
                    className="translate-x-0 border-b border-stone-200 px-5 py-4 text-left text-base font-medium text-stone-900 opacity-100 transition duration-300 hover:bg-stone-50"
                    style={{ transitionDelay: `${90 + index * 35}ms` }}
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              <div className="grid">
                {customerAccount ? (
                  <div className="grid">
                    <button
                      onClick={() => {
                        onOpenOrders()
                        closeMobileMenu()
                      }}
                      className="border-b border-stone-200 px-5 py-4 text-left text-base font-medium text-stone-900 transition hover:bg-stone-50"
                    >
                      My Orders
                    </button>
                    <button
                      onClick={() => {
                        onLogout()
                        closeMobileMenu()
                      }}
                      className="px-5 py-4 text-left text-base font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Log Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onOpenAuth('login')
                      closeMobileMenu()
                    }}
                    className="w-full px-5 py-4 text-left text-base font-medium text-amber-700 transition hover:bg-amber-50"
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
