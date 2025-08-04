import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import LandingPage from './components/LandingPage'
import GamePage from './components/GamePage'
import GamePageMultiplayer from './components/GamePageMultiplayer'
import Footer from './components/Footer'
import Contact from './components/Contact'
import Support from './components/Support'
import Settings from './components/Settings';
import { SettingsProvider } from './contexts/SettingsContext'
import { LanguageProvider } from './contexts/LanguageContext'

function App() {
  const [showContact, setShowContact] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  return (
    <LanguageProvider>
      <SettingsProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <Header />
              <div className="flex-1 flex flex-col">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/solo" element={<GamePage />} />
                <Route path="/game/:gameId" element={<GamePageMultiplayer />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
            <Footer
              onContactClick={() => setShowContact(true)}
              onSupportClick={() => setShowSupport(true)}
            />
            {showContact && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
                  onClick={() => setShowContact(false)}
                />
                <div className="relative z-10">
                  <Contact onClose={() => setShowContact(false)} />
                </div>
              </div>
            )}
            {showSupport && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
                  onClick={() => setShowSupport(false)}
                />
                <div className="relative z-10">
                  <Support onClose={() => setShowSupport(false)} />
                </div>
              </div>
            )}
          </div>
        </BrowserRouter>
      </SettingsProvider>
    </LanguageProvider>
  )
}

export default App
