import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import '../components/theme.css'
import './App.css'
import './site.css'
import App from './App.jsx'
import AboutPage from './routes/AboutPage.jsx'
import ServicePage from './routes/ServicePage.jsx'
import AdminPage from './routes/AdminPage.jsx'
import ChatWidget from './components/ChatWidget.jsx'
import InstallPrompt from './components/InstallPrompt.jsx'
import MobileBar from './components/MobileBar.jsx'
import { registerServiceWorker } from './lib/pwa'

registerServiceWorker()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services/:slug" element={<ServicePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      <ChatWidget />
      <MobileBar />
      <InstallPrompt />
    </BrowserRouter>
  </StrictMode>,
)
