import { useEffect, useState } from 'react'
import AlertModal from '../components/AlertModal'
import { apiFetch } from '../lib/api'
import { parseJson } from '../lib/http'

const emptyProductForm = {
  name: '',
  category: '',
  price: '',
  unit: '',
  badge: '',
  stock: 'In Stock',
  description: '',
  imageUrl: '',
}

const orderStatuses = ['awaiting_payment', 'paid', 'processing', 'delivered', 'cancelled', 'payment_issue']

function getStatusBadgeClasses(status) {
  if (['paid', 'success', 'delivered'].includes(status)) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  }

  if (['processing', 'pending', 'initialized', 'awaiting_payment'].includes(status)) {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }

  if (['failed', 'abandoned', 'reversed', 'payment_issue', 'cancelled'].includes(status)) {
    return 'border-rose-200 bg-rose-50 text-rose-800'
  }

  return 'border-stone-200 bg-stone-100 text-stone-700'
}

export default function AdminPage({ openPage, products, onProductsRefresh }) {
  const safeProducts = Array.isArray(products) ? products : []
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('adminToken') || '')
  const [adminUsername, setAdminUsername] = useState(() => localStorage.getItem('adminUsername') || '')
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [productSearch, setProductSearch] = useState('')
  const [productCategoryFilter, setProductCategoryFilter] = useState('All')
  const [editingProductId, setEditingProductId] = useState('')
  const [orders, setOrders] = useState([])
  const [orderFilter, setOrderFilter] = useState('all')
  const [orderStatusDrafts, setOrderStatusDrafts] = useState({})
  const [adminAlert, setAdminAlert] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState('')
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState('')

  const adminCategories = ['All', ...new Set(safeProducts.map((product) => product.category))]
  const visibleProducts = safeProducts.filter((product) => {
    const normalizedSearch = productSearch.trim().toLowerCase()
    const matchesSearch =
      !normalizedSearch ||
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.category.toLowerCase().includes(normalizedSearch) ||
      product.description.toLowerCase().includes(normalizedSearch)

    const matchesCategory = productCategoryFilter === 'All' || product.category === productCategoryFilter

    return matchesSearch && matchesCategory
  })
  const visibleOrders = orders.filter((order) => {
    if (orderFilter === 'all') {
      return true
    }

    return order.orderStatus === orderFilter || order.paymentStatus === orderFilter
  })
  const dashboardStats = {
    totalProducts: safeProducts.length,
    visibleProducts: visibleProducts.length,
    totalOrders: orders.length,
    visibleOrders: visibleOrders.length,
    paidOrders: orders.filter((order) => order.paymentStatus === 'success' || order.orderStatus === 'paid').length,
    paymentIssues: orders.filter((order) =>
      ['failed', 'abandoned', 'reversed', 'payment_issue'].includes(order.paymentStatus) ||
      order.orderStatus === 'payment_issue'
    ).length,
  }

  function showAdminAlert(variant, title, message, autoCloseMs = variant === 'success' ? 2200 : 0) {
    setAdminAlert({ variant, title, message, autoCloseMs, id: `${Date.now()}-${Math.random()}` })
  }

  useEffect(() => {
    if (!adminAlert?.autoCloseMs) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => setAdminAlert(null), adminAlert.autoCloseMs)
    return () => window.clearTimeout(timeoutId)
  }, [adminAlert])

  useEffect(() => {
    if (!adminToken) {
      return
    }

    let ignore = false

    async function loadOrders() {
      try {
        setIsLoadingOrders(true)
        const data = await parseJson(
          await apiFetch('/api/orders', {
            headers: {
              Authorization: `Bearer ${adminToken}`,
            },
          })
        )

        if (!ignore) {
          setOrders(data.orders)
          setOrderStatusDrafts(
            Object.fromEntries(data.orders.map((order) => [order.id, order.orderStatus || 'awaiting_payment']))
          )
        }
      } catch (error) {
        if (!ignore) {
          showAdminAlert('error', 'Orders could not be loaded', error instanceof Error ? error.message : 'Unable to load orders.')
        }
      } finally {
        if (!ignore) {
          setIsLoadingOrders(false)
        }
      }
    }

    loadOrders()

    return () => {
      ignore = true
    }
  }, [adminToken])

  function resetProductForm() {
    setEditingProductId('')
    setProductForm(emptyProductForm)
  }

  function startEditingProduct(product) {
    setEditingProductId(product.id)
    setProductForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      unit: product.unit,
      badge: product.badge,
      stock: product.stock,
      description: product.description,
      imageUrl: product.imageUrl,
    })
  }

  function handleImageFileChange(event) {
    const [file] = event.target.files || []

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      showAdminAlert('warning', 'Image format not supported', 'Selected file must be an image.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const nextImageUrl = typeof reader.result === 'string' ? reader.result : ''
      setProductForm((current) => ({
        ...current,
        imageUrl: nextImageUrl,
      }))
      showAdminAlert('success', 'Image preview ready', 'Image loaded into preview. Save the product to keep it.')
    }
    reader.onerror = () => {
      showAdminAlert('error', 'Image could not be read', 'Unable to read the selected image file.')
    }
    reader.readAsDataURL(file)
  }

  async function handleLogin(event) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const data = await parseJson(
        await apiFetch('/api/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        })
      )

      setAdminToken(data.token)
      setAdminUsername(data.username)
      localStorage.setItem('adminToken', data.token)
      localStorage.setItem('adminUsername', data.username)
      setCredentials({ username: '', password: '' })
      showAdminAlert('success', 'Admin signed in', 'Admin login successful.')
    } catch (error) {
      showAdminAlert('error', 'Login failed', error instanceof Error ? error.message : 'Unable to log in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleLogout() {
    setAdminToken('')
    setAdminUsername('')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUsername')
    resetProductForm()
    setOrders([])
    setOrderStatusDrafts({})
    setIsLoadingOrders(false)
  }

  async function handleProductSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const endpoint = editingProductId ? `/api/admin/products/${editingProductId}` : '/api/admin/products'
      const method = editingProductId ? 'PUT' : 'POST'

      await parseJson(
        await apiFetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            ...productForm,
            price: Number(productForm.price),
          }),
        })
      )

      await onProductsRefresh()
      showAdminAlert('success', editingProductId ? 'Product updated' : 'Product created', editingProductId ? 'Product updated successfully.' : 'Product created successfully.')
      resetProductForm()
    } catch (error) {
      showAdminAlert('error', 'Product could not be saved', error instanceof Error ? error.message : 'Unable to save product.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteProduct(productId) {
    setIsDeletingId(productId)

    try {
      await parseJson(
        await apiFetch(`/api/admin/products/${productId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        })
      )

      await onProductsRefresh()
      if (editingProductId === productId) {
        resetProductForm()
      }
      showAdminAlert('success', 'Product deleted', 'Product deleted successfully.')
    } catch (error) {
      showAdminAlert('error', 'Product could not be deleted', error instanceof Error ? error.message : 'Unable to delete product.')
    } finally {
      setIsDeletingId('')
    }
  }

  async function handleOrderStatusSave(orderId) {
    setUpdatingOrderId(orderId)

    try {
      const data = await parseJson(
        await apiFetch(`/api/admin/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            orderStatus: orderStatusDrafts[orderId],
          }),
        })
      )

      setOrders((currentOrders) =>
        currentOrders.map((order) => (order.id === orderId ? { ...order, ...data.order } : order))
      )
      showAdminAlert('success', 'Order updated', `Order ${data.order.reference} updated successfully.`)
    } catch (error) {
      showAdminAlert('error', 'Order could not be updated', error instanceof Error ? error.message : 'Unable to update order status.')
    } finally {
      setUpdatingOrderId('')
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff4d6_0%,#f5efe4_45%,#efe7da_100%)] px-6 py-10">
      <AlertModal
        isOpen={Boolean(adminAlert)}
        message={adminAlert?.message || ''}
        onClose={() => setAdminAlert(null)}
        title={adminAlert?.title || ''}
        variant={adminAlert?.variant || 'info'}
      />
      {!adminToken ? (
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-stone-200/80 bg-white/95 p-10 shadow-[0_30px_90px_rgba(0,0,0,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-700">Admin Login</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-stone-950">Sign in to continue.</h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-stone-600">
              Product and order management only appear after successful admin authentication.
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleLogin}>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                Username
              </span>
              <input
                value={credentials.username}
                onChange={(event) => setCredentials((current) => ({ ...current, username: event.target.value }))}
                type="text"
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                Password
              </span>
              <input
                value={credentials.password}
                onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
                type="password"
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
              />
            </label>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
              >
                {isSubmitting ? 'Signing In...' : 'Log In'}
              </button>
              <button
                type="button"
                onClick={() => openPage('/')}
                className="rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-950"
              >
                Return to Homepage
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.08)]">
            <div className="bg-[linear-gradient(140deg,#171717_0%,#2e2617_55%,#8a6824_100%)] px-8 py-8 text-white">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">Admin Dashboard</p>
                  <h1 className="mt-4 font-serif text-4xl leading-tight">Product and order operations</h1>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-stone-200">
                    Logged in as <span className="font-semibold text-white">{adminUsername}</span>. Use this route to
                    maintain the storefront catalog and monitor incoming customer orders.
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
                >
                  Log Out
                </button>
              </div>
            </div>

            <div className="px-8 py-6" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.6rem] border border-stone-200 bg-white p-6 shadow-[0_20px_55px_rgba(0,0,0,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Catalog Items</p>
              <p className="mt-4 font-serif text-4xl text-stone-950">{dashboardStats.totalProducts}</p>
              <p className="mt-2 text-sm text-stone-500">{dashboardStats.visibleProducts} currently visible in filter</p>
            </div>
            <div className="rounded-[1.6rem] border border-stone-200 bg-white p-6 shadow-[0_20px_55px_rgba(0,0,0,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Orders</p>
              <p className="mt-4 font-serif text-4xl text-stone-950">{dashboardStats.totalOrders}</p>
              <p className="mt-2 text-sm text-stone-500">{dashboardStats.visibleOrders} currently visible in filter</p>
            </div>
            <div className="rounded-[1.6rem] border border-emerald-200 bg-emerald-50 p-6 shadow-[0_20px_55px_rgba(0,0,0,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Paid Orders</p>
              <p className="mt-4 font-serif text-4xl text-emerald-900">{dashboardStats.paidOrders}</p>
              <p className="mt-2 text-sm text-emerald-700">Confirmed payments ready for fulfillment</p>
            </div>
            <div className="rounded-[1.6rem] border border-rose-200 bg-rose-50 p-6 shadow-[0_20px_55px_rgba(0,0,0,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">Payment Issues</p>
              <p className="mt-4 font-serif text-4xl text-rose-900">{dashboardStats.paymentIssues}</p>
              <p className="mt-2 text-sm text-rose-700">Orders needing payment attention or retry</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_20px_55px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Product Form</p>
                  <h2 className="mt-3 font-serif text-3xl text-stone-950">
                    {editingProductId ? 'Edit product' : 'Create product'}
                  </h2>
                </div>
                {editingProductId ? (
                  <button
                    onClick={resetProductForm}
                    className="rounded-full border border-stone-300 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-950"
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>

              <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleProductSubmit}>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Name</span>
                  <input
                    value={productForm.name}
                    onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
                    type="text"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Category</span>
                  <input
                    value={productForm.category}
                    onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))}
                    type="text"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Price</span>
                  <input
                    value={productForm.price}
                    onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))}
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Unit</span>
                  <input
                    value={productForm.unit}
                    onChange={(event) => setProductForm((current) => ({ ...current, unit: event.target.value }))}
                    type="text"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Badge</span>
                  <input
                    value={productForm.badge}
                    onChange={(event) => setProductForm((current) => ({ ...current, badge: event.target.value }))}
                    type="text"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Stock</span>
                  <input
                    value={productForm.stock}
                    onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))}
                    type="text"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Image URL</span>
                  <input
                    value={productForm.imageUrl}
                    onChange={(event) => setProductForm((current) => ({ ...current, imageUrl: event.target.value }))}
                    type="text"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Upload Image</span>
                  <input
                    onChange={handleImageFileChange}
                    type="file"
                    accept="image/*"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-stone-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-stone-800"
                  />
                </label>
                <div className="md:col-span-2 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Image Preview</p>
                  {productForm.imageUrl ? (
                    <div className="mt-4 overflow-hidden rounded-[1.2rem] border border-stone-200 bg-white">
                      <img src={productForm.imageUrl} alt="Product preview" className="h-52 w-full object-cover" />
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-stone-500">Paste an image URL or upload a local image file to preview it here.</p>
                  )}
                </div>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Description</span>
                  <textarea
                    value={productForm.description}
                    onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))}
                    rows="4"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  />
                </label>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full bg-stone-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                  >
                    {isSubmitting ? 'Saving...' : editingProductId ? 'Save Product Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_20px_55px_rgba(0,0,0,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Catalog Products</p>
              <h2 className="mt-3 font-serif text-3xl text-stone-950">Manage storefront items</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                    Search Products
                  </span>
                  <input
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    type="text"
                    placeholder="Search by name, category, or description"
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                    Filter Category
                  </span>
                  <select
                    value={productCategoryFilter}
                    onChange={(event) => setProductCategoryFilter(event.target.value)}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  >
                    {adminCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <p className="mt-4 text-sm text-stone-600">
                Showing <span className="font-semibold text-stone-950">{visibleProducts.length}</span> of{' '}
                    <span className="font-semibold text-stone-950">{safeProducts.length}</span> products
              </p>

              <div className="mt-6 space-y-4">
                {visibleProducts.map((product) => (
                  <div key={product.id} className="rounded-[1.4rem] border border-stone-200 bg-stone-50 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex gap-4">
                        <img src={product.imageUrl} alt={product.name} className="h-20 w-20 rounded-2xl object-cover" />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">{product.category}</p>
                            <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getStatusBadgeClasses(product.stock.toLowerCase().replace(/\s+/g, '_'))}`}>
                              {product.stock}
                            </span>
                          </div>
                          <h3 className="mt-2 font-serif text-2xl text-stone-950">{product.name}</h3>
                          <p className="mt-2 text-sm leading-7 text-stone-600">{product.description}</p>
                          <p className="mt-3 text-sm font-semibold text-stone-950">
                            GHS {Number(product.price).toFixed(2)} {product.unit}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => startEditingProduct(product)}
                          className="rounded-full border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-950"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={isDeletingId === product.id}
                          className="rounded-full bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-rose-300"
                        >
                          {isDeletingId === product.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {visibleProducts.length === 0 ? (
                  <div className="rounded-[1.4rem] border border-dashed border-stone-300 bg-stone-50 px-5 py-10 text-center text-sm text-stone-500">
                    No products match the current search or category filter.
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_20px_55px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Order Management</p>
                <h2 className="mt-3 font-serif text-3xl text-stone-950">Review and update customer orders</h2>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                  Filter Orders
                </span>
                <select
                  value={orderFilter}
                  onChange={(event) => setOrderFilter(event.target.value)}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                >
                  <option value="all">All Orders</option>
                  <option value="awaiting_payment">Awaiting Payment</option>
                  <option value="success">Successful Payments</option>
                  <option value="processing">Processing</option>
                  <option value="delivered">Delivered</option>
                  <option value="payment_issue">Payment Issues</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
            </div>

            {isLoadingOrders ? (
              <div className="mt-6 rounded-[1.4rem] border border-stone-200 bg-stone-50 px-5 py-10 text-center text-sm text-stone-500">
                Loading orders...
              </div>
            ) : visibleOrders.length === 0 ? (
              <div className="mt-6 rounded-[1.4rem] border border-dashed border-stone-300 bg-stone-50 px-5 py-10 text-center text-sm text-stone-500">
                No orders match the current filter.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {visibleOrders.map((order) => (
                  <div key={order.id} className="rounded-[1.4rem] border border-stone-200 bg-stone-50 p-5">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                            {order.reference}
                          </p>
                          <h3 className="mt-2 font-serif text-2xl text-stone-950">{order.customer.name}</h3>
                          <p className="mt-2 text-sm leading-7 text-stone-600">
                            {order.customer.email} | {order.customer.phone}
                          </p>
                          <p className="text-sm leading-7 text-stone-600">
                            {order.customer.deliveryMethod === 'delivery'
                              ? `Delivery to: ${order.customer.address}`
                              : 'Pickup at store'}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em]">
                          <span className={`rounded-full border px-3 py-2 ${getStatusBadgeClasses(order.orderStatus)}`}>
                            Order: {order.orderStatus}
                          </span>
                          <span className={`rounded-full border px-3 py-2 ${getStatusBadgeClasses(order.paymentStatus)}`}>
                            Payment: {order.paymentStatus}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {order.cart.map((item) => (
                            <div key={`${order.id}-${item.id}`} className="text-sm text-stone-600">
                              {item.name} x {item.quantity}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="w-full max-w-sm space-y-4">
                        <div className="rounded-[1.1rem] border border-stone-200 bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Total</p>
                          <p className="mt-2 text-sm text-stone-500">
                            {order.customer.deliveryMethod === 'delivery'
                              ? `Includes delivery fee of GHS ${Number(order.totals.deliveryFee || 0).toFixed(2)}`
                              : 'Pickup order with no delivery fee'}
                          </p>
                          <p className="mt-3 text-2xl font-semibold text-stone-950">
                            GHS {Number(order.totals.total).toFixed(2)}
                          </p>
                        </div>

                        <label className="block">
                          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                            Update Order Status
                          </span>
                          <select
                            value={orderStatusDrafts[order.id] || order.orderStatus}
                            onChange={(event) =>
                              setOrderStatusDrafts((current) => ({
                                ...current,
                                [order.id]: event.target.value,
                              }))
                            }
                            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                          >
                            {orderStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </label>

                        <button
                          onClick={() => handleOrderStatusSave(order.id)}
                          disabled={updatingOrderId === order.id}
                          className="w-full rounded-full bg-stone-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                        >
                          {updatingOrderId === order.id ? 'Saving...' : 'Save Order Status'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
