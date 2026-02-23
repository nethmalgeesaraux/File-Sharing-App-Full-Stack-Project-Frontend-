import React from 'react'
import { Check } from 'lucide-react'

const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      subtitle: 'Perfect for getting started',
      price: 'Rs 0',
      cta: 'Get Started',
      highlighted: false,
      features: [
        '5 file uploads',
        'Basic file sharing',
        '7-day file retention',
        'Email support',
      ],
    },
    {
      name: 'Premium',
      subtitle: 'For individuals with larger needs',
      price: 'Rs 500',
      cta: 'Go Premium',
      badge: 'Popular',
      highlighted: true,
      features: [
        '500 file uploads',
        'Advanced file sharing',
        '30-day file retention',
        'Priority email support',
        'File analytics',
      ],
    },
    {
      name: 'Ultimate',
      subtitle: 'For teams and businesses',
      price: 'Rs 2500',
      cta: 'Go Ultimate',
      highlighted: false,
      features: [
        '5000 file uploads',
        'Team sharing capabilities',
        'Unlimited file retention',
        '24/7 priority support',
        'Advanced analytics',
        'API access',
      ],
    },
  ]

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black">
            Choose the plan that suits you
          </h2>
          <p className="mt-3 text-gray-600 text-base sm:text-lg">
            Flexible pricing for personal and business file sharing needs
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`flex h-full flex-col rounded-xl bg-white border shadow-sm overflow-hidden ${
                plan.highlighted ? 'border-purple-500 ring-1 ring-purple-500' : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-3xl font-extrabold text-gray-900">{plan.name}</h3>
                  {plan.badge ? (
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">
                      {plan.badge}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-gray-600">{plan.subtitle}</p>
                <p className="mt-6 text-2xl font-bold text-gray-900">{plan.price}</p>
              </div>

              <div className="flex flex-1 flex-col bg-gray-50 px-6 py-6">
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-gray-800">
                      <Check className="mt-0.5 h-4 w-4 text-purple-600" strokeWidth={2.5} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  <button
                    className={`w-full rounded-md border px-4 py-3 font-semibold transition ${
                      plan.highlighted
                        ? 'border-purple-600 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white hover:from-purple-700 hover:to-fuchsia-700'
                        : 'border-gray-200 bg-white text-purple-700 hover:bg-purple-50'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Pricing
