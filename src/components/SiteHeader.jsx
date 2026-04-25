import { useState } from 'react'
import { topbarDetails } from '../data/siteContent'

const mobileLinks = [
  { label: 'Home', action: (openPage) => openPage('/') },
  { label: 'Products', action: (openPage) => openPage('/products') },
  { label: 'Service', action: (openPage) => openPage('/', 'service') },
  { label: 'About Us', action: (openPage) => openPage('/', 'about') },
  { label: 'Contact Us', action: (openPage) => openPage('/', 'contact') },
]

export default function SiteHeader({ cartItemCount, customerAccount, onLogout, onOpenAuth, onOpenCart, onOpenOrders, openPage }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
              className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-950"
            >
              Cart ({cartItemCount})
            </button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onOpenCart}
              className="rounded-full border border-stone-300 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-stone-900 transition hover:border-stone-950 sm:px-5 sm:py-3 sm:text-sm"
            >
              Cart ({cartItemCount})
            </button>
            <button
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className="rounded-full border border-stone-300 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-900 transition hover:border-stone-950 sm:px-5 sm:py-3"
            >
              {isMobileMenuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        {isMobileMenuOpen ? (
          <div className="border-t border-stone-200 bg-white px-4 py-4 sm:px-6 lg:hidden">
            <div className="grid gap-3">
              {mobileLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavigate(link.action)}
                  className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-left text-sm font-semibold uppercase tracking-[0.18em] text-stone-900 transition hover:border-stone-950"
                >
                  {link.label}
                </button>
              ))}

              {customerAccount ? (
                <>
                  <button
                    onClick={() => {
                      onOpenOrders()
                      setIsMobileMenuOpen(false)
                    }}
                    className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-left text-sm font-semibold uppercase tracking-[0.18em] text-stone-900 transition hover:border-stone-950"
                  >
                    My Orders
                  </button>
                  <button
                    onClick={() => {
                      onLogout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-left text-sm font-semibold uppercase tracking-[0.18em] text-stone-900 transition hover:border-stone-950"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onOpenAuth('login')
                    setIsMobileMenuOpen(false)
                  }}
                  className="rounded-2xl border border-stone-950 bg-stone-950 px-4 py-4 text-left text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-stone-800"
                >
                  Sign Up / Login
                </button>
              )}
            </div>
          </div>
        ) : null}
      </header>
    </>
  )
}
