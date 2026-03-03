import React, { useMemo, useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { Check, CreditCard, LoaderCircle } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'

const Subscription = () => {
  const { getToken } = useAuth()
  const [loadingPlanId, setLoadingPlanId] = useState(null)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [error, setError] = useState('')

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
  const checkoutEndpoint = import.meta.env.VITE_CHECKOUT_ENDPOINT || '/api/payments/checkout'
  const billingPortalEndpoint = import.meta.env.VITE_BILLING_PORTAL_ENDPOINT || '/api/payments/portal'

  const plans = useMemo(
    () => [
      {
        id: 'starter',
        name: 'Starter',
        price: 5,
        credits: 50,
        description: 'Small personal use',
        popular: false,
        features: ['50 upload credits', 'Basic support', 'Share links'],
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 12,
        credits: 150,
        description: 'Best for freelancers',
        popular: true,
        features: ['150 upload credits', 'Priority support', 'Advanced sharing'],
      },
      {
        id: 'business',
        name: 'Business',
        price: 29,
        credits: 500,
        description: 'For teams',
        popular: false,
        features: ['500 upload credits', 'Team-ready usage', 'Fast support'],
      },
    ],
    []
  )

  const searchParams = new URLSearchParams(window.location.search)
  const paymentStatus = searchParams.get('payment')

  const getCheckoutUrlFromPayload = (payload) =>
    payload?.checkoutUrl ||
    payload?.url ||
    payload?.paymentUrl ||
    payload?.sessionUrl ||
    payload?.data?.checkoutUrl ||
    payload?.data?.url

  const openCheckout = async (plan) => {
    try {
      setLoadingPlanId(plan.id)
      setError('')
      const token = await getToken()

      const response = await fetch(`${apiBaseUrl}${checkoutEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          planId: plan.id,
          planName: plan.name,
          amount: plan.price,
          credits: plan.credits,
          successUrl: `${window.location.origin}/subscription?payment=success`,
          cancelUrl: `${window.location.origin}/subscription?payment=cancel`,
        }),
      })

      if (!response.ok) {
        throw new Error(`Checkout failed (${response.status})`)
      }

      const data = await response.json()
      const checkoutUrl = getCheckoutUrlFromPayload(data)

      if (!checkoutUrl) {
        throw new Error('No checkout url returned from backend.')
      }

      window.location.href = checkoutUrl
    } catch {
      setError('Payment session create karanna bari una. Backend endpoint eka check karanna.')
    } finally {
      setLoadingPlanId(null)
    }
  }

  const openBillingPortal = async () => {
    try {
      setLoadingPortal(true)
      setError('')
      const token = await getToken()
      const response = await fetch(`${apiBaseUrl}${billingPortalEndpoint}`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) {
        throw new Error(`Portal failed (${response.status})`)
      }

      const data = await response.json()
      const portalUrl = getCheckoutUrlFromPayload(data)
      if (!portalUrl) {
        throw new Error('No portal url returned.')
      }

      window.location.href = portalUrl
    } catch {
      setError('Billing portal open karanna bari una. Backend endpoint eka check karanna.')
    } finally {
      setLoadingPortal(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-7.5rem)] rounded-sm border border-gray-200 bg-[#f8f8fb] p-5">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
            <p className="mt-1 text-sm text-gray-600">Plan එකක් select කරලා online payment කරන්න.</p>
          </div>
          <button
            type="button"
            onClick={openBillingPortal}
            disabled={loadingPortal}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingPortal ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            Manage Billing
          </button>
        </div>

        {paymentStatus === 'success' ? (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            Payment success. Credits soon update වෙයි.
          </div>
        ) : null}

        {paymentStatus === 'cancel' ? (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
            Payment canceled.
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`relative rounded-xl border bg-white p-5 shadow-sm ${
                plan.popular ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200'
              }`}
            >
              {plan.popular ? (
                <span className="absolute right-4 top-4 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
                  Popular
                </span>
              ) : null}

              <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
              <p className="mt-1 text-sm text-gray-600">{plan.description}</p>
              <p className="mt-4 text-4xl font-bold text-gray-900">${plan.price}</p>
              <p className="text-sm text-gray-500">one-time</p>

              <div className="mt-4 inline-flex items-center rounded-md bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                +{plan.credits} credits
              </div>

              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => openCheckout(plan)}
                disabled={loadingPlanId !== null}
                className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {loadingPlanId === plan.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                {loadingPlanId === plan.id ? 'Redirecting...' : `Pay $${plan.price}`}
              </button>
            </article>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Subscription
