import ProductGrid from '../components/ProductGrid'
import SiteFooter from '../components/SiteFooter'

export default function ProductsPage({
  activeCategory,
  cartItemCount,
  cartSubtotal,
  cartMessage,
  categories,
  catalogNotice,
  filteredProducts,
  isLoadingProducts,
  onAddToCart,
  onChangeCategory,
  onChangeSearch,
  onChangeSort,
  onOpenCart,
  onOpenPage,
  onOpenProductPage,
  onSelectProduct,
  paymentStatus,
  onRetryPayment,
  searchTerm,
  sortOption,
  formatCurrency,
}) {
  return (
    <>
      <main>
        <section className="bg-[linear-gradient(120deg,#171717_0%,#2b2417_45%,#8a6824_100%)] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:py-18">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-amber-300">Products</p>
          <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-tight sm:text-6xl">
            Full building materials catalog with prices and direct cart actions.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-stone-200 sm:text-lg">
            This page is now separated from the homepage so the landing page can stay cleaner while the catalog gets
            its own product-first layout.
          </p>
        </div>
        </section>

        {paymentStatus.message ? (
          <section className="mx-auto max-w-7xl px-6 pt-8">
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

        <section className="mx-auto max-w-7xl px-6 py-14 lg:py-18">
          <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
            <aside className="self-start rounded-[1.8rem] border border-stone-200 bg-white p-6 shadow-[0_20px_55px_rgba(0,0,0,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-700">Categories</p>
            <div className="mt-6 grid gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => onChangeCategory(category)}
                  className={`rounded-[1.1rem] border px-4 py-4 text-left text-sm font-semibold uppercase tracking-[0.16em] transition ${
                    activeCategory === category
                      ? 'border-stone-950 bg-stone-950 text-white'
                      : 'border-stone-200 bg-[#f8f5ee] text-stone-700 hover:border-stone-950'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            </aside>

            <div>
              <div className="mb-4 rounded-[1.6rem] border border-stone-950 bg-stone-950 px-6 py-5 text-white shadow-[0_20px_55px_rgba(0,0,0,0.16)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">Cart Summary</p>
                  <p className="mt-3 text-sm text-stone-300">
                    {cartItemCount > 0
                      ? `${cartItemCount} item${cartItemCount === 1 ? '' : 's'} currently in cart`
                      : 'No products in cart yet'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Current Total</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(cartSubtotal)}</p>
                  </div>
                  <button
                    onClick={onOpenCart}
                    className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"
                  >
                    Open Cart
                  </button>
                </div>
              </div>
              </div>

              <div className="rounded-[1.6rem] border border-stone-200 bg-white px-6 py-5 shadow-[0_20px_55px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Catalog View</p>
                  <h2 className="mt-3 font-serif text-3xl text-stone-950">
                    {activeCategory === 'All' ? 'All building materials' : `${activeCategory} products`}
                  </h2>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                      Search
                    </span>
                    <input
                      value={searchTerm}
                      onChange={(event) => onChangeSearch(event.target.value)}
                      type="text"
                      placeholder="Search materials"
                      className="rounded-full border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                      Sort By
                    </span>
                    <select
                      value={sortOption}
                      onChange={(event) => onChangeSort(event.target.value)}
                      className="rounded-full border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name-asc">Name: A to Z</option>
                      <option value="name-desc">Name: Z to A</option>
                    </select>
                  </label>
                  <p className="text-sm text-stone-600">
                    Showing <span className="font-semibold text-stone-950">{filteredProducts.length}</span> item
                    {filteredProducts.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
              </div>

              {catalogNotice ? (
                <div className="mt-4 rounded-[1.3rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                  {catalogNotice}
                </div>
              ) : null}

              {cartMessage ? (
                <div className="mt-4 rounded-[1.3rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
                  {cartMessage}
                </div>
              ) : null}

              {isLoadingProducts ? (
                <div className="mt-4 rounded-[1.6rem] border border-stone-200 bg-white px-6 py-16 text-center text-sm text-stone-500">
                  Loading products...
                </div>
              ) : (
                <div className="mt-6">
                  <ProductGrid
                    products={filteredProducts}
                    onAddToCart={onAddToCart}
                    onOpenProductPage={onOpenProductPage}
                    onSelectProduct={onSelectProduct}
                    formatCurrency={formatCurrency}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter onOpenPage={onOpenPage} />
    </>
  )
}
