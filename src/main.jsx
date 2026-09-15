import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import '../components/theme.css'
import App from './App.jsx'
import AboutPage from './routes/AboutPage.jsx'
import ServicePage from './routes/ServicePage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services/:slug" element={<ServicePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
