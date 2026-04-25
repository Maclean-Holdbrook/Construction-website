export default function ProductModal({ product, onAddAndViewCart, onClose, formatCurrency }) {
  if (!product) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 px-4 py-6" onClick={onClose}>
      <div
        className="w-full max-w-xl overflow-hidden rounded-[1.6rem] border border-white/70 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        <img src={product.imageUrl} alt={product.name} className="h-52 w-full object-cover" />
        <div className="space-y-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">{product.category}</p>
              <h3 className="mt-2 font-serif text-3xl text-stone-950">{product.name}</h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-full border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 transition hover:border-stone-950"
            >
              Close
            </button>
          </div>

          <p className="text-sm leading-7 text-stone-600">{product.description}</p>

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-2xl font-semibold text-stone-950">{formatCurrency(product.price)}</p>
              <p className="mt-1 text-sm text-stone-500">{product.unit}</p>
            </div>
            <button
              onClick={() => onAddAndViewCart(product)}
              className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Add and View Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
