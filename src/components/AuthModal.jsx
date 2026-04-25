const emptyLabelClasses =
  'w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500'

export default function AuthModal({
  authForm,
  authMode,
  errorMessage,
  isOpen,
  isSubmitting,
  onChange,
  onClose,
  onModeChange,
  onSubmit,
}) {
  if (!isOpen) {
    return null
  }

  const isSignup = authMode === 'signup'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-950/70 px-4 py-6" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[1.8rem] border border-white/70 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.25)] sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-700">Customer Account</p>
            <h2 className="mt-2 font-serif text-2xl text-stone-950 sm:text-3xl">
              {isSignup ? 'Create your account' : 'Log in to continue'}
            </h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Sign in before checkout so purchases stay attached to your account and appear in your order history.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 transition hover:border-stone-950"
          >
            Close
          </button>
        </div>

        <div className="mt-6 flex rounded-full border border-stone-200 bg-stone-100 p-1">
          <button
            onClick={() => onModeChange('login')}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              authMode === 'login' ? 'bg-stone-950 text-white' : 'text-stone-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => onModeChange('signup')}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              authMode === 'signup' ? 'bg-stone-950 text-white' : 'text-stone-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {isSignup ? (
            <>
              <input
                value={authForm.name}
                onChange={(event) => onChange('name', event.target.value)}
                type="text"
                placeholder="Full name"
                className={emptyLabelClasses}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={authForm.phone}
                  onChange={(event) => onChange('phone', event.target.value)}
                  type="tel"
                  placeholder="Phone number"
                  className={emptyLabelClasses}
                />
                <input
                  value={authForm.email}
                  onChange={(event) => onChange('email', event.target.value)}
                  type="email"
                  placeholder="Email address"
                  className={emptyLabelClasses}
                />
              </div>
              <textarea
                value={authForm.address}
                onChange={(event) => onChange('address', event.target.value)}
                rows="3"
                placeholder="Delivery address"
                className={emptyLabelClasses}
              />
            </>
          ) : (
            <input
              value={authForm.email}
              onChange={(event) => onChange('email', event.target.value)}
              type="email"
              placeholder="Email address"
              className={emptyLabelClasses}
            />
          )}

          <input
            value={authForm.password}
            onChange={(event) => onChange('password', event.target.value)}
            type="password"
            placeholder="Password"
            className={emptyLabelClasses}
          />

          {isSignup ? (
            <input
              value={authForm.confirmPassword}
              onChange={(event) => onChange('confirmPassword', event.target.value)}
              type="password"
              placeholder="Confirm password"
              className={emptyLabelClasses}
            />
          ) : null}

          {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-stone-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            {isSubmitting ? 'Please wait...' : isSignup ? 'Create Account' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  )
}
