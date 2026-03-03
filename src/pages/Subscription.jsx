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
        id: 'free',
        name: 'Free',
        price: 0,
        credits: 5,
        description: 'Perfect for getting started',
        popular: false,
        features: ['5 file uploads', 'Basic file sharing', '7-day file retention', 'Email support'],
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 500,
        credits: 500,
        description: 'For individuals with larger needs',
        popular: true,
        features: ['500 file uploads', 'Advanced file sharing', '30-day file retention', 'Priority email support', 'File analytics'],
      },
      {
        id: 'ultimate',
        name: 'Ultimate',
        price: 2500,
        credits: 5000,
        description: 'For teams and businesses',
        popular: false,
        features: ['5000 file uploads', 'Team sharing capabilities', 'Unlimited file retention', '24/7 priority support', 'Advanced analytics', 'API access'],
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
          currency: 'LKR',
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
        throw new Error('No checkout URL returned from backend.')
      }

      window.location.href = checkoutUrl
    } catch {
      setError('Unable to create payment session. Please check the backend endpoint.')
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
        throw new Error('No portal URL returned.')
      }

      window.location.href = portalUrl
    } catch {
      setError('Unable to open billing portal. Please check the backend endpoint.')
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
            <p className="mt-1 text-sm text-gray-600">Select a plan and complete your payment online.</p>
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
            Payment successful. Credits will be updated shortly.
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

        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`relative rounded-xl border bg-white p-5 shadow-sm ${
                plan.popular ? 'border-violet-500 ring-2 ring-violet-100' : 'border-gray-200'
              } flex h-full flex-col`}
            >
              {plan.popular ? (
                <span className="absolute right-4 top-4 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                  Popular
                </span>
              ) : null}

              <h2 className="text-4xl font-bold text-gray-900">{plan.name}</h2>
              <p className="mt-1 text-2xl font-bold text-gray-900">Rs {plan.price}</p>
              <p className="mt-1 text-sm text-gray-600">{plan.description}</p>

              <ul className="mt-5 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 text-violet-600" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => openCheckout(plan)}
                disabled={loadingPlanId !== null}
                className={`mt-auto inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white hover:opacity-95'
                    : 'border border-gray-200 bg-white text-violet-700 hover:bg-violet-50'
                }`}
              >
                {loadingPlanId === plan.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                {loadingPlanId === plan.id ? 'Redirecting...' : plan.price === 0 ? 'Get Started' : `Pay Rs ${plan.price}`}
              </button>
            </article>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Subscription
