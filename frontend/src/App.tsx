import './App.css'
import Header from './components/Header'
import GamePage from './components/GamePage'
import Footer from './components/Footer'

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex flex-col">
        <GamePage />
      </div>
      <Footer />
    </div>
  )
}

export default App
