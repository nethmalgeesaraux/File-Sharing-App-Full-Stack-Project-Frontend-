import React from 'react'
import { Star } from 'lucide-react'

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director, CreativeMinds Inc.',
      rating: 5,
      quote:
        '"CloudShare has transformed how our team collaborates on creative assets. The secure sharing and intuitive interface have made file management a breeze."',
      avatar: 'SJ',
    },
    {
      name: 'Michael Chen',
      role: 'Freelance Designer, Self-employed',
      rating: 5,
      quote:
        '"As a freelancer, I need to share large design files with clients securely. CloudShare\'s simple interface and reasonable pricing make it my go-to solution."',
      avatar: 'MC',
    },
    {
      name: 'Priya Sharma',
      role: 'Project Manager, TechSolutions Ltd.',
      rating: 4,
      quote:
        '"Managing project files across multiple teams used to be a nightmare until we found CloudShare. Now everything is organized and accessible exactly when we need it."',
      avatar: 'PS',
    },
  ]

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black">
            Trusted by Professionals Worldwide
          </h2>
          <p className="mt-3 text-gray-700 text-base sm:text-lg">
            See what our users have to say about DropZone
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-fuchsia-100 text-sm font-bold text-purple-700">
                  {item.avatar}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">{item.name}</h3>
                  <p className="text-sm text-gray-600 transition-all duration-200 group-hover:font-medium">{item.role}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={`${item.name}-star-${i}`}
                    className={`h-4 w-4 ${i < item.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300 fill-gray-300'}`}
                  />
                ))}
              </div>

              <p className="mt-4 text-gray-700 leading-relaxed transition-all duration-200 group-hover:font-semibold">{item.quote}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
