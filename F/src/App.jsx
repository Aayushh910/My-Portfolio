import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, Suspense, lazy } from 'react'
import './App.css'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/footer'

// Lazy-loaded routes (including non-critical Projects and Contact pages)
const HomePage = lazy(() => import('./pages/home'))
const AboutPage = lazy(() => import('./pages/about'))
const SkillPage = lazy(() => import('./pages/skill'))
const ProjectsPage = lazy(() => import('./pages/projects'))
const ContactPage = lazy(() => import('./pages/contact'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function PageFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{
        width: '36px',
        height: '36px',
        border: '3px solid rgba(110, 143, 123, 0.2)',
        borderTopColor: '#285943',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function Layout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <Suspense fallback={<PageFallback />}>
          {children}
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/about" element={<Layout><AboutPage /></Layout>} />
          <Route path="/skills" element={<Layout><SkillPage /></Layout>} />
          <Route path="/projects" element={<Layout><ProjectsPage /></Layout>} />
          <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
