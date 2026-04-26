import { useEffect } from 'react'

function getToneClasses(variant) {
  if (variant === 'success') {
    return {
      badge: 'bg-emerald-100 text-emerald-800',
      iconWrap: 'bg-emerald-100 text-emerald-700',
      button: 'bg-emerald-600 text-white hover:bg-emerald-500',
    }
  }

  if (variant === 'error') {
    return {
      badge: 'bg-rose-100 text-rose-800',
      iconWrap: 'bg-rose-100 text-rose-700',
      button: 'bg-rose-600 text-white hover:bg-rose-500',
    }
  }

  if (variant === 'warning') {
    return {
      badge: 'bg-amber-100 text-amber-900',
      iconWrap: 'bg-amber-100 text-amber-800',
      button: 'bg-amber-500 text-stone-950 hover:bg-amber-400',
    }
  }

  return {
    badge: 'bg-sky-100 text-sky-800',
    iconWrap: 'bg-sky-100 text-sky-700',
    button: 'bg-stone-950 text-white hover:bg-stone-800',
  }
}

function AlertIcon({ variant }) {
  if (variant === 'success') {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12 4.2 4.2L19 6.5" />
      </svg>
    )
  }

  if (variant === 'error') {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M15 9 9 15" />
        <path d="m9 9 6 6" />
      </svg>
    )
  }

  if (variant === 'warning') {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3 2.8 19h18.4L12 3Z" />
        <path d="M12 9v4.5" />
        <path d="M12 17h.01" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v5" />
      <path d="M12 7h.01" />
    </svg>
  )
}

export default function AlertModal({
  actionLabel = 'Close',
  isOpen,
  message,
  onClose,
  title,
  variant = 'info',
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const toneClasses = getToneClasses(variant)

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-950/70 px-4 py-6 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-[2rem] border border-white/75 bg-[linear-gradient(180deg,#ffffff_0%,#f7f1e6_100%)] p-6 shadow-[0_40px_120px_rgba(15,23,42,0.3)] sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className={`inline-flex h-14 w-14 items-center justify-center rounded-full ${toneClasses.iconWrap}`}>
            <AlertIcon variant={variant} />
          </div>
          <span className={`rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] ${toneClasses.badge}`}>
            {variant}
          </span>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">BuildMart Notice</p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-stone-950">{title}</h2>
          <p className="mt-4 text-sm leading-7 text-stone-600">{message}</p>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className={`rounded-full px-6 py-3 text-sm font-semibold transition ${toneClasses.button}`}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
