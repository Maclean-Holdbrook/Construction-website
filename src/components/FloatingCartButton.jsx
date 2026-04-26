function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="20" r="1.6" />
      <circle cx="18" cy="20" r="1.6" />
      <path d="M3 4h2.4l2.3 10.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20.3 7H6.2" />
    </svg>
  )
}

export default function FloatingCartButton({ cartItemCount, cartTotal, formatCurrency, isVisible, onOpenCart }) {
  if (!isVisible || cartItemCount === 0) {
    return null
  }

  return (
    <button
      onClick={onOpenCart}
      className="fixed bottom-4 right-4 z-30 flex items-center gap-3 rounded-full border border-stone-950 bg-stone-950 px-4 py-3 text-white shadow-[0_22px_55px_rgba(0,0,0,0.24)] transition hover:bg-stone-800 sm:bottom-6 sm:right-6 sm:px-5 sm:py-4"
    >
      <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-amber-300">
        <CartIcon />
        <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-stone-950">
          {cartItemCount}
        </span>
      </span>
      <span className="text-left">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-300">Your Cart</span>
        <span className="mt-1 block text-sm font-semibold sm:text-base">{formatCurrency(cartTotal)}</span>
      </span>
    </button>
  )
}
