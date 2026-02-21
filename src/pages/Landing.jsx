import React from 'react'
import Hero from '../components/landing/Hero'
import Features from '../components/landing/Features'
import Pricing from '../components/landing/Pricing'
import Testimonials from '../components/landing/Testimonials'
import CTAsection from '../components/landing/CTAsection'
import Footer from '../components/landing/Footer'

// gradient

const Landing = () => {
  return (
    <div className="landing-page bg-linear-to-b from-gray-50 to-gray-100">
      
      {/* Hero Section */}
        <Hero/>
      {/* Features Section */}
        <Features/>
      {/* Pricing Section */}
        <Pricing/>
      {/* Testimonials Section */}
        <Testimonials/>
      {/* CTA Section */}
        <CTAsection/>
      {/* Footer Section */}
        <Footer/>

    </div>
  )
}

export default Landing
