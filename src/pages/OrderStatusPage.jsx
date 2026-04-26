function getBadgeClasses(status) {
  if (['success', 'paid', 'delivered'].includes(status)) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  }

  if (['initialized', 'pending', 'processing', 'awaiting_payment'].includes(status)) {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }

  return 'border-rose-200 bg-rose-50 text-rose-800'
}

export default function OrderStatusPage({
  customerAccount,
  isLoadingOrderHistory,
  onOpenAuth,
  onOpenCart,
  onOpenPage,
  onRetryPayment,
  orderHistory,
  paymentStatus,
}) {
  const isSuccess = paymentStatus.state === 'success'
  const isError = paymentStatus.state === 'error'
  const hasReference = Boolean(paymentStatus.reference)
  const order = paymentStatus.order
  const itemCount = order?.cart?.reduce((total, item) => total + item.quantity, 0) || 0
  const currencyFormatter = new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const panelClasses = !hasReference
    ? 'border-stone-200 bg-white text-stone-900'
    : isSuccess
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : isError
        ? 'border-rose-200 bg-rose-50 text-rose-900'
        : 'border-amber-200 bg-amber-50 text-amber-900'

  const heading = !hasReference
    ? customerAccount
      ? 'Your account orders'
      : 'Order access requires login'
    : isSuccess
      ? 'Payment successful'
      : isError
        ? 'Payment needs attention'
        : 'Payment status in progress'

  const description = !hasReference
    ? customerAccount
      ? 'Review your recent orders and continue shopping from here.'
      : 'Log in to review your order history and verify payments linked to your account.'
    : paymentStatus.message || 'We are checking the payment status for your order.'

  return (
    <main className="px-6 py-12 lg:py-16">
      <div className="mx-auto max-w-5xl print:max-w-none">
        <div className={`rounded-[2rem] border p-8 shadow-[0_20px_55px_rgba(0,0,0,0.05)] lg:p-10 ${panelClasses}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.35em]">Order Status</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight lg:text-5xl">{heading}</h1>
          <p className="mt-5 max-w-3xl text-base leading-8">{description}</p>

          {paymentStatus.reference ? (
            <div className="mt-6 rounded-[1.3rem] border border-current/15 bg-white/50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-70">Reference</p>
              <p className="mt-2 text-lg font-semibold">{paymentStatus.reference}</p>
              {paymentStatus.paymentState ? (
                <p className="mt-3 text-sm opacity-80">Gateway status: {paymentStatus.paymentState}</p>
              ) : null}
            </div>
          ) : null}

          <div className="no-print mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => onOpenPage('/products')}
              className="rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Continue Shopping
            </button>
            {!customerAccount ? (
              <button
                onClick={() => onOpenAuth('login')}
                className="rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-950"
              >
                Sign Up / Login
              </button>
            ) : null}
            <button
              onClick={onOpenCart}
              className="rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-950"
            >
              Open Cart
            </button>
            {paymentStatus.retryable ? (
              <button
                onClick={() => onRetryPayment(paymentStatus.reference)}
                className="rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-950"
              >
                Retry Payment
              </button>
            ) : null}
            <button
              onClick={() => window.print()}
              className="rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-950"
            >
              Print Receipt
            </button>
          </div>
        </div>

        {order ? (
          <div className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-[0_20px_55px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-700">Order Details</p>
                  <h2 className="mt-3 font-serif text-3xl text-stone-950">Order summary</h2>
                </div>
                <div className="text-sm text-stone-500">
                  <p>
                    {itemCount} item{itemCount === 1 ? '' : 's'}
                  </p>
                  <p className="mt-1">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString('en-GH') : 'No timestamp'}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {order.cart.map((item) => (
                  <div key={`${order.reference}-${item.id}`} className="rounded-[1.1rem] border border-stone-200 bg-stone-50 px-4 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-stone-950">{item.name}</p>
                        <p className="mt-1 text-sm text-stone-500">
                          {item.quantity} x {item.unit}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-stone-950">
                        {currencyFormatter.format(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-[0_20px_55px_rgba(0,0,0,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-700">Customer</p>
                <div className="mt-4 space-y-3 text-sm leading-7 text-stone-600">
                  <p><span className="font-semibold text-stone-950">Name:</span> {order.customer.name}</p>
                  <p><span className="font-semibold text-stone-950">Email:</span> {order.customer.email}</p>
                  <p><span className="font-semibold text-stone-950">Phone:</span> {order.customer.phone}</p>
                  <p><span className="font-semibold text-stone-950">Fulfillment:</span> {order.customer.deliveryMethod || 'pickup'}</p>
                  <p><span className="font-semibold text-stone-950">Address:</span> {order.customer.address || 'Pickup at store'}</p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-[0_20px_55px_rgba(0,0,0,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-700">Totals</p>
                <div className="mt-4 space-y-3 text-sm text-stone-600">
                  <div className="flex items-center justify-between gap-4">
                    <span>Subtotal</span>
                    <span className="font-semibold text-stone-950">{currencyFormatter.format(order.totals.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Delivery</span>
                    <span className="font-semibold text-stone-950">{currencyFormatter.format(order.totals.deliveryFee)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-stone-200 pt-3">
                    <span>Total</span>
                    <span className="text-lg font-semibold text-stone-950">{currencyFormatter.format(order.totals.total)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-[0_20px_55px_rgba(0,0,0,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-700">Receipt Notes</p>
                <div className="mt-4 space-y-3 text-sm leading-7 text-stone-600">
                  <p>
                    Reference: <span className="font-semibold text-stone-950">{order.reference}</span>
                  </p>
                  <p>
                    Payment status: <span className="font-semibold text-stone-950">{paymentStatus.paymentState || 'pending'}</span>
                  </p>
                  <p>
                    Order status: <span className="font-semibold text-stone-950">{order.orderStatus}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-8 rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-[0_20px_55px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-700">My Orders</p>
              <h2 className="mt-3 font-serif text-3xl text-stone-950">Account order history</h2>
            </div>
            {customerAccount ? (
              <p className="text-sm text-stone-500">{customerAccount.email}</p>
            ) : null}
          </div>

          {!customerAccount ? (
            <div className="mt-6 rounded-[1.4rem] border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm leading-7 text-amber-900">
                Log in to review previous purchases and keep future checkout receipts linked to your account.
              </p>
              <button
                onClick={() => onOpenAuth('login')}
                className="mt-4 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                Sign Up / Login
              </button>
            </div>
          ) : isLoadingOrderHistory ? (
            <div className="mt-6 rounded-[1.4rem] border border-stone-200 bg-stone-50 px-5 py-10 text-center text-sm text-stone-500">
              Loading your orders...
            </div>
          ) : orderHistory.length === 0 ? (
            <div className="mt-6 rounded-[1.4rem] border border-dashed border-stone-300 bg-stone-50 px-5 py-10 text-center text-sm text-stone-500">
              No orders found for this account yet.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {orderHistory.map((entry) => (
                <div key={entry.id} className="rounded-[1.4rem] border border-stone-200 bg-stone-50 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">{entry.reference}</p>
                      <h3 className="mt-2 font-serif text-2xl text-stone-950">{entry.customer.name}</h3>
                      <p className="mt-2 text-sm leading-7 text-stone-600">
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleString('en-GH') : 'No timestamp'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em]">
                      <span className={`rounded-full border px-3 py-2 ${getBadgeClasses(entry.paymentStatus)}`}>
                        Payment: {entry.paymentStatus}
                      </span>
                      <span className={`rounded-full border px-3 py-2 ${getBadgeClasses(entry.orderStatus)}`}>
                        Order: {entry.orderStatus}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="space-y-2 text-sm text-stone-600">
                      {entry.cart.map((item) => (
                        <div key={`${entry.reference}-${item.id}`}>
                          {item.name} x {item.quantity}
                        </div>
                      ))}
                      <div className="pt-2 font-medium text-stone-700">
                        Fulfillment: {entry.customer.deliveryMethod || 'pickup'}
                      </div>
                    </div>
                    <div className="rounded-[1.1rem] border border-stone-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Order Total</p>
                      <p className="mt-3 text-2xl font-semibold text-stone-950">{currencyFormatter.format(entry.totals.total)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
