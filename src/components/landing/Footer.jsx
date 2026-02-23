import React from 'react'

const Footer = () => {
  return (
    <footer className="pt-2 pb-0">
      <div className="w-full">
        <div className="overflow-hidden border border-slate-700 bg-[#111a2e]">
          <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500"></div>
          <div className="py-8 text-center">
            <p className="text-sm sm:text-base text-slate-200">
              © 2026 DropZone. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
