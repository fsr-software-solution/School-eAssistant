import React, { useState } from 'react';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white font-bold text-sm">SA</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                School e-Assistant
              </h1>
              <p className="text-xs text-gray-400">AI Tutor</p>
            </div>
          </div>

          {/* Main Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 font-medium">
              Feature Highlights
            </a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors duration-300 font-medium">
              How It Works
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors duration-300 font-medium">
              Everything You Need
            </a>
            <a href="#contact" className="text-gray-300 hover:text-white transition-colors duration-300 font-medium">
              Get Started
            </a>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="px-6 py-2 text-gray-300 hover:text-white transition-colors duration-300 font-medium border border-white/20 rounded-full hover:border-white/40">
              Sign In
            </button>
            <a href="#contact" className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 inline-block">
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white transition-colors duration-300 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-b border-white/10">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-gray-300 hover:text-white transition-colors duration-300 font-medium py-2">
                Feature Highlights
              </a>
              <a href="#how-it-works" className="block text-gray-300 hover:text-white transition-colors duration-300 font-medium py-2">
                How It Works
              </a>
              <a href="#pricing" className="block text-gray-300 hover:text-white transition-colors duration-300 font-medium py-2">
                Everything You Need
              </a>
              <a href="#contact" className="block text-gray-300 hover:text-white transition-colors duration-300 font-medium py-2">
                Get Started
              </a>
              <div className="pt-4 border-t border-white/10 space-y-3">
                <button className="w-full px-6 py-2 text-gray-300 hover:text-white transition-colors duration-300 font-medium border border-white/20 rounded-full hover:border-white/40">
                  Sign In
                </button>
                <a href="#contact" className="w-full px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-full transition-all duration-300 hover:scale-105 inline-block text-center">
                  Get Started
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;