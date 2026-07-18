import './App.css'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/footer'
import HomePage from './pages/home'
import AboutPage from './pages/about'
import SkillPage from './pages/skill'
import ProjectsPage from './pages/projects'
import ContactPage from './pages/contact'

function App() {
  return (
    <ThemeProvider>
      <div className="app-shell">
        <Navbar />
        <main>
          <section id="home"><HomePage /></section>
          <section id="about"><AboutPage /></section>
          <section id="skills"><SkillPage /></section>
          <section id="projects"><ProjectsPage /></section>
          <section id="contact"><ContactPage /></section>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default App
