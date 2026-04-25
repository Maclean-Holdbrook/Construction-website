import { useEffect, useMemo, useState } from 'react'
import AuthModal from './components/AuthModal'
import CartModal from './components/CartModal'
import FloatingCartButton from './components/FloatingCartButton'
import ProductModal from './components/ProductModal'
import SiteHeader from './components/SiteHeader'
import fallbackProducts from './data/products'
import { apiFetch } from './lib/api'
import { parseJson } from './lib/http'
import AdminPage from './pages/AdminPage'
import HomePage from './pages/HomePage'
import OrderStatusPage from './pages/OrderStatusPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductsPage from './pages/ProductsPage'

const shopHashes = new Set(['', 'home', 'products', 'about', 'contact'])
const intendedRouteStorageKey = 'buildmart-intended-route'
const scrollPositionsStorageKey = 'buildmart-scroll-positions'
const deliveryFees = {
  pickup: 0,
  delivery: 150,
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function emptyCustomer() {
  return {
    name: '',
    email: '',
    phone: '',
    address: '',
    deliveryMethod: 'pickup',
  }
}

function customerFromAccount(account) {
  if (!account) {
    return emptyCustomer()
  }

  return {
    name: account.name || '',
    email: account.email || '',
    phone: account.phone || '',
    address: account.address || '',
    deliveryMethod: 'pickup',
  }
}

function readStoredAccount() {
  try {
    const raw = localStorage.getItem('customerAccount')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function getRouteUrl(locationObject = window.location) {
  return `${locationObject.pathname || '/'}${locationObject.search || ''}${locationObject.hash || ''}`
}

function readIntendedRoute() {
  try {
    return sessionStorage.getItem(intendedRouteStorageKey) || ''
  } catch {
    return ''
  }
}

function writeIntendedRoute(route) {
  try {
    sessionStorage.setItem(intendedRouteStorageKey, route)
  } catch {
    // Ignore storage failures.
  }
}

function readScrollPositions() {
  try {
    const raw = sessionStorage.getItem(scrollPositionsStorageKey)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeScrollPositions(positions) {
  try {
    sessionStorage.setItem(scrollPositionsStorageKey, JSON.stringify(positions))
  } catch {
    // Ignore storage failures.
  }
}

function saveScrollPosition(route) {
  const nextRoute = route || getRouteUrl()
  const positions = readScrollPositions()
  positions[nextRoute] = window.scrollY
  writeScrollPositions(positions)
}

function getSavedScrollPosition(route) {
  const positions = readScrollPositions()
  return Number.isFinite(positions[route]) ? positions[route] : 0
}

function getPreferredInitialLocation() {
  const currentUrl = getRouteUrl()
  const intendedRoute = readIntendedRoute()

  if (currentUrl === '/' && intendedRoute && intendedRoute !== '/') {
    return new URL(intendedRoute, window.location.origin)
  }

  return window.location
}

function getRouteState(locationObject = window.location) {
  const pathname = locationObject.pathname || '/'
  const hash = (locationObject.hash || '').replace(/^#/, '')

  if (pathname === '/admin') {
    return { page: 'admin', section: '' }
  }

  if (pathname === '/order-status') {
    return { page: 'order-status', section: '' }
  }

  if (pathname === '/products') {
    return { page: 'products', section: '' }
  }

  if (pathname.startsWith('/products/')) {
    const productId = pathname.replace('/products/', '')
    return { page: 'product-detail', section: '', productId }
  }

  if (shopHashes.has(hash)) {
    return {
      page: 'home',
      section: hash && hash !== 'home' ? hash : '',
    }
  }

  return { page: 'home', section: '' }
}

export default function App() {
  const preferredInitialLocation = getPreferredInitialLocation()
  const initialRoute = getRouteState(preferredInitialLocation)
  const storedAccount = readStoredAccount()
  const [currentPage, setCurrentPage] = useState(initialRoute.page)
  const [pendingSection, setPendingSection] = useState(initialRoute.section)
  const [activeProductId, setActiveProductId] = useState(initialRoute.productId || '')
  const [products, setProducts] = useState([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [catalogNotice, setCatalogNotice] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState('featured')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('customerToken') || '')
  const [customerAccount, setCustomerAccount] = useState(storedAccount)
  const [authError, setAuthError] = useState('')
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false)
  const [orderHistory, setOrderHistory] = useState([])
  const [isLoadingOrderHistory, setIsLoadingOrderHistory] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState(null)
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  })
  const [cartMessage, setCartMessage] = useState('')
  const [checkoutError, setCheckoutError] = useState('')
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState({
    state: 'idle',
    message: '',
    reference: '',
    order: null,
    paymentState: '',
    retryable: false,
  })
  const [customer, setCustomer] = useState(() => customerFromAccount(storedAccount))
  const [profileForm, setProfileForm] = useState(() => customerFromAccount(storedAccount))
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('buildmart-cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const categories = useMemo(() => ['All', ...new Set(products.map((product) => product.category))], [products])
  const featuredProducts = useMemo(() => products.slice(0, 3), [products])
  const filteredProducts = useMemo(() => {
    const visibleProducts = products.filter(
      (product) =>
        (activeCategory === 'All' || product.category === activeCategory) &&
        (!searchTerm.trim() ||
          product.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    )

    const sortedProducts = [...visibleProducts]

    switch (sortOption) {
      case 'price-low':
        sortedProducts.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        sortedProducts.sort((a, b) => b.price - a.price)
        break
      case 'name-asc':
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name))
        break
      default:
        break
    }

    return sortedProducts
  }, [activeCategory, products, searchTerm, sortOption])
  const cartItemCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart])
  const cartSubtotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  )
  const deliveryFee = useMemo(
    () => deliveryFees[customer.deliveryMethod] || 0,
    [customer.deliveryMethod]
  )
  const orderTotal = useMemo(
    () => Number((cartSubtotal + deliveryFee).toFixed(2)),
    [cartSubtotal, deliveryFee]
  )
  const currentRouteUrl = getRouteUrl()

  useEffect(() => {
    localStorage.setItem('buildmart-cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    const preferredUrl = getRouteUrl(preferredInitialLocation)
    const actualUrl = getRouteUrl()

    if (preferredUrl !== actualUrl) {
      window.history.replaceState({}, '', preferredUrl)
    }

    writeIntendedRoute(preferredUrl)
  }, [preferredInitialLocation])

  useEffect(() => {
    if (!customerAccount) {
      setCustomer(emptyCustomer())
      setProfileForm(emptyCustomer())
      return
    }

    setCustomer(customerFromAccount(customerAccount))
    setProfileForm(customerFromAccount(customerAccount))
  }, [customerAccount])

  useEffect(() => {
    function syncRoute() {
      saveScrollPosition()
      writeIntendedRoute(getRouteUrl())
      const nextState = getRouteState()
      setCurrentPage(nextState.page)
      setPendingSection(nextState.section)
      setActiveProductId(nextState.productId || '')
    }

    window.addEventListener('hashchange', syncRoute)
    window.addEventListener('popstate', syncRoute)

    return () => {
      window.removeEventListener('hashchange', syncRoute)
      window.removeEventListener('popstate', syncRoute)
    }
  }, [])

  useEffect(() => {
    function handlePageLeave() {
      saveScrollPosition()
      writeIntendedRoute(getRouteUrl())
    }

    let frameId = 0
    function handleScroll() {
      window.cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(() => saveScrollPosition())
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('beforeunload', handlePageLeave)
    window.addEventListener('pagehide', handlePageLeave)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('beforeunload', handlePageLeave)
      window.removeEventListener('pagehide', handlePageLeave)
    }
  }, [])

  useEffect(() => {
    if (currentPage !== 'home' || !pendingSection) {
      return
    }

    const frameId = window.requestAnimationFrame(() => {
      const section = document.getElementById(pendingSection)
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      writeIntendedRoute(getRouteUrl())
      setPendingSection('')
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [currentPage, pendingSection])

  useEffect(() => {
    const route = getRouteUrl()

    if (currentPage === 'home' && (pendingSection || window.location.hash)) {
      writeIntendedRoute(route)
      return
    }

    writeIntendedRoute(route)

    const frameId = window.requestAnimationFrame(() => {
      window.scrollTo({
        top: getSavedScrollPosition(route),
        left: 0,
        behavior: 'auto',
      })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [currentPage, pendingSection, activeProductId])

  useEffect(() => {
    if (!cartMessage) {
      return
    }

    const timeoutId = window.setTimeout(() => setCartMessage(''), 1800)
    return () => window.clearTimeout(timeoutId)
  }, [cartMessage])

  useEffect(() => {
    let ignore = false

    async function loadProducts() {
      try {
        setIsLoadingProducts(true)
        const data = await parseJson(await apiFetch('/api/products'))

        if (!ignore) {
          setProducts(data.products)
          setCatalogNotice('')
        }
      } catch {
        if (!ignore) {
          setProducts(fallbackProducts)
          setCatalogNotice('Live catalog is temporarily unavailable. Showing the local product list.')
        }
      } finally {
        if (!ignore) {
          setIsLoadingProducts(false)
        }
      }
    }

    loadProducts()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (!authToken) {
      localStorage.removeItem('customerToken')
      localStorage.removeItem('customerAccount')
      setCustomerAccount(null)
      setOrderHistory([])
      setIsLoadingOrderHistory(false)
      return
    }

    localStorage.setItem('customerToken', authToken)

    let ignore = false

    async function restoreCustomerSession() {
      try {
        const data = await parseJson(
          await apiFetch('/api/auth/session', {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })
        )

        if (!ignore) {
          setCustomerAccount(data.user)
          localStorage.setItem('customerAccount', JSON.stringify(data.user))
        }
      } catch {
        if (!ignore) {
          setAuthToken('')
          setCustomerAccount(null)
        }
      }
    }

    restoreCustomerSession()

    return () => {
      ignore = true
    }
  }, [authToken])

  useEffect(() => {
    if (!authToken) {
      return
    }

    let ignore = false

    async function loadOrderHistory() {
      try {
        setIsLoadingOrderHistory(true)
        const data = await parseJson(
          await apiFetch('/api/account/orders', {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })
        )

        if (!ignore) {
          setOrderHistory(data.orders || [])
        }
      } catch {
        if (!ignore) {
          setOrderHistory([])
        }
      } finally {
        if (!ignore) {
          setIsLoadingOrderHistory(false)
        }
      }
    }

    loadOrderHistory()

    return () => {
      ignore = true
    }
  }, [authToken, paymentStatus.reference])

  async function reloadProducts() {
    try {
      setIsLoadingProducts(true)
      const data = await parseJson(await apiFetch('/api/products'))
      setProducts(data.products)
      setCatalogNotice('')
    } catch {
      setProducts(fallbackProducts)
      setCatalogNotice('Live catalog is temporarily unavailable. Showing the local product list.')
    } finally {
      setIsLoadingProducts(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const reference = params.get('reference') || params.get('trxref')

    if (!reference) {
      return
    }

    if (!authToken) {
      setPaymentStatus({
        state: 'error',
        message: 'Log in to view and verify this order on your account.',
        reference,
        order: null,
        paymentState: '',
        retryable: false,
      })
      return
    }

    let ignore = false

    async function verifyPayment() {
      setPaymentStatus({
        state: 'verifying',
        message: 'Verifying your Paystack payment...',
        reference,
        order: null,
        paymentState: '',
        retryable: false,
      })

      try {
        const data = await parseJson(
          await apiFetch(`/api/paystack/verify/${reference}`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })
        )

        if (ignore) {
          return
        }

        if (data.ok) {
          setPaymentStatus({
            state: 'success',
            message: `Payment verified for ${reference}.`,
            reference,
            order: data.order || null,
            paymentState: data.paymentStatus || 'success',
            retryable: false,
          })
          setCart([])
          localStorage.removeItem('buildmart-cart')
        } else {
          const retryable = ['failed', 'abandoned', 'reversed'].includes(data.paymentStatus)
          setPaymentStatus({
            state: retryable ? 'error' : 'pending',
            message: `Payment status for ${reference}: ${data.paymentStatus || 'pending'}.`,
            reference,
            order: data.order || null,
            paymentState: data.paymentStatus || 'pending',
            retryable,
          })
        }
      } catch (error) {
        if (!ignore) {
          setPaymentStatus({
            state: 'error',
            message: error instanceof Error ? error.message : 'Unable to verify payment.',
            reference,
            order: null,
            paymentState: '',
            retryable: false,
          })
        }
      }
    }

    verifyPayment()

    return () => {
      ignore = true
    }
  }, [authToken])

  function openAuthModal(mode = 'login') {
    setAuthMode(mode)
    setAuthError('')
    setIsAuthModalOpen(true)
  }

  function closeAuthModal() {
    setIsAuthModalOpen(false)
    setAuthError('')
  }

  function updateAuthForm(field, value) {
    setAuthForm((current) => ({ ...current, [field]: value }))
  }

  function updateProfileField(field, value) {
    setProfileMessage(null)
    setProfileForm((current) => ({ ...current, [field]: value }))
  }

  function openPage(pathname, section = '') {
    saveScrollPosition(currentRouteUrl)
    setIsCartOpen(false)
    const nextUrl = pathname === '/' && section ? `/#${section}` : pathname
    window.history.pushState({}, '', nextUrl)
    writeIntendedRoute(nextUrl)
    const nextState = getRouteState()
    setCurrentPage(nextState.page)
    setPendingSection(nextState.section)
    setActiveProductId(nextState.productId || '')
  }

  function openProductPage(productId) {
    openPage(`/products/${productId}`)
  }

  function addToCart(product, quantity = 1) {
    setCheckoutError('')
    const safeQuantity = Math.max(1, quantity)

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id)
      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + safeQuantity } : item
        )
      }

      return [...currentCart, { ...product, quantity: safeQuantity }]
    })

    setCartMessage(`${product.name} added to cart.`)
  }

  function updateQuantity(productId, quantity) {
    setCart((currentCart) =>
      currentCart
        .map((item) => (item.id === productId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    )
  }

  function removeFromCart(productId) {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId))
  }

  function clearCart() {
    setCart([])
  }

  function updateCustomerField(field, value) {
    setCheckoutError('')
    setCustomer((current) => ({ ...current, [field]: value }))
  }

  async function handleRetryPayment(reference) {
    if (!authToken) {
      openAuthModal('login')
      return
    }

    try {
      setPaymentStatus((current) => ({
        ...current,
        state: 'verifying',
        message: `Re-initializing payment for ${reference}...`,
        order: current.order || null,
      }))

      const data = await parseJson(
        await apiFetch(`/api/paystack/retry/${reference}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
      )

      window.location.href = data.authorizationUrl
    } catch (error) {
      setPaymentStatus((current) => ({
        ...current,
        state: 'error',
        message: error instanceof Error ? error.message : 'Unable to retry payment.',
        order: current.order || null,
        retryable: true,
      }))
    }
  }

  async function handleCheckout(event) {
    event.preventDefault()

    if (!authToken || !customerAccount) {
      setCheckoutError('Log in before checkout so this order is saved to your account.')
      openAuthModal('login')
      return
    }

    if (cart.length === 0) {
      setCheckoutError('Add at least one product before checkout.')
      return
    }

    if (!customer.name.trim() || !customer.email.trim() || !customer.phone.trim()) {
      setCheckoutError('Complete your customer details before continuing.')
      return
    }

    if (customer.deliveryMethod === 'delivery' && !customer.address.trim()) {
      setCheckoutError('Enter a delivery address before continuing.')
      return
    }

    setCheckoutError('')
    setIsSubmittingCheckout(true)

    try {
      const data = await parseJson(
        await apiFetch('/api/paystack/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            customer,
            cart: cart.map((item) => ({
              id: item.id,
              name: item.name,
              category: item.category,
              price: item.price,
              quantity: item.quantity,
              unit: item.unit,
            })),
            totals: {
              subtotal: cartSubtotal,
              deliveryFee,
              total: orderTotal,
            },
            callbackUrl: `${window.location.origin}/order-status`,
          }),
        })
      )

      window.location.href = data.authorizationUrl
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Unable to initialize checkout.')
    } finally {
      setIsSubmittingCheckout(false)
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setAuthError('')
    setIsSubmittingAuth(true)

    try {
      if (authMode === 'signup' && authForm.password !== authForm.confirmPassword) {
        throw new Error('Password confirmation does not match.')
      }

      const endpoint = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/login'
      const payload =
        authMode === 'signup'
          ? {
              name: authForm.name,
              email: authForm.email,
              phone: authForm.phone,
              address: authForm.address,
              password: authForm.password,
            }
          : {
              email: authForm.email,
              password: authForm.password,
            }

      const data = await parseJson(
        await apiFetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
      )

      setAuthToken(data.token)
      setCustomerAccount(data.user)
      localStorage.setItem('customerToken', data.token)
      localStorage.setItem('customerAccount', JSON.stringify(data.user))
      setAuthForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        confirmPassword: '',
      })
      setCheckoutError('')
      setCartMessage(`Welcome back, ${data.user.name}. Your account is ready for checkout.`)
      closeAuthModal()
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to complete authentication.')
    } finally {
      setIsSubmittingAuth(false)
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()

    if (!authToken) {
      openAuthModal('login')
      return
    }

    setProfileMessage(null)
    setIsSavingProfile(true)

    try {
      const data = await parseJson(
        await apiFetch('/api/auth/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(profileForm),
        })
      )

      setCustomerAccount(data.user)
      localStorage.setItem('customerAccount', JSON.stringify(data.user))
      setProfileMessage({ type: 'success', message: 'Profile updated successfully.' })
    } catch (error) {
      setProfileMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to update profile.',
      })
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function handleCustomerLogout() {
    try {
      if (authToken) {
        await apiFetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
      }
    } catch {
      // Best-effort logout; local session still gets cleared.
    }

    setAuthToken('')
    setCustomerAccount(null)
    setOrderHistory([])
    localStorage.removeItem('customerToken')
    localStorage.removeItem('customerAccount')
    setPaymentStatus({
      state: 'idle',
      message: '',
      reference: '',
      order: null,
      paymentState: '',
      retryable: false,
    })

    if (window.location.pathname === '/order-status') {
      window.history.replaceState({}, '', '/')
      setCurrentPage('home')
      setPendingSection('')
      setActiveProductId('')
      writeIntendedRoute('/')
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }

    setCartMessage('You have been logged out of your customer account.')
  }

  const activeProduct = useMemo(
    () => products.find((product) => product.id === activeProductId) || null,
    [activeProductId, products]
  )
  const relatedProducts = useMemo(() => {
    if (!activeProduct) {
      return []
    }

    return products
      .filter((product) => product.category === activeProduct.category && product.id !== activeProduct.id)
      .slice(0, 3)
  }, [activeProduct, products])

  return (
    <div className="min-h-screen bg-[#f2ede3] text-stone-950">
      <SiteHeader
        cartItemCount={cartItemCount}
        customerAccount={customerAccount}
        onLogout={handleCustomerLogout}
        onOpenAuth={openAuthModal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => openPage('/order-status')}
        openPage={openPage}
      />

      {currentPage === 'admin' ? (
        <AdminPage openPage={openPage} products={products} onProductsRefresh={reloadProducts} />
      ) : currentPage === 'order-status' ? (
        <OrderStatusPage
          customerAccount={customerAccount}
          isLoadingOrderHistory={isLoadingOrderHistory}
          isSavingProfile={isSavingProfile}
          onOpenAuth={openAuthModal}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenPage={openPage}
          onProfileFieldChange={updateProfileField}
          onProfileSubmit={handleProfileSubmit}
          onRetryPayment={handleRetryPayment}
          orderHistory={orderHistory}
          paymentStatus={paymentStatus}
          profileForm={profileForm}
          profileMessage={profileMessage}
        />
      ) : currentPage === 'product-detail' ? (
        <ProductDetailPage
          cartItemCount={cartItemCount}
          cartSubtotal={orderTotal}
          product={activeProduct}
          relatedProducts={relatedProducts}
          onAddToCart={addToCart}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenPage={openPage}
          onOpenProductPage={openProductPage}
          onSelectProduct={setSelectedProduct}
          formatCurrency={formatCurrency}
        />
      ) : currentPage === 'products' ? (
        <ProductsPage
          activeCategory={activeCategory}
          cartItemCount={cartItemCount}
          cartSubtotal={orderTotal}
          cartMessage={cartMessage}
          categories={categories}
          catalogNotice={catalogNotice}
          filteredProducts={filteredProducts}
          isLoadingProducts={isLoadingProducts}
          onAddToCart={addToCart}
          onChangeCategory={setActiveCategory}
          onChangeSearch={setSearchTerm}
          onChangeSort={setSortOption}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenPage={openPage}
          onOpenProductPage={openProductPage}
          onRetryPayment={handleRetryPayment}
          onSelectProduct={setSelectedProduct}
          paymentStatus={paymentStatus}
          searchTerm={searchTerm}
          sortOption={sortOption}
          formatCurrency={formatCurrency}
        />
      ) : (
        <HomePage
          cartMessage={cartMessage}
          catalogNotice={catalogNotice}
          featuredProducts={featuredProducts}
          filteredProducts={filteredProducts}
          isLoadingProducts={isLoadingProducts}
          onAddToCart={addToCart}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenPage={openPage}
          onRetryPayment={handleRetryPayment}
          onSelectProduct={setSelectedProduct}
          paymentStatus={paymentStatus}
          formatCurrency={formatCurrency}
        />
      )}

      <ProductModal
        product={selectedProduct}
        onAddAndViewCart={(product) => {
          addToCart(product)
          setSelectedProduct(null)
          setIsCartOpen(true)
        }}
        onClose={() => setSelectedProduct(null)}
        formatCurrency={formatCurrency}
      />

      <FloatingCartButton
        cartItemCount={cartItemCount}
        cartTotal={orderTotal}
        formatCurrency={formatCurrency}
        isVisible={currentPage !== 'admin' && !isCartOpen}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <CartModal
        cart={cart}
        cartSubtotal={cartSubtotal}
        checkoutError={checkoutError}
        customer={customer}
        customerAccount={customerAccount}
        deliveryFee={deliveryFee}
        formatCurrency={formatCurrency}
        isOpen={isCartOpen}
        isSubmittingCheckout={isSubmittingCheckout}
        onCheckout={handleCheckout}
        onClearCart={clearCart}
        onClose={() => setIsCartOpen(false)}
        onOpenAuth={openAuthModal}
        orderTotal={orderTotal}
        onRemoveItem={removeFromCart}
        onUpdateCustomerField={updateCustomerField}
        onUpdateQuantity={updateQuantity}
      />

      <AuthModal
        authForm={authForm}
        authMode={authMode}
        errorMessage={authError}
        isOpen={isAuthModalOpen}
        isSubmitting={isSubmittingAuth}
        onChange={updateAuthForm}
        onClose={closeAuthModal}
        onModeChange={setAuthMode}
        onSubmit={handleAuthSubmit}
      />
    </div>
  )
}
