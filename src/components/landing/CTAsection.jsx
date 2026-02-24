import React from 'react'
import { SignUpButton } from '@clerk/clerk-react'

const CTAsection = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-purple-500/50 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-10 shadow-lg sm:px-10">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <h2 className="max-w-2xl text-3xl sm:text-4xl font-extrabold leading-tight text-white drop-shadow-sm">
              Ready to get started?
              <br />
              Create your account today.
            </h2>

            <SignUpButton mode="modal">
              <button className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-6 py-3 text-lg font-semibold text-purple-700 shadow-sm transition hover:bg-gray-100">
                Sign up for free
              </button>
            </SignUpButton>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTAsection
