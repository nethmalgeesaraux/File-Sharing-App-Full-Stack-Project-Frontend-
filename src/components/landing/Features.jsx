import React from 'react'
import { Upload, Shield, Share2, CreditCard, FileText, Clock3 } from 'lucide-react'

const Features = () => {
  const featureList = [
    {
      title: 'Easy File Upload',
      description: 'Quickly upload your files with our intuitive drag-and-drop interface.',
      icon: Upload,
      iconColor: 'text-violet-600',
    },
    {
      title: 'Secure Storage',
      description: 'Your files are encrypted and stored securely in our cloud infrastructure.',
      icon: Shield,
      iconColor: 'text-green-600',
    },
    {
      title: 'Simple Sharing',
      description: 'Share files with anyone using secure links that you control.',
      icon: Share2,
      iconColor: 'text-purple-600',
    },
    {
      title: 'Flexible Credits',
      description: 'Pay only for what you use with our credit-based system.',
      icon: CreditCard,
      iconColor: 'text-orange-600',
    },
    {
      title: 'File Management',
      description: 'Organize, preview, and manage your files from any device.',
      icon: FileText,
      iconColor: 'text-red-600',
    },
    {
      title: 'Transaction History',
      description: 'Keep track of all your credit purchases and usage.',
      icon: Clock3,
      iconColor: 'text-indigo-700',
    },
  ]

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black">
            Everything you need for the file sharing
          </h2>
          <p className="mt-3 text-gray-600 text-base sm:text-lg">
            CloudShare provides all the tools you need to manage your digital content
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureList.map((feature) => (
            <article
              key={feature.title}
              className="relative rounded-xl border border-gray-200 bg-gray-50 p-6 pt-10 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className={`absolute -top-3 left-5 flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white shadow-sm ${feature.iconColor}`}>
                <feature.icon className="h-4 w-4" strokeWidth={2} />
              </div>

              <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
