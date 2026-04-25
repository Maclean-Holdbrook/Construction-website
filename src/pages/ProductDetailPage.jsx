import { useState } from 'react'
import ProductGrid from '../components/ProductGrid'

export default function ProductDetailPage({
  cartItemCount,
  cartSubtotal,
  product,
  relatedProducts,
  onAddToCart,
  onOpenCart,
  onOpenPage,
  onOpenProductPage,
  onSelectProduct,
  formatCurrency,
}) {
  const [quantity, setQuantity] = useState(1)

  if (!product) {
    return (
      <main className="px-6 py-14">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-stone-200 bg-white p-10 shadow-[0_20px_55px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-700">Product</p>
          <h1 className="mt-4 font-serif text-4xl text-stone-950">Product not found</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-stone-600">
            The product page could not be loaded. Return to the catalog and choose another item.
          </p>
          <button
            onClick={() => onOpenPage('/products')}
            className="mt-8 rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Back to Products
          </button>
        </div>
      </main>
    )
  }

  return (
    <main>
      <section className="bg-[linear-gradient(120deg,#171717_0%,#2b2417_45%,#8a6824_100%)] text-white">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-stone-300">
            <button onClick={() => onOpenPage('/')} className="transition hover:text-white">
              Home
            </button>
            <span>/</span>
            <button onClick={() => onOpenPage('/products')} className="transition hover:text-white">
              Products
            </button>
            <span>/</span>
            <button
              onClick={() => {
                onOpenPage('/products')
              }}
              className="text-amber-300 transition hover:text-white"
            >
              {product.category}
            </button>
          </div>
          <div className="mt-5 grid gap-8 lg:grid-cols-[0.95fr_0.85fr] lg:items-start">
            <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/5">
              <img src={product.imageUrl} alt={product.name} className="h-[19rem] w-full object-cover sm:h-[24rem]" />
            </div>

            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">{product.category}</p>
              <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{product.name}</h1>
              <p className="mt-5 text-sm leading-7 text-stone-200 sm:text-base">{product.description}</p>

              <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/5 p-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-stone-300">Price</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(product.price)}</p>
                    <p className="mt-2 text-sm text-stone-300">{product.unit}</p>
                  </div>
                  <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-950">
                    {product.badge}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-white/20 px-3 py-2">
                    <button
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      className="h-9 w-9 rounded-full border border-white/20 text-sm font-semibold text-white"
                    >
                      -
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity((current) => current + 1)}
                      className="h-9 w-9 rounded-full border border-white/20 text-sm font-semibold text-white"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => onAddToCart(product, quantity)}
                    className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"
                  >
                    Add {quantity} to Cart
                  </button>
                  <button
                    onClick={onOpenCart}
                    className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
                  >
                    Open Cart
                  </button>
                  <button
                    onClick={() => onOpenPage('/products')}
                    className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
                  >
                    Browse Catalog
                  </button>
                </div>

                <div className="mt-5 rounded-[1.1rem] border border-white/10 bg-white/5 px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-300">Cart Progress</p>
                      <p className="mt-2 text-sm text-stone-200">
                        {cartItemCount > 0
                          ? `${cartItemCount} item${cartItemCount === 1 ? '' : 's'} in cart`
                          : 'Your cart is still empty'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Subtotal</p>
                      <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(cartSubtotal)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.7rem] border border-stone-200 bg-white p-6 shadow-[0_20px_55px_rgba(0,0,0,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Product Summary</p>
            <h2 className="mt-4 font-serif text-3xl text-stone-950">Built for everyday construction needs</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-stone-600">
              <p>
                {product.name} is listed for direct ordering with clear unit pricing so buyers can make faster supply
                decisions without waiting for a manual quote first.
              </p>
              <p>
                This page is part of the new storefront flow: browse the catalog, inspect product details, add items to
                cart, and continue to Paystack checkout from the cart modal.
              </p>
            </div>
          </div>

          <div className="grid gap-5 rounded-[1.7rem] border border-stone-200 bg-white p-6 shadow-[0_20px_55px_rgba(0,0,0,0.05)] sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[1.2rem] bg-[#f8f5ee] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">Material Type</p>
              <p className="mt-3 font-serif text-2xl text-stone-950">{product.category}</p>
            </div>
            <div className="rounded-[1.2rem] bg-[#f8f5ee] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">Sales Unit</p>
              <p className="mt-3 font-serif text-2xl text-stone-950">{product.unit}</p>
            </div>
            <div className="rounded-[1.2rem] bg-[#f8f5ee] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">Availability</p>
              <p className="mt-3 font-serif text-2xl text-stone-950">{product.stock}</p>
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="mx-auto max-w-6xl px-6 pb-14">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-700">Related Products</p>
              <h2 className="mt-3 font-serif text-3xl text-stone-950">More in {product.category}</h2>
            </div>
            <button
              onClick={() => onOpenPage('/products')}
              className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-950"
            >
              Back to Full Catalog
            </button>
          </div>

          <div className="mt-8">
            <ProductGrid
              products={relatedProducts}
              onAddToCart={onAddToCart}
              onOpenProductPage={onOpenProductPage}
              onSelectProduct={onSelectProduct}
              formatCurrency={formatCurrency}
            />
          </div>
        </section>
      ) : null}
    </main>
  )
}
