export default function FloatingCartButton({ cartItemCount, cartTotal, formatCurrency, isVisible, onOpenCart }) {
  if (!isVisible || cartItemCount === 0) {
    return null
  }

  return (
    <button
      onClick={onOpenCart}
      className="fixed bottom-4 right-4 z-30 max-w-[calc(100vw-2rem)] rounded-[1.4rem] border border-stone-950 bg-stone-950 px-4 py-3 text-left text-white shadow-[0_22px_55px_rgba(0,0,0,0.24)] transition hover:bg-stone-800 sm:bottom-6 sm:right-6 sm:px-5 sm:py-4"
    >
      <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-300">Cart Ready</span>
      <span className="mt-2 block text-xs font-semibold sm:text-sm">
        {cartItemCount} item{cartItemCount === 1 ? '' : 's'}
      </span>
      <span className="mt-1 block text-base font-semibold sm:text-lg">{formatCurrency(cartTotal)}</span>
    </button>
  )
}
