import { ClerkProvider } from '@clerk/clerk-react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

createRoot(document.getElementById('root')).render(

  <ClerkProvider publishableKey={clerkPubKey}>
    <App />
  </ClerkProvider>
)
