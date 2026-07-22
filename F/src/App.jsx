import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import './App.css'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/footer'
import HomePage from './pages/home'
import AboutPage from './pages/about'
import SkillPage from './pages/skill'
import ProjectsPage from './pages/projects'
import ContactPage from './pages/contact'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function Layout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main>{children}</main>
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
