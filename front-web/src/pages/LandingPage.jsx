import React from 'react';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
            School e-Assistant
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
            Your AI Tutor, Powered by Your Textbooks
          </p>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Ask any question and get instant, accurate answers based on your school curriculum – complete with page references.
          </p>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-blue-400 mb-4">Textbook‑Grounded AI</h3>
              <p className="text-gray-300 leading-relaxed">
                Every answer is retrieved directly from your school textbooks – no generic internet knowledge.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Smart Retrieval (RAG)</h3>
              <p className="text-gray-300 leading-relaxed">
                Our system finds the most relevant sections using vector search, just like a search engine for your books.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-2xl font-bold text-pink-400 mb-4">Page References</h3>
              <p className="text-gray-300 leading-relaxed">
                Always know where the information comes from – answers include textbook page numbers for easy verification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center text-3xl font-bold text-blue-400 mb-6 border-2 border-blue-400/30">
              1
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-white">Ask a Question</h3>
            <p className="text-gray-400">
              Type any question related to your textbook – from math problems to history facts.
            </p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center text-3xl font-bold text-purple-400 mb-6 border-2 border-purple-400/30">
              2
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-white">AI Searches Textbooks</h3>
            <p className="text-gray-400">
              Our RAG engine instantly finds the most relevant sections across all your books.
            </p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-pink-500/20 rounded-full flex items-center justify-center text-3xl font-bold text-pink-400 mb-6 border-2 border-pink-400/30">
              3
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-white">Get Accurate Answers</h3>
            <p className="text-gray-400">
              Receive a clear answer with page references, plus optional quizzes and resources.
            </p>
          </div>
        </div>
      </div>

      {/* More Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Everything You Need
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition">
            <div className="text-3xl mb-3">🧠</div>
            <h3 className="text-xl font-bold text-blue-400 mb-2">Personalized Quizzes</h3>
            <p className="text-gray-400">AI generates practice questions based on the sections you're studying.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-xl font-bold text-purple-400 mb-2">Progress Tracking</h3>
            <p className="text-gray-400">See which units and sections you've completed at a glance.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition">
            <div className="text-3xl mb-3">🔗</div>
            <h3 className="text-xl font-bold text-pink-400 mb-2">Multi‑Grade Levels</h3>
            <p className="text-gray-400">Works with elementary to high school textbooks – all in one place.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="text-xl font-bold text-blue-400 mb-2">AI Powered</h3>
            <p className="text-gray-400">State‑of‑the‑art language models ensure high‑quality, safe responses.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition">
            <div className="text-3xl mb-3">📁</div>
            <h3 className="text-xl font-bold text-purple-400 mb-2">Resource Library</h3>
            <p className="text-gray-400">Access extra learning materials and external references suggested by AI.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition">
            <div className="text-3xl mb-3">🔐</div>
            <h3 className="text-xl font-bold text-pink-400 mb-2">Secure & Role‑Based</h3>
            <p className="text-gray-400">Admins manage content; students have private progress and sessions.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">500+</h2>
            <p className="text-gray-400 uppercase tracking-wider">Schools & Institutions</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
            <h2 className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">150K+</h2>
            <p className="text-gray-400 uppercase tracking-wider">Questions Answered</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
            <h2 className="text-4xl md:text-5xl font-bold text-pink-400 mb-2">98%</h2>
            <p className="text-gray-400 uppercase tracking-wider">Accuracy Rate</p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center border-t border-white/10">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
          Ready to Transform Learning?
        </h2>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Join thousands of students who already use School e-Assistant to study smarter.
        </p>
        <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-full text-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50" onClick={() => window.location.href = '/login'}>
          Get Started Now
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-gray-500 text-sm">
        <p>© 2025 School e-Assistant. All rights reserved. Powered by Gemini AI & RAG.</p>
      </footer>
    </div>
  );
}

export default LandingPage;