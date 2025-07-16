import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import GamePage from './components/GamePage'
import Footer from './components/Footer'
import Contact from './components/Contact'
import Support from './components/Support'

function App() {
  const [showContact, setShowContact] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex flex-col">
        <GamePage />
      </div>
      <Footer
        onContactClick={() => setShowContact(true)}
        onSupportClick={() => setShowSupport(true)}
      />

      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay for closing */}
          <div
            className="absolute inset-0 bg-opacity-30 backdrop-blur-sm"
            onClick={() => setShowContact(false)}
          />
          {/* Contact modal */}
          <div className="relative z-10">
            <Contact onClose={() => setShowContact(false)} />
          </div>
        </div>
      )}

      {showSupport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay for closing */}
          <div
            className="absolute inset-0 bg-opacity-30 backdrop-blur-sm"
            onClick={() => setShowSupport(false)}
          />
          {/* Contact modal */}
          <div className="relative z-10">
            <Support onClose={() => setShowSupport(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
