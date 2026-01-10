import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
    <Router>
      <ScrollToTop />
      <div className={darkMode ? "dark" : ""}>
        <ErrorBoundary>
          
          {/* Navbar stays at the top of every page */}
          <Navbar />

          <main className="content-area">
            <Routes>
              {/* 1. Main Landing Page (All-in-one view) */}
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

              {/* 2. Individual Pages (Standalone views) */}
              <Route path="/about" element={<About />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* 3. The Details Page we built */}
              <Route path="/profile" element={<Profile />} />
                 <Route path="/gallery" element={<Gallery />} />
              {/* 4. Hidden Debug Route */}
              <Route path="/debug" element={<EmailDebugPanel />} />
             
            </Routes>
          </main>

          {/* Footer stays at the bottom of every page */}
          <Footer />
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;