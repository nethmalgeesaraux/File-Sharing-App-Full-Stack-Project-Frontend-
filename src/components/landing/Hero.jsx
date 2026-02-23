import React from 'react'
import { assets } from '../../assets/assets'

const Hero = () => {
  return (
    <div className="landing-page-content reletive">
      <div className='absolute inset-0 bg-gradient-to-r from-purple-50 to-indigo-50 opacity-80 z-0 pointer-events'></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28">

          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Share Files Securely with</span>
              <span className="block text-purple-500">CloudShare</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Upload, manage, and share your files securely. Accessible anywhere, anytime.
            </p>
            <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
              <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
                <button className="group inline-flex items-center justify-center px-7 py-3.5 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-300/40 hover:shadow-xl hover:shadow-purple-400/50 hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2">
                  Get Started
                </button>
                <button className="group inline-flex items-center justify-center px-7 py-3.5 bg-white/85 text-gray-800 font-semibold rounded-xl border border-purple-200 shadow-md shadow-purple-100/50 hover:bg-white hover:text-purple-700 hover:border-purple-300 hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2">
                  Sign In
                </button>
              </div>
            </div>
          </div>

        </div>

        <div className="relative">

          <div className="aspect-w-16 rounded-lg shadow-xl overflow-hidden">
            <img src={assets.ds} alt="cloudshare dashboard" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black opacity-10 rounded-lg"></div>
        </div>

        <div className="mt-8 text-center">

          <p className="mt-4 text-base text-gray-500">
            All your files are encrypted and stored securely with enterprise-grade security protocols.
          </p>

        </div>
      </div>

    </div>
  )
}

export default Hero
