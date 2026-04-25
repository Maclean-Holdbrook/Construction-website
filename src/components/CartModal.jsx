export default function CartModal({
  cart,
  cartSubtotal,
  checkoutError,
  customer,
  customerAccount,
  deliveryFee,
  formatCurrency,
  isOpen,
  isSubmittingCheckout,
  onCheckout,
  onClearCart,
  onClose,
  onOpenAuth,
  onRemoveItem,
  onUpdateCustomerField,
  orderTotal,
  onUpdateQuantity,
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 px-4 py-6" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-[1.6rem] border border-white/80 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-700">Cart</p>
            <h2 className="mt-2 font-serif text-3xl text-stone-950">Your order</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 transition hover:border-stone-950"
          >
            Close
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="mt-6 rounded-[1.4rem] border border-stone-200 bg-stone-50 px-5 py-10 text-center">
            <p className="text-sm leading-7 text-stone-600">Your cart is empty. Add products from the catalog.</p>
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="rounded-[1.3rem] border border-stone-200 bg-stone-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-stone-950">{item.name}</p>
                      <p className="mt-1 text-sm text-stone-500">
                        {formatCurrency(item.price)} {item.unit}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="h-9 w-9 rounded-full border border-stone-300 text-sm font-semibold"
                      >
                        -
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold text-stone-900">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="h-9 w-9 rounded-full border border-stone-300 text-sm font-semibold"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-sm font-semibold text-stone-950">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={onClearCart} className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
              Clear Cart
            </button>

            <div className="mt-6 rounded-[1.4rem] border border-stone-200 bg-stone-50 p-5">
              <div className="flex items-center justify-between text-sm text-stone-600">
                <span>Subtotal</span>
                <span>{formatCurrency(cartSubtotal)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-stone-600">
                <span>{customer.deliveryMethod === 'delivery' ? 'Delivery Fee' : 'Pickup'}</span>
                <span>{customer.deliveryMethod === 'delivery' ? formatCurrency(deliveryFee) : 'Free'}</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
                <span className="text-sm font-semibold text-stone-950">Total</span>
                <span className="text-lg font-semibold text-stone-950">{formatCurrency(orderTotal)}</span>
              </div>
            </div>

            {!customerAccount ? (
              <div className="mt-6 rounded-[1.4rem] border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm leading-7 text-amber-900">
                  Sign up or log in before checkout so your payment and order history stay attached to your account.
                </p>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="mt-4 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
                >
                  Sign Up / Login
                </button>
              </div>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={onCheckout}>
                <div className="rounded-[1.4rem] border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Signed In Account</p>
                  <p className="mt-2 font-semibold text-stone-950">{customerAccount.name}</p>
                  <p className="mt-1">{customerAccount.email}</p>
                </div>

                <input
                  value={customer.name}
                  onChange={(event) => onUpdateCustomerField('name', event.target.value)}
                  type="text"
                  placeholder="Full name"
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                />
                <input
                  value={customer.email}
                  type="email"
                  readOnly
                  className="w-full rounded-2xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm text-stone-500 outline-none"
                />
                <input
                  value={customer.phone}
                  onChange={(event) => onUpdateCustomerField('phone', event.target.value)}
                  type="tel"
                  placeholder="Phone number"
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => onUpdateCustomerField('deliveryMethod', 'pickup')}
                    className={`rounded-2xl border px-4 py-4 text-left text-sm transition ${
                      customer.deliveryMethod === 'pickup'
                        ? 'border-stone-950 bg-stone-950 text-white'
                        : 'border-stone-300 bg-white text-stone-900'
                    }`}
                  >
                    <span className="block font-semibold">Pickup</span>
                    <span className="mt-1 block text-xs opacity-80">Collect at the store with no extra charge.</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateCustomerField('deliveryMethod', 'delivery')}
                    className={`rounded-2xl border px-4 py-4 text-left text-sm transition ${
                      customer.deliveryMethod === 'delivery'
                        ? 'border-stone-950 bg-stone-950 text-white'
                        : 'border-stone-300 bg-white text-stone-900'
                    }`}
                  >
                    <span className="block font-semibold">Delivery</span>
                    <span className="mt-1 block text-xs opacity-80">Delivered to site for {formatCurrency(deliveryFee)}.</span>
                  </button>
                </div>
                <textarea
                  value={customer.address}
                  onChange={(event) => onUpdateCustomerField('address', event.target.value)}
                  rows="3"
                  placeholder={customer.deliveryMethod === 'delivery' ? 'Delivery address' : 'Pickup note (optional)'}
                  className={`w-full rounded-2xl px-4 py-3 text-sm outline-none transition ${
                    customer.deliveryMethod === 'delivery'
                      ? 'border border-stone-300 bg-white text-stone-900 focus:border-amber-500'
                      : 'border border-stone-200 bg-stone-50 text-stone-700 focus:border-stone-300'
                  }`}
                />

                {customer.deliveryMethod === 'delivery' ? (
                  <p className="text-xs text-stone-500">
                    Delivery adds {formatCurrency(deliveryFee)} to this order.
                  </p>
                ) : (
                  <p className="text-xs text-stone-500">Pickup is free. You can still leave a note if needed.</p>
                )}

                {checkoutError ? <p className="text-sm text-rose-600">{checkoutError}</p> : null}

                <button
                  type="submit"
                  disabled={isSubmittingCheckout}
                  className="w-full rounded-full bg-stone-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                >
                  {isSubmittingCheckout ? 'Redirecting...' : 'Proceed to Paystack'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
