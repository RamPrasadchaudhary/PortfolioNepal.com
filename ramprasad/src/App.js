import React, { useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import EmailDebugPanel from "./components/EmailDebugPanel";
import Profile from "./components/Profile";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";
import Gallery from "./components/Gallery";
import Services from "./components/Services";
import ScrollToTop from "./components/ScrollToTop";
function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    // 2. This is now using HashRouter internally
    <Router>
      <ScrollToTop />
      <div className={darkMode ? "dark" : ""}>
        <ErrorBoundary>
          <Navbar />
          <main className="content-area">
            <Routes>
              <Route path="/" element={
                <>
                  <Hero />
                  <About />
                  <Skills />
                  <Projects />
                  <Services/>
                  <Contact />               
                </>
              } />
              {/* These routes will now work even if you refresh the page */}
              <Route path="/about" element={<About />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/debug" element={<EmailDebugPanel />} />
            </Routes>
          </main>
          <Footer />
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;