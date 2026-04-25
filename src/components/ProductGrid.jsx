export default function ProductGrid({
  products,
  onAddToCart,
  onOpenProductPage,
  onSelectProduct,
  formatCurrency,
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <article
          key={product.id}
          className="overflow-hidden rounded-[1.6rem] border border-stone-200 bg-white shadow-[0_22px_55px_rgba(0,0,0,0.05)]"
        >
          <button
            onClick={() => (onOpenProductPage ? onOpenProductPage(product.id) : onSelectProduct(product))}
            className="block w-full text-left"
          >
            <img src={product.imageUrl} alt={product.name} className="h-56 w-full object-cover" />
          </button>

          <div className="space-y-4 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">{product.category}</p>
                <button
                  onClick={() => (onOpenProductPage ? onOpenProductPage(product.id) : onSelectProduct(product))}
                  className="mt-2 text-left font-serif text-2xl text-stone-950"
                >
                  {product.name}
                </button>
              </div>
              <span className="rounded-full bg-stone-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-700">
                {product.badge}
              </span>
            </div>

            <p className="text-sm leading-7 text-stone-600">{product.description}</p>

            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold text-stone-950">{formatCurrency(product.price)}</p>
                <p className="mt-1 text-sm text-stone-500">{product.unit}</p>
              </div>
              <button
                onClick={() => onAddToCart(product)}
                className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
